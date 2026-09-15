---
name: stacked-pr
description: 'Splits the commits sitting on top of origin''s default branch into a chain of dependent pull requests using GitHub''s native stacked pull requests feature (the `gh stack` CLI extension, or the "Create stack" / "Add to stack" options on github.com). Use when a branch has accumulated more than one logically-independent change since it last merged, or when the user says "stacked PR", "stack this", "split into a PR stack". Do NOT use when there is only one coherent change to ship — open a normal PR instead.'
metadata:
  author: Richard Sebold (with Claude)
  version: 2.0.0
---

# Stacked PR

Turn N commits sitting on top of `origin/<default-branch>` into N branches and N pull requests, each targeting the branch below it, using GitHub's native **stacked pull requests** feature (public preview since 2026-07-30). GitHub links the PRs into a stack, shows a stack map in the merge box, runs CI and branch-protection checks for every layer against the stack's base branch, and merges the whole stack bottom-up as a single atomic operation. Do not hand-roll this with plain `git branch` + `gh pr create --base` — that was this skill's old approach and it re-implements, worse, what GitHub now does natively (see "Why not the manual approach" below).

## When to use it

A branch has kept moving after its own PR merged (fixes, chores, a new feature all landing as follow-up commits on the same branch), and those commits are not one coherent change. Splitting them into separate PRs, based on `main`, would work too — stacking is the right call specifically when the commits are meant to land **in order** and reviewing them independently is more valuable than reviewing them together.

Skip this for a single coherent change, however many commits it has — that's one PR.

## Prerequisites

- Stacked pull requests require no enablement — if the repo already uses pull requests, this works today. All PRs in a stack must live in the **same repository**; cross-fork stacks are not supported.
- The CLI workflow needs the `gh stack` extension (`gh` itself is not required — you can also do everything from the website):
  ```bash
  gh extension install github/gh-stack
  ```

## Creating a stack (CLI)

1. **Find what's actually unmerged**, same as before:
   ```bash
   git fetch origin
   git log --oneline origin/main..HEAD
   ```
2. **Group the commits into slices, in commit order.** Each slice becomes one branch, one PR. A slice is "one thing a reviewer can approve on its own" — a chore, a fix, a feature. Slice 1 is the oldest commits, slice 2 sits on top of it, and so on. Don't split a single feature's commits across slices.
3. **Initialize the stack from existing commits.** `gh stack init` adopts existing branches or creates missing ones; point it at the trunk if it isn't the repo default:
   ```bash
   gh stack init --base main <slice-1-branch>
   ```
   If the commits aren't on separate branches yet, create them first at the right SHAs, then run `gh stack init` naming them in order:
   ```bash
   git branch <slice-1-branch> <sha-ending-slice-1>
   git branch <slice-2-branch> <sha-ending-slice-2>   # descendant of slice-1's sha
   gh stack init <slice-1-branch> <slice-2-branch>
   ```
