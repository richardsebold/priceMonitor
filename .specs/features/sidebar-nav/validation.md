# Sidebar Nav Validation

**Date**: 2026-09-27
**Spec**: `.specs/features/sidebar-nav/spec.md`
**Diff range**: `21d3c22..HEAD` (6680bbe, 1c6c3fb, 63e209b) on `fix/sidebar-nav`
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 2 of 3 (re-verification after fix commit 63e209b)

---

## Verdict: PASS ✅

Iteration 1 was a FAIL because mutant M5 survived: no test proved that the mobile "Sair" item was wired to `authClient.signOut`. Fix commit 63e209b adds a test that finds `ButtonSignOut` inside `MobileNavLinks()` and invokes its `onClick`. It also makes the whole mobile logout row the button, which resolves the earlier UX observation that the icon was not clickable. M5 is now killed.

---

## Task Completion

No tasks.md (Tasks phase skipped). Two inline steps plus one fix.

| Step | Commit | Status | Notes |
| ---- | ------ | ------ | ----- |
| S1: nav items + active route matcher | 6680bbe | ✅ Done | `src/components/sidebar/nav-items.ts` + tests |
| S2: highlight active page, repair mobile menu | 1c6c3fb | ✅ Done | `nav-links.tsx`, `index.tsx`, `button-signout.tsx` + tests |
| Fix 1: mobile logout row is `ButtonSignOut`; test for the signOut wiring | 63e209b | ✅ Done | Kills M5 |

---

## Spec-Anchored Acceptance Criteria

### P1: Destacar a página atual

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| AC1: pathname === href → `aria-current="page"` | `aria-current="page"` on the matching item | `src/components/sidebar/nav-items.test.ts:6` - `expect(isActivePath("/produtos", "/produtos")).toBe(true)`; `src/components/sidebar/nav-links.test.tsx:91` - `expect(active.map(a => [href, aria-current])).toEqual([["/produtos","page"]])` (mobile); `nav-links.test.tsx:158` - `.toEqual([["/alertas","page"]])` (desktop) | ✅ PASS |
| AC2: pathname starts with `href + "/"` → `aria-current="page"` | `/settings/billing` activates `/settings` | `nav-items.test.ts:10` - `expect(isActivePath("/settings/billing", "/settings")).toBe(true)`; `nav-links.test.tsx:102` - `expect(active.map(a => href)).toEqual(["/settings"])` | ✅ PASS |
| AC3: no match → no `aria-current` attribute | attribute absent on the other items | `nav-items.test.ts:14` - `expect(isActivePath("/alertas", "/produtos")).toBe(false)`; `nav-links.test.tsx:91` / `:158` - `toEqual` against a single-element list (the other 5 links carry no attribute) | ✅ PASS |
| AC4: `/produtosx` does not activate `/produtos` | no `aria-current` | `nav-items.test.ts:18` - `expect(isActivePath("/produtosx", "/produtos")).toBe(false)` (components call `isActivePath` directly, `nav-links.tsx:16,48`; M1 killed) | ✅ PASS |
| AC5: desktop active → `bg-accent` + `text-accent-foreground` | both classes present | `nav-links.test.tsx:161` - `expect(active[0].classList.contains("bg-accent")).toBe(true)`; `:162` - `...contains("text-accent-foreground")).toBe(true)`; inactive negative at `:165` | ✅ PASS |
| AC6: mobile active → `text-foreground`, no `text-muted-foreground` | exact class set | `nav-links.test.tsx:94` - `contains("text-foreground")).toBe(true)`; `:95` - `contains("text-muted-foreground")).toBe(false)` | ✅ PASS |

