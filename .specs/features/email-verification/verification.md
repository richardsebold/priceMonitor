# Email verification verification

**Verdict**: FAIL
**Profile**: light
**Diff range**: `80c35ea..HEAD`
**Round**: 1 - full
**Verifier**: independent sub-agent (author != verifier)

## Step 1 (binding sources) and Step 4 (fault injection)

Both are gated to profiles `ui` / `standard`/`ui` respectively by verify.md's "Read the profile
first" section. `checks.md` declares `Profile: light`, so neither ran. This is a scope statement,
not a shortcut: at `light`, no binding-source cross-check and no mutation testing are owed, and
none is claimed below.

## Manual-proof checks (C4-C8): method note

This repo has no component-test or e2e-test harness, and `AGENTS.md` mandates manual Playwright-MCP
validation for UI changes instead of automated UI tests. A live browser session could not be driven
inside this verification task, so C4-C8 were verified by reading the actual component code
(`src/components/signup-form.tsx`, `src/components/login-form.tsx`, `src/app/login/page.tsx`) and,
where the claim depends on library behaviour, by reading the installed `better-auth@1.4.18` source
under `node_modules/better-auth/dist` to confirm the condition, redirect target, and message are
genuinely wired the way the check claims. This is code inspection, not a re-run browser session -
noted per check below.

## Proofs run at HEAD

Environment note: this worktree's `node_modules` and `.env` were absent at task start (0 packages
installed). Ran `npm install` and copied `.env` from the repo root (`DATABASE_URL` only, needed for
`prisma generate`/`vitest` to boot) so the suite could execute; no data was written to the remote
Neon database by this action or by any command below.

- `npx tsc --noEmit` (filtered `^skills/`): clean, no output.
- `npx vitest run`: `Test Files 20 passed (20)`, `Tests 98 passed (98)`.
- Each named proof re-run individually and confirmed to exist and pass:
  - `npx vitest run src/lib/auth.test.ts -t "requireEmailVerification"` -> 1 passed, 1 skipped (2) - exit 0
  - `npx vitest run src/lib/auth.test.ts -t "emailVerification"` -> 1 passed, 1 skipped (2) - exit 0
  - `npx vitest run src/modules/identity/domain/send-verification-email.test.ts -t "does not throw when delivery fails"` -> 1 passed, 1 skipped (2) - exit 0
  - `npx vitest run src/modules/identity/infra/backfill-legacy-verified-users.test.ts -t "backfill"` -> 1 passed (1) - exit 0

