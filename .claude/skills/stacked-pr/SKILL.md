---
name: stacked-pr
description: 'Splits the commits sitting on top of origin''s default branch into a chain of dependent pull requests, each based on the previous one''s branch instead of on main, using plain git + gh (no Graphite). Use when a branch has accumulated more than one logically-independent change since it last merged, or when the user says "stacked PR", "stack this", "split into a PR stack". Do NOT use when there is only one coherent change to ship — open a normal PR instead.'
metadata:
  author: Richard Sebold (with Claude)
  version: 1.0.0
---

# Stacked PR

Turn N commits sitting on top of `origin/<default-branch>` into N branches and N pull requests, each one based on the previous branch, so they can be reviewed and merged independently and in order — without adopting a stacking tool like Graphite.

## When to use it

A branch has kept moving after its own PR merged (fixes, chores, a new feature all landing as follow-up commits on the same branch), and those commits are not one coherent change. Splitting them into separate PRs, based on `main`, would work too — stacking is the right call specifically when the commits are meant to land **in order** and reviewing them independently is more valuable than reviewing them together.

Skip this for a single coherent change, however many commits it has — that's one PR.

## Steps

1. **Find what's actually unmerged.** Compare against the remote default branch, not local `main` (which is very likely stale):
   ```bash
   git fetch origin
   git log --oneline origin/main..HEAD
   ```
2. **Group the commits into slices, in commit order.** Each slice becomes one branch, one PR. A slice is "one thing a reviewer can approve on its own" — a chore, a fix, a feature. Order matters: slice 1 is the oldest commits, slice 2 sits on top of it, and so on. Don't split a single feature's commits across slices.
3. **Create one branch per slice, pointing at that slice's last commit** (not at `HEAD` for every branch):
   ```bash
   git branch <slice-1-branch> <sha-ending-slice-1>
   git branch <slice-2-branch> <sha-ending-slice-2>   # a descendant of slice-1's sha
   ```
4. **Push every branch.**
   ```bash
   git push -u origin <slice-1-branch>
   git push -u origin <slice-2-branch>
   ```
5. **Open the PRs, base pointing at the previous slice's branch — never at `main` past the first one:**
   ```bash
   gh pr create --base main            --head <slice-1-branch> --title "..." --body "..."
   gh pr create --base <slice-1-branch> --head <slice-2-branch> --title "..." --body "..."
   ```
   In every stacked PR's body, say explicitly which PR it's stacked on and that it should merge after it — GitHub does not show this on its own.

## What happens when the base PR merges

GitHub auto-retargets a dependent PR's base branch to the branch the base PR merged into, **but only when the base PR's head branch is actually deleted** after merge — this is a documented, automatic behaviour:

> "If you delete a head branch after its pull request has been merged, GitHub checks for any open pull requests in the same repository that specify the deleted branch as their base branch. GitHub automatically updates any such pull requests, changing their base branch to the merged pull request's base branch."
> — [Merging a pull request](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/merging-a-pull-request)

**Known gap, confirmed from `cli/cli` issue tracking:** merging via `gh pr merge --delete-branch` does not reliably trigger this retargeting in every case — some reports show the dependent PR gets closed instead of retargeted. Prefer merging the base PR through the GitHub web UI with "Delete branch" for the retarget to fire, or verify manually after merging via `gh`:

```bash
gh pr view <dependent-PR> --json baseRefName
# if it's still pointing at the deleted branch:
gh pr edit <dependent-PR> --base main
```

## CI on a stacked PR

If the repo's CI triggers on `pull_request: branches: [main]` (check `.github/workflows/*.yml`), a PR based on anything other than `main` will **not** run CI until it's retargeted there. This is expected, not a broken pipeline — say so in the PR body so a reviewer doesn't go looking for a missing check.

## Worked example (this repo, 2026-09-14)

`fix/price-scraping-plausibility-guard` had 4 unmerged commits after its own PR (#3) merged: one unrelated `chore` commit, then 3 commits for a new feature.

```bash
git branch chore/gitignore-local-skills 3a011f9
git branch feat/weekly-summary 107b1df
git push -u origin chore/gitignore-local-skills
git push -u origin feat/weekly-summary
gh pr create --base main                          --head chore/gitignore-local-skills --title "chore: ..." --body "..."
gh pr create --base chore/gitignore-local-skills   --head feat/weekly-summary          --title "feat: ..."  --body "Stacked on #4 ..."
```
→ [PR #4](https://github.com/richardsebold/priceMonitor/pull/4), [PR #5](https://github.com/richardsebold/priceMonitor/pull/5).

## Sources

- [Merging a pull request — GitHub Docs](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/merging-a-pull-request) — automatic base-branch retargeting on head-branch deletion.
- [`gh pr create` manual — GitHub CLI](https://cli.github.com/manual/gh_pr_create) — `--base`/`--head` flags.
- [`gh pr merge --delete-branch: dependent PR closed instead of auto-retargeted` — cli/cli#14223](https://github.com/cli/cli/issues/14223) — the retargeting gap via `gh`.
