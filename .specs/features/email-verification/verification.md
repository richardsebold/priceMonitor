# Email verification verification

**Verdict**: PASS
**Profile**: light
**Diff range**: `80c35ea..8b27e64` (full feature; fix scope is `99058c2..8b27e64`)
**Round**: 2 - scoped
**Verifier**: independent sub-agent (author != verifier)

## Scope of this round

Round 1 (`verification.md` at `b7fd696`) returned FAIL: `checks.md` C8 and `plan.md`'s then-AC9
claimed a single `error=invalid_token` param covered every failed-link case, but installed
`better-auth@1.4.18` uses `error=token_expired` for an expired token and no error param at all for
an already-verified token's still-valid link; `login-form.tsx` only checked `invalid_token`, so a
real expired-link click showed no message. Two commits landed since: `99058c2` (records the round 1
report, no code) and `8b27e64` (the fix). Per verify.md's "Re-verifying after a fix": this round is
scoped to the fix's diff (`99058c2..8b27e64`, covering `login-form.tsx`, `plan.md`, `checks.md`) plus
the one thing that was not PASS (the AC9/C8 gap). Everything else is `carried from b7fd696` below,
not re-investigated.

## Step 1 (binding sources) and Step 4 (fault injection)

`carried from b7fd696`. Both are gated to profiles `ui` / `standard`/`ui` by verify.md's "Read the
profile first" section. `checks.md` still declares `Profile: light` (unchanged by the fix), so
neither runs. No binding-source cross-check and no mutation testing are claimed below.

## Manual-proof checks (C4-C8): method note

`carried from b7fd696`. This repo has no component-test or e2e-test harness, and `AGENTS.md`
mandates manual Playwright-MCP validation for UI changes instead of automated UI tests. As in round
1, a live browser session against the app (which needs the remote Neon `DATABASE_URL`) was not
driven for this scoped round; C7-C8 were re-verified by reading the actual component code
(`src/components/login-form.tsx`) and, for the library-dependent claim, by independently re-opening
the installed `better-auth@1.4.18` source under `node_modules/better-auth/dist` - not by trusting
round 1's citations secondhand. This is code inspection, not a re-run browser session.

## Proofs run at HEAD (`8b27e64849442cac251a561b892ae86345095b75`)

Full suite re-run at the new HEAD, per verify.md's "Proofs always re-run in full, at the new HEAD."

- `npx tsc --noEmit`: exit 0, no output (nothing to filter for `^skills/`).
- `npx vitest run`: `Test Files 20 passed (20)`, `Tests 98 passed (98)` - identical counts to round
  1, consistent with the fix touching only `login-form.tsx` (a component with no test file; `find
  src -iname "*login-form*"` returns only the component itself) plus two spec docs.
- `python3 .../validate_plan.py email-verification`: `0 error(s), 0 warning(s)`.
- `python3 .../validate_checks.py email-verification`: `0 error(s), 8 warning(s)` - the 8 warnings
  (manual proofs cite no vitest selector; three Coverage rows omit a `(N)` set-size) are pre-existing
  structural notes about the `light`-profile manual checks and un-sized rows, unrelated to the fix's
  diff; none is new.