## Checks

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | `requireEmailVerification` active; unverified sign-in/sign-up-without-session gated | `npx vitest run src/lib/auth.test.ts -t "requireEmailVerification"` exit 0 | `src/lib/auth.test.ts:6` - `expect(emailAndPasswordConfig.requireEmailVerification).toBe(true)`; wiring confirmed at `src/lib/auth.ts:11` - `emailAndPassword: emailAndPasswordConfig` (same object the test imports, not a standalone copy) | PASS |
| C2 | `emailVerification` sends on sign-up, expires in 3600s, auto-signs-in after verification | `npx vitest run src/lib/auth.test.ts -t "emailVerification"` exit 0 | `src/lib/auth.test.ts:10-12` - `expect(emailVerificationConfig.sendOnSignUp).toBe(true)`; `...autoSignInAfterVerification).toBe(true)`; `...expiresIn).toBe(3600)`; wiring confirmed at `src/lib/auth.ts:12` - `emailVerification: emailVerificationConfig` | PASS |
| C3 | Delivery failure does not block sign-up success, and is logged | `npx vitest run src/modules/identity/domain/send-verification-email.test.ts -t "does not throw when delivery fails"` exit 0 | `src/modules/identity/domain/send-verification-email.test.ts:10` - `await expect(sendVerificationEmailSafely(send)).resolves.toBeUndefined()`; `:13` - `expect(consoleErrorSpy).toHaveBeenCalledWith("Falha ao enviar e-mail de verificação:", failure)`; production wiring at `src/lib/auth-email-verification.ts:12` - `void sendVerificationEmailSafely(() => sendEmail(...))` (fire-and-forget, so a rejected send cannot propagate into the sign-up response) | PASS |
| C4 | Sign-up without a session shows the "check your e-mail" confirmation instead of navigating | Code inspection (manual Playwright per `AGENTS.md`; not re-run live) | `src/components/signup-form.tsx:72-79` - `if (ctx.data?.token) { ...; router.replace("/dashboard"); return; } ...; setConfirmationEmail(formData.email);` and `:103-119` - `if (confirmationEmail) { return <Card>...<CardTitle>Confira seu e-mail</CardTitle>...` ; confirmed against `better-auth` source (`node_modules/better-auth/dist/api/routes/sign-up.mjs:205-208`) that `requireEmailVerification: true` makes the endpoint return `{ token: null, ... }`, so `ctx.data?.token` is falsy exactly when no session was created | PASS |
| C5 | 403 `EMAIL_NOT_VERIFIED` on login shows a message with a resend action | Code inspection | `src/components/login-form.tsx:75-80` - `if (ctx.error.status === 403) { setUnverifiedEmail(data.email); toast.error("Confirme seu e-mail antes de entrar."); }`; render at `:199-212` (message + "Reenviar e-mail de verificação" button); confirmed against `better-auth` source (`node_modules/better-auth/dist/api/routes/sign-in.mjs:223-235`) that an unverified user is rejected with `APIError("FORBIDDEN", { message: BASE_ERROR_CODES.EMAIL_NOT_VERIFIED })`, which better-call maps to HTTP 403 | PASS |
| C6 | Resend (post-signup confirmation and login error) fires a new verification e-mail | Code inspection | `src/components/signup-form.tsx:90-101` and `src/components/login-form.tsx:87-98` - both call `authClient.sendVerificationEmail({ email, callbackURL: "/login" })` and toast success/error from the response | PASS |
| C7 | Login page auto-redirects to `/dashboard` when a session already exists on load | Code inspection | `src/components/login-form.tsx:41,43-47` - `const { data: session, isPending: isSessionPending } = authClient.useSession(); useEffect(() => { if (!isSessionPending && session) { router.replace("/dashboard"); } }, ...)`; `src/app/login/page.tsx:17-19` wraps `<LoginForm/>` in `<Suspense>` (required because `useSearchParams` is used, see C8) | PASS |
| C8 | Login page shows an invalid/expired-link message when the URL carries `error=invalid_token` | Code inspection | `src/components/login-form.tsx:40` - `const linkExpired = searchParams.get("error") === "invalid_token";`; render at `:193-198` (`"Esse link de verificação é inválido ou expirou..."`) | PASS (narrow claim only - see Swept re-read finding below) |
| C9 | Backfill marks `emailVerified=true` only for users created before the cutover | `npx vitest run src/modules/identity/infra/backfill-legacy-verified-users.test.ts -t "backfill"` exit 0 | `src/modules/identity/infra/backfill-legacy-verified-users.test.ts:28-30` - `expect(updateManyMock).toHaveBeenCalledWith({ where: { emailVerified: false, createdAt: { lt: LEGACY_VERIFIED_CUTOVER } }, data: { emailVerified: true } })`; cutover is a fixed literal at `src/modules/identity/infra/backfill-legacy-verified-users.ts:5` - `new Date("2026-09-15T00:00:00.000Z")` (not `new Date()`), matching the plan's Landing requirement; script wired via `package.json:14` - `"backfill:verified-users": "tsx scripts/backfill-legacy-verified-users.ts"` | PASS |

## Coverage

| Set (size) | Recomputed from | Member -> proof | Unproven |
| --- | --- | --- | --- |
| Full recompute | not run (`light` profile gates this to `standard`/`ui`) | - | - |
| `GET /api/auth/verify-email` outcomes (spot-checked via Swept re-read, see below) | `checks.md` Coverage table + installed `better-auth@1.4.18` source | valid token -> session + redirect `/login`: proof via C2 config + library source, confirmed | - |
| (same row, continued) | | invalid/expired token -> claimed `redirect /login?error=invalid_token`, "existing (better-auth) gated by C2" | **YES - see finding below.** Expired tokens redirect with `error=token_expired`, a different value than the one `login-form.tsx` checks for. A structurally-invalid token does produce `error=invalid_token` (that sub-case is proven); an already-verified-but-not-yet-expired token produces a silent success redirect with **no** error param at all. Only 1 of 3 sub-cases named in plan.md AC9 ("inválido, já usado ou expirado") actually reaches `invalid_token`. |