4. **Push branches and open the PRs, linked as a stack, in one step:**
   ```bash
   gh stack submit
   ```
   Interactive by default (an editor to review/edit each PR's title, description, and draft/ready state); use `--auto` in CI or non-interactive contexts, `--open` to mark everything ready for review.

`gh stack submit` creates every PR with the correct base branch **and** links them together into a GitHub-native stack — the stack map, CI-on-every-layer, and bottom-up merge behavior below all come from that link, not just from the base branches lining up.

## Creating a stack from the website (no CLI)

1. Create the first PR as usual, base targeting `main`.
2. Create the next PR with its base set to the first PR's branch, and select **Create stack** to link them.
3. Repeat for each additional PR, each based on the one before it.

## Turning an existing PR chain into a stack

If PRs already exist with bases chained to each other (e.g. leftover from the old manual workflow), GitHub shows a **recommendation banner** on the eligible PRs offering to link them into a stack — open the banner, review the preview, confirm. Equivalent from the CLI:
```bash
gh stack link <branch-or-pr-1> <branch-or-pr-2> ...   # bottom to top, by branch name, PR number, or PR URL
```

## Adding to an existing stack

- **CLI**, from the top branch of the stack: `gh stack add <branch-name>`, then commit and `gh stack submit`.
- **Website**: open any PR in the stack → stack icon → **Add to stack**, pick the head branch, create the PR.

## Merging

Stacks merge **bottom-up**, as a single atomic operation, and support merge commit, squash, and rebase methods:
```bash
gh stack merge          # interactive: pick how far up the stack to merge
gh stack merge <PR#>    # merge everything from the bottom up to and including this PR
gh stack merge --yes --squash
```
Equivalent on the website: merge the PR you want to land — everything below it in the stack lands with it in one operation, and PRs still open above it are automatically retargeted to the stack base.

You cannot merge a mid-stack PR in isolation; the PRs below it always come with it. Before a PR can merge, **every PR below it** must also pass required reviews, required status checks, and CODEOWNERS — all evaluated against the stack's base branch (`main`), not the branch it directly targets.

If the stack has lost a linear history (a lower branch got new pushes, or `main` moved ahead), a **Rebase stack** button appears in the merge box (or run `gh stack rebase` then `gh stack push`, or `gh stack sync` to do fetch+rebase+push+PR-sync in one command) before merging is possible.

## CI on a stacked PR

GitHub Actions workflows triggered by `pull_request` events targeting the default branch run for **every** PR in the stack, not just the bottom one — no workflow changes needed, and no "CI won't run until this PR is retargeted to main" gap like the old manual `--base` approach had. Stack metadata (position, base) is available via `github.event.pull_request.stack` in workflow expressions if you want to skip expensive jobs on non-bottom layers.

## Why not the manual approach

This skill used to hand-roll stacking with plain `git branch` + `gh pr create --base <previous-branch>`, deliberately avoiding a stacking tool. That approach is superseded now that GitHub has a first-party one, and it had two real problems the native feature fixes:

- **CI silently didn't run** on non-bottom PRs until they were retargeted to `main` (their `pull_request` trigger only matches the branch they're literally based on). Native stacks evaluate CI against the stack base for every layer.
- **The "merge base PR → dependent PR should retarget" behavior was unreliable via `gh pr merge --delete-branch`.** This repo hit it firsthand (2026-09-14): merging PR #4 with `gh pr merge --delete-branch` closed dependent PR #5 outright instead of retargeting it to `main`, and GitHub refused to reopen it because its base branch was already gone (`cli/cli#14223`). Recovery required opening a fresh PR (#7) for the same head branch. Native stacks don't depend on that head-branch-deletion side effect at all — merging is a single atomic operation across the stack, and the CLI/website handle retargeting explicitly.

If you're migrating an old manually-chained PR set from before this skill was rewritten, use "Turning an existing PR chain into a stack" above rather than merging them one by one with `--delete-branch`.

## Sources

- [About stacked pull requests](https://docs.github.com/en/pull-requests/get-started/about-stacked-prs) — concept, availability, rebasing.
- [Creating stacked pull requests](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-stacked-pull-requests) — CLI and website creation flows, turning existing chains into stacks.
- [Merging stacked pull requests](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/merging-stacked-pull-requests) — bottom-up merge semantics, merge queue.
- [Stacked pull requests (reference)](https://docs.github.com/en/pull-requests/reference/stacked-pull-requests) — trunks, branch protection/CI evaluation against stack base, merge requirements, linear history.
- [Stacked pull requests CLI commands](https://docs.github.com/en/pull-requests/reference/stacked-prs-cli-commands) — full `gh stack` command reference.
- [Roll out stacked pull requests to your organization](https://docs.github.com/en/pull-requests/tutorials/roll-out-stacked-prs) — "requires no setup or enablement," CI/branch-protection notes.
- [`gh pr merge --delete-branch: dependent PR closed instead of auto-retargeted` — cli/cli#14223](https://github.com/cli/cli/issues/14223) — the bug that motivated moving off the manual `--base` workflow.