## Checks (C1-C6, C9: carried from b7fd696; C7-C8 re-verified at new citations)

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | `requireEmailVerification` active; gates sign-in/sign-up | `npx vitest run src/lib/auth.test.ts -t "requireEmailVerification"` exit 0 | `src/lib/auth.test.ts:6`; wired at `src/lib/auth.ts:11` | PASS (carried from b7fd696) |
| C2 | `emailVerification` sends on sign-up, 3600s expiry, auto-signs-in | `npx vitest run src/lib/auth.test.ts -t "emailVerification"` exit 0 | `src/lib/auth.test.ts:10-12`; wired at `src/lib/auth.ts:12` | PASS (carried from b7fd696; only the AC label in `checks.md`'s prose changed, from "usada na AC9" to "que produz a AC10" - a renumbering-only edit, no behavioral claim changed) |
| C3 | Delivery failure doesn't block sign-up, is logged | `npx vitest run src/modules/identity/domain/send-verification-email.test.ts -t "does not throw when delivery fails"` exit 0 | `src/modules/identity/domain/send-verification-email.test.ts:10,13`; wired at `src/lib/auth-email-verification.ts:12` | PASS (carried from b7fd696) |
| C4 | Sign-up without session shows confirmation, no navigate | Code inspection (manual Playwright per `AGENTS.md`, not re-run live) | `src/components/signup-form.tsx:72-79,103-119` | PASS (carried from b7fd696) |
| C5 | 403 `EMAIL_NOT_VERIFIED` shows message + resend | Code inspection | `src/components/login-form.tsx:77-80,201-213` | PASS (carried from b7fd696) |
| C6 | Resend fires a new verification e-mail | Code inspection | `src/components/signup-form.tsx:90-101`, `src/components/login-form.tsx:89-98` | PASS (carried from b7fd696) |
| C7 | Login page auto-redirects to `/dashboard` when a session already exists | Code inspection | `src/components/login-form.tsx:43,45-49` - `authClient.useSession()`; `useEffect` calling `router.replace("/dashboard")` when `!isSessionPending && session` | PASS - re-verified at new HEAD. Only the `checks.md` AC citation moved (old AC10 -> AC11, pure renumbering); code and line numbers unchanged from round 1 |
| **C8** | Login page shows the invalid/expired-link message for **both** `error=invalid_token` **and** `error=token_expired` | Code inspection (manual Playwright per `AGENTS.md`, not re-run live) | `src/components/login-form.tsx:40-42` - `const verificationLinkError = searchParams.get("error"); const linkExpired = verificationLinkError === "invalid_token" or verificationLinkError === "token_expired";`; render unchanged at `:195-199` (`"Esse link de verificação é inválido ou expirou..."`, gated by `linkExpired`) | PASS - the fix, verified at `8b27e64` (see next section for independent re-derivation of the two error strings) |
| C9 | Backfill marks `emailVerified=true` only for pre-cutover users | `npx vitest run src/modules/identity/infra/backfill-legacy-verified-users.test.ts -t "backfill"` exit 0 | `src/modules/identity/infra/backfill-legacy-verified-users.test.ts:28-30`; cutover literal at `src/modules/identity/infra/backfill-legacy-verified-users.ts:5` | PASS (carried from b7fd696; only the `checks.md`/`plan.md` AC label moved, old AC12 -> AC13, pure renumbering) |

## The fix, independently re-derived against ground truth

Re-opened `node_modules/better-auth/dist/api/routes/email-verification.mjs` myself (not trusting
round 1's citation secondhand):

- `:161-168` - the `verifyEmail` handler tries `jwtVerify(token, ...)`; on failure:
  `if (e instanceof JWTExpired) return redirectOnError("token_expired");` (line 166) else
  `return redirectOnError("invalid_token");` (line 167). `redirectOnError` (lines 154-160) appends
  `?error=${error}` (or `&error=${error}`) to `ctx.query.callbackURL` and throws a redirect.
- `:262-267` - for a token that verifies but whose user is already `emailVerified === true`:
  `if (user.user.emailVerified) { if (ctx.query.callbackURL) throw ctx.redirect(ctx.query.callbackURL); return ctx.json({status:true,user:null}); }`
  - a plain redirect to `callbackURL` with **no** error query param and no session created (this
    branch returns before the `autoSignInAfterVerification` block further down).

This independently reproduces the exact two-error-string split round 1 found (`token_expired` for an
expired token via `JWTExpired`, `invalid_token` for a malformed/tampered one via the generic catch
branch) and the harmless silent-redirect behavior for an already-verified reopened link.
`login-form.tsx:41-42` now checks for both strings with `||`, so both the expired-link case (the
common one, since tokens expire in 3600s) and the tampered-token case now render the "link inválido
ou expirou" message. The already-verified case correctly gets no message (there's no error to show;
the plan's own note explains why it doesn't need one - see Coverage below).

## Coverage - recomputed for the row the fix touched

| Set (size) | Recomputed from | Member -> proof | Unproven |
| --- | --- | --- | --- |
| `GET /api/auth/verify-email` outcomes (4) | installed `better-auth@1.4.18` source, re-read independently above | 1. valid token -> session + redirect `/login`: C2 (config) + C7 (session-present redirect on next load). 2. malformed/tampered -> `?error=invalid_token`: C8 (`login-form.tsx:41`). 3. expired -> `?error=token_expired`: C8 (`login-form.tsx:42`, the fix). 4. already-verified reopened link -> plain redirect, no error, no session: documented exemption, `plan.md:68` | - |

Sub-case 4 needs no check: `plan.md:68`'s "Corrigido na verificação" note explicitly names it and
calls it harmless (user just lands back on `/login` normally), and the ground-truth read above
confirms the code matches that description exactly - the same status it had before this round.

Round 1 found sub-case 3 (expired token) unproven, and the code not actually implementing the
promised behavior for it (`login-form.tsx` checked only `invalid_token`). The fix closes it:
sub-case 3 now has a located assertion (`login-form.tsx:42`), and `checks.md`'s Coverage row text
was updated to match (`token expirado → redirect ... existing (better-auth), tratado na UI por C8`).

All other Coverage rows: `carried from b7fd696` (unaffected by the fix's diff - no other row's
authority or membership changed).

## Swept re-read (idempotency row: re-verified; rest carried from b7fd696)

`checks.md`'s Swept `idempotency` row now reads differently from round 1's version - it no longer
claims "existing... um token já usado ou já expirado é tratado como inválido pelo próprio
better-auth" as a single undifferentiated case. That specific wording was removed; the distinct
`token_expired` vs `invalid_token` vs already-verified outcomes are now carried entirely by the
Coverage row above (which this round confirmed matches the installed library). No remaining Swept
row claims something the ground-truth read contradicts.

Everything else in Swept (`validation`, `failure modes`, `authorization`, `concurrency`, `data
lifecycle`, `state transitions`, `dependency failure`, `observability`) is `carried from b7fd696` -
the fix's diff did not touch any code path those rows describe.

## Cross-reference check (renumbering)

`git diff 99058c2..8b27e64` shows `plan.md`'s AC9 split into AC9 (invalid_token) + AC10
(token_expired), with old AC10/11/12 shifted to AC11/12/13. Checked for stale references:
`rg "AC(9|10|11|12|13)\b"` across the repo (excluding `node_modules`) hits only `checks.md` and this
`verification.md` - both now consistent with the new numbering (`checks.md` C7 -> AC11, C8 -> AC9,
AC10, AC12, C9 -> AC13; Traceability table VERIFY-03 -> `8, 9, 10, 11, 12`, VERIFY-04 -> `13`;
Observable table rows point at AC11/AC12). `validate_plan.py` and `validate_checks.py` (run fresh
above, not trusted from a prior claim) both return 0 errors, confirming no cross-reference the
scripts check is broken by the renumbering.

## Gate

`npx vitest run` - 98 passed, 0 failed
`npx tsc --noEmit` - 0 errors (no `skills/` lines to filter)
`validate_plan.py email-verification` - 0 error(s), 0 warning(s)
`validate_checks.py email-verification` - 0 error(s), 8 warning(s) (pre-existing, unrelated to the fix)

## Ranked gaps

None. The round 1 gap (AC9/C8 vs. `token_expired`) is closed: `login-form.tsx:41-42` now handles
both error strings, `checks.md` and `plan.md` were updated to match, and both were independently
re-verified against the installed `better-auth@1.4.18` source rather than against round 1's report.