## Swept re-read (the always-on part of step 3)

`checks.md`'s `Swept` section marks several dimensions `existing`, meaning "better-auth already
provides this, gated by our config." Per the task brief, the gating config itself was confirmed
wired into production, not just a standalone test:

- `src/lib/auth.ts:11-12` imports and passes the **same objects** `auth.test.ts` asserts on
  (`emailAndPasswordConfig`, `emailVerificationConfig` from `src/lib/auth-email-verification.ts`),
  not a copy - so C1/C2 passing is evidence about the object `betterAuth(...)` actually receives.

Re-reading each `existing` row against the installed `better-auth@1.4.18` source
(`node_modules/better-auth/dist/api/routes/{sign-up,sign-in,email-verification}.mjs`):

- **authorization: existing** - confirmed. All four endpoints are public by construction in the
  library; no route-level change was made in this diff.
- **state transitions: existing** - confirmed. `email-verification.mjs` only ever calls
  `updateUserByEmail(parsed.email, { emailVerified: true })`; there is no code path that sets it
  back to `false` in the verification flow.
- **idempotency: existing - "um token já usado ou já expirado é tratado como inválido pelo próprio
  better-auth"** - **NOT confirmed; this is a finding.** Reading
  `node_modules/better-auth/dist/api/routes/email-verification.mjs:154-168` and `:262-268`:
  - An expired token (`JWTExpired`) redirects via `redirectOnError("token_expired")` -
    i.e. `?error=token_expired`, not `?error=invalid_token`.
  - An already-verified user's still-valid token (`user.user.emailVerified === true`) hits
    `if (user.user.emailVerified) { throw ctx.redirect(ctx.query.callbackURL); }` - a **silent
    success redirect with no error parameter at all**, not `?error=invalid_token`.
  - Only a structurally-malformed/bad-signature token (the generic `catch` branch) actually
    produces `?error=invalid_token`.

  **Consequence:** `login-form.tsx:40` only checks
  `searchParams.get("error") === "invalid_token"`. A user who waits more than 3600s and then clicks
  their verification link is redirected to `/login?error=token_expired`, and the login screen shows
  **no error message at all** - not the "link is invalid or expired" message `plan.md`'s S3
  independent test explicitly asks for ("abrir um link expirado e ver a mensagem de erro no
  login"). The claim in `checks.md`'s Coverage table ("inválido/expirado -> redirect
  `/login?error=invalid_token` - existing (better-auth)") is contradicted by the code for the
  "expirado" and "já usado" sub-cases named in `plan.md` AC9.

  This is not a defect in C7 or C8 individually - both check the narrow claims they state (C7:
  session-present redirect; C8: UI reacts correctly to a literal `?error=invalid_token`) and both
  hold up. The gap is that no check in `checks.md` covers the **expired-token** and
  **already-verified-token** redirect outcomes that AC9 explicitly promises, and the Coverage
  table's "existing, gated by C2" label for that row is not actually true of the installed library
  version this repo depends on.

- **failure modes / dependency failure / data lifecycle / observability (all -> C3 or C9)** -
  confirmed, these point at real proofs already listed above.
- **validation / concurrency: n/a** - correctly out of scope; nothing in the code to be wrong
  about.

## Gate

`npx vitest run` - 98 passed, 0 failed
`npx tsc --noEmit | grep -v "^skills/"` - 0 errors

## Ranked gaps

1. **AC9 (plan.md) is unproven for 2 of its 3 named failure modes, and the code does not actually
   implement the promised behaviour for them.** `checks.md`'s Coverage table asserts
   "inválido/expirado -> `/login?error=invalid_token` - existing (better-auth) gated by C2", but
   `better-auth@1.4.18` (the version this repo has pinned and installed) redirects expired tokens
   with `error=token_expired` and silently succeeds (no error param) for an already-verified token's
   still-valid link. `src/components/login-form.tsx:40` only recognizes the literal string
   `"invalid_token"`, so a real expired-link click shows the user nothing - no toast, no message,
   just a plain login form. Evidence: `node_modules/better-auth/dist/api/routes/email-verification.mjs:154-168,262-268`;
   `src/components/login-form.tsx:40`. This is a P1 (S3) criterion per `plan.md:58` and its
   independent test explicitly names the expired-link case.