### P1: Menu mobile funcional

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| AC1: mobile renders the 6 links in order | `/dashboard, /produtos, /alertas, /planos, /settings, /help` with labels | `nav-links.test.tsx:77` - `expect(items).toEqual([["/dashboard","Dashboard"], ..., ["/help","Ajuda"]])`; `nav-items.test.ts:32` same list on `NAV_ITEMS` | ✅ PASS |
| AC2: desktop renders the same 6 routes | same hrefs | `nav-links.test.tsx:143` - `expect(hrefs).toEqual(["/dashboard", ..., "/help"])` | ✅ PASS |
| AC3: "Sair" is a `<button>` that calls `authClient.signOut`, not a link | button + signOut wiring | `nav-links.test.tsx:116` - `expect(buttons).toEqual(["Sair"])`; `:117` - `links(...).some(a => a.textContent === "Sair")).toBe(false)`; `:128` - `expect(item).toBeDefined()` (the `ButtonSignOut` element found inside `MobileNavLinks()`); `:135` - `expect(signOut).toHaveBeenCalledTimes(1)` after invoking that element's `onClick` | ✅ PASS |
| AC4: click "Sair" → `signOut`, on success `router.replace("/")` | `signOut` called once; `replace("/")`; no redirect on failure | `nav-links.test.tsx:178` - `expect(signOut).toHaveBeenCalledTimes(1)`; `:179` - `expect(replace).toHaveBeenCalledWith("/")`; `:190` - `expect(replace).not.toHaveBeenCalled()` | ✅ PASS |

**Status**: ✅ All 10 ACs covered with spec-matching assertions. No spec-precision gaps.

---

## Edge Cases

- [x] pathname `/` → no item active: `nav-items.test.ts:22` - `expect(NAV_ITEMS.filter(i => isActivePath("/", i.href))).toEqual([])`
- [x] pathname `null` → no item active, no error: `nav-items.test.ts:26` - `expect(isActivePath(null, "/dashboard")).toBe(false)`; `nav-links.test.tsx:109` - `expect(active).toEqual([])`

Success criterion "exactly one item active on each of the six pages": the unit tests cover `/produtos`, `/alertas` and `/settings/billing`. The orchestrator's UAT confirmed all six routes in the real app (see below).

---

## Discrimination Sensor

Scratch: a temporary `git worktree` at HEAD (63e209b) in the session scratchpad, with a node_modules junction and a copied `generated/`. Quick gate: `npx vitest run src/components/sidebar` (17 tests).

| # | File:line | Description | Iter 1 | Iter 2 |
| - | --------- | ----------- | ------ | ------ |
| M1 | `src/components/sidebar/nav-items.ts:30` | `startsWith(\`${href}/\`)` → `startsWith(href)` | ✅ Killed | ✅ Killed (1 failed) |
| M2 | `src/components/sidebar/nav-links.tsx:22,26` | Desktop: `aria-current` always undefined, active class → `text-muted-foreground` | ✅ Killed | not re-run (code unchanged) |
| M3 | `src/components/button-signout.tsx:22` | Removed `router.replace("/")` | ✅ Killed | ✅ Killed (1 failed) |
| M4 | `src/components/sidebar/nav-items.ts:22` | Swapped href `/alertas` → `/settings` | ✅ Killed | ✅ Killed (5 failed) |
| M5 | `src/components/sidebar/nav-links.tsx:68,71` | Mobile `<ButtonSignOut ...>` → plain `<button ...>` (no signOut) | ❌ Survived | ✅ Killed (1 failed) |
| M6 | `src/components/sidebar/nav-links.tsx:57` | Mobile active class `text-foreground` → `text-muted-foreground` | ✅ Killed | ✅ Killed (1 failed) |
| M7 | `src/components/button-signout.tsx:29` | `onClick={signOut}` → no-op handler | - | ✅ Killed (2 failed) |

**Sensor depth**: lightweight (plus extra mutants)
**Result**: iteration 2 ran 6 mutants and killed all 6. Every mutant from iteration 1 that was re-run is also killed. PASS ✅
**Isolation**: the real worktree's `git status --porcelain` matched the pre-sensor baseline (` M AGENTS.md`, modified by `next dev`, plus the untracked `.specs` validation and lessons files). The scratch worktree was removed, and the junction was removed with `rmdir` first so the shared node_modules was kept.

---

## Interactive UAT Results

The orchestrator ran the visual validation separately, with puppeteer-core against the real app (Chrome, test account, dev server on :3000 from this worktree).

| # | Test | Result | Details |
| - | ---- | ------ | ------- |
| 1 | Desktop active item on each app route | ✅ Pass | On `/dashboard`, `/produtos`, `/alertas`, `/planos`, `/settings` and `/help` there is exactly one `aside a[aria-current]`, it has `bg-accent`, and its href matches the page |
| 2 | Mobile menu contents and order (390px, `/alertas`) | ✅ Pass | The Sheet lists Dashboard, Produtos Rastreados, Alertas [current], Planos, Configurações, Ajuda, then a `button` "Sair" |
| 3 | Mobile navigation | ✅ Pass | Tapping Planos navigates to `/planos` |
| 4 | Mobile logout via the icon | ✅ Pass | Tapping the Sair icon (svg) lands on `/`. `/dashboard` afterwards redirects to `/`, so the session has ended |
| 5 | Visual highlight | ✅ Pass | Screenshots confirm the highlight |
| - | Radix hydration mismatch (Sheet `aria-controls` id) | ⏭️ Out of scope | Pre-existing: 2 errors appear with both the feature sidebar and `main`'s sidebar |

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ One `NAV_ITEMS` table replaces 6 duplicated desktop blocks and 6 mobile links |
| Surgical changes | ✅ `ButtonSignOut` gains optional `children` and `className`, with defaults that keep the old text and `cursor-pointer`. Its only other caller, `src/components/user-menu.tsx:67` (`<ButtonSignOut />`), is unchanged |
| No scope creep | ✅ |
| Matches patterns | ✅ `cn`, shadcn tokens, `"use client"` isolated in `nav-links.tsx`, and `Sidebar` stays a server component |
| Spec-anchored outcome check | ✅ |
| Per-layer coverage | ✅ Pure matcher at 1:1 with AC1-4 and the edge cases; components cover the happy path, subroute, null, classes and the signOut wiring |
| No unclaimed tests | ✅ Every test maps to an AC or edge case |
| Documented guidelines | ✅ `CLAUDE.md` (tests next to the code, Vitest `node` env, no barrels); `AGENTS.md` UI validation done through the UAT above |

The UX observation from iteration 1 (the icon sat outside the button) is resolved in 63e209b: the whole row is now the `<button>` (`nav-links.tsx:68-71`).

---

## Gate Check

- **Gate command**: `npx vitest run && npx tsc --noEmit 2>&1 | grep -v "^skills/" && npx eslint src/components/sidebar src/components/button-signout.tsx`
- **Result**: 129 passed, 0 failed, 0 skipped (25 files). The filtered tsc output was empty. eslint exit 0.
- **Quick gate**: 17 passed (2 files)
- **Test count before feature**: 112 (measured at `21d3c22` = `main`)
- **Test count after feature**: 129
- **Delta**: +17 new tests (7 in `nav-items.test.ts`, 10 in `nav-links.test.tsx`). No tests were removed.
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans

None open. Fix 1 from iteration 1 (the mobile signOut wiring test) was delivered in 63e209b and verified by the M5 kill.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| NAV-01 | Implementing | ✅ Verified |
| NAV-02 | Implementing | ✅ Verified |
| NAV-03 | Implementing | ✅ Verified |
| NAV-04 | Implementing (iter 1: Needs Fix) | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 10/10 ACs matched the spec outcome, with 0 spec-precision gaps
**Sensor**: 6/6 mutations killed (iteration 2); M5 went from survived to killed
**Gate**: 129 passed, tsc clean (src), eslint clean

**What works**: active-route matching (exact, subroute, prefix guard, `/`, null), desktop and mobile active styling with `aria-current`, the six correct routes in order on both menus, and a mobile "Sair" row that is a single button, signs out, and redirects to `/` on success. All of this is confirmed in the real app.

**Issues found**: none open. A pre-existing Radix hydration warning is out of scope.

**Next steps**: open the PR (per `AGENTS.md`, via the `stacked-pr` skill).
