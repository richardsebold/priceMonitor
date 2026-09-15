# Recuperação de Senha Validation

**Date**: 2026-09-15
**Spec**: `.specs/features/forgot-password/spec.md`
**Diff range**: `5594bc9..HEAD` (commits `d482a2c`, `7f789eb`, `1bbceb0`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Scope note**: Medium-sized feature per `tlc-spec-driven` auto-sizing — no `tasks.md` was created (Design/Tasks phases legitimately skipped). Verification is anchored directly to `spec.md`'s Acceptance Criteria and Requirement Traceability table (PWDRESET-01..15), as instructed. No automated test files exist for this feature (confirmed: zero `*.test.ts` under `src/modules/identity/`, including for the pre-existing, structurally identical `login-signup.ts` schema) — this is a repo-consistent, deliberate choice, not an oversight. Because there is no test suite to derive assertions from, the "Spec-Anchored Acceptance Criteria" and "Discrimination Sensor" sections below are adapted into a **code-reading trace** against the real implementation, per the task's explicit instructions.

---

## Task Completion

No `tasks.md` exists for this feature (Design/Tasks phases skipped, as expected for Medium scope). N/A.

---

## Spec-Anchored Acceptance Criteria (code-trace, no test files exist)

### P1: Pedir redefinição de senha

| # | Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` — implementation evidence | Result |
| - | -------------------------- | --------------------- | -------------------------------------- | ------ |
| PWDRESET-01 | WHEN clica em "Esqueceu sua senha?" no login THEN navega para `/forgot-password` | `href="/forgot-password"` | `src/components/login-form.tsx:124` — `href="/forgot-password"` (was `href="#"`) | ✅ Traced-in-code |
| PWDRESET-02 | WHEN envia e-mail válido THEN chama `authClient.requestPasswordReset` com email e `redirectTo: "/reset-password"` | exact call shape | `src/components/forgot-password-form.tsx:40-43` — `authClient.requestPasswordReset({ email: data.email, redirectTo: "/reset-password" })` | ✅ Traced-in-code |
| PWDRESET-03 | WHEN a chamada conclui, independente de o e-mail existir THEN exibe a mesma mensagem de sucesso | identical message regardless of account existence | `src/components/forgot-password-form.tsx:45-50` sets `isSent(true)` on any non-error response (no branch reads whether the account exists) → generic message rendered at `:69-73` ("Se esse e-mail estiver cadastrado..."). Server-side confirmation: `node_modules/better-auth/dist/api/routes/password.mjs:50-63` — when `user` is not found, better-auth *simulates* the token generation/DB lookup (timing-attack mitigation) and returns the identical `{status:true, message:"If this email exists..."}` payload as the found-user path (`:70-77`) | ✅ Traced-in-code |
| PWDRESET-04 | IF e-mail vazio/inválido THEN bloqueia envio e exibe validação, sem chamar API | client-side block, no API call | `src/modules/identity/schemas/forgot-password.ts:4-8` — `z.string().min(1,...).email(...)`; wired via `zodResolver(forgotPasswordSchema)` at `forgot-password-form.tsx:35` with `mode:"onChange"` — react-hook-form's `handleSubmit` withholds `onSubmit` (and therefore the API call) until validation passes | ✅ Traced-in-code |
| PWDRESET-05 | IF a API falhar (rede/servidor) THEN exibe erro genérico e permite nova tentativa | error toast, form stays usable | `forgot-password-form.tsx:45-48` — on `error`, `toast.error(...)` then `return`; `isSent` stays `false` so the form re-renders and `isSubmitting` resets, allowing retry | ✅ Traced-in-code |

### P1: Definir nova senha a partir do link do e-mail

| # | Criterion | Spec-defined outcome | `file:line` — implementation evidence | Result |
| - | --------- | --------------------- | -------------------------------------- | ------ |
| PWDRESET-06 | WHEN abre `/reset-password?token=<válido>` THEN exibe formulário de nova senha | form shown when token present | `src/app/reset-password/page.tsx:11-14` reads `token` via `useSearchParams().get("token")`; `src/components/reset-password-form.tsx:69,89` — form branch renders when `token` is truthy | ✅ Traced-in-code |
| PWDRESET-07 | WHEN envia senha nova válida/confirmada THEN chama `authClient.resetPassword({newPassword, token})` | exact call shape | `reset-password-form.tsx:45-48` — `authClient.resetPassword({ newPassword: data.password, token })` | ✅ Traced-in-code |
| PWDRESET-08 | WHEN `resetPassword` retorna sucesso THEN revoga demais sessões (`revokeSessionsOnPasswordReset:true`), toast de sucesso, redireciona `/login` | session revocation flag set + toast + redirect | Flag: `src/lib/auth.ts:15` — `revokeSessionsOnPasswordReset: true`. Server enforcement verified in `node_modules/better-auth/dist/api/routes/password.mjs:161` — `if (ctx.context.options.emailAndPassword?.revokeSessionsOnPasswordReset) await ctx.context.internalAdapter.deleteSessions(userId);` (runs after password update, on success only). Client: `reset-password-form.tsx:55-56` — `toast.success(...)` then `router.push("/login")` | ✅ Traced-in-code |
| PWDRESET-09 | IF senha e confirmação não coincidem THEN bloqueia envio e exibe validação, sem chamar API | client-side block | `src/modules/identity/schemas/reset-password.ts:9-12` — `.refine((d) => d.password === d.password_confirmation, ...)` with `path:["password_confirmation"]`; same `zodResolver` + `handleSubmit` gating as PWDRESET-04 | ✅ Traced-in-code |
| PWDRESET-10 | IF senha < 8 caracteres THEN bloqueia e exibe validação | client-side block | `reset-password.ts:5` — `z.string().min(8, "A senha deve ter no mínimo 8 caracteres")` | ✅ Traced-in-code |
| PWDRESET-11 | IF abre `/reset-password` sem token OU com `?error=INVALID_TOKEN` THEN exibe estado de erro com link para `/forgot-password` | error state in both cases | `reset-password-form.tsx:69-88` renders the error card whenever `!token` (link to `/forgot-password` at `:84`). Verified this correctly covers *both* named cases by reading better-auth's redirect source (`node_modules/better-auth/dist/api/routes/password.mjs:27,114,116`): on invalid/expired token the GET `/reset-password/:token` callback redirects to `${callbackURL}?error=INVALID_TOKEN` **without** a `token` query param, while a valid token redirects with `?token=VALID_TOKEN` and no `error` param — so `!token` is a correct (if implicit) proxy for "no token or invalid/expired token." | ✅ Traced-in-code (⚠️ implicit: code never reads the `error` query param directly; correctness depends on better-auth never emitting both `token` and `error` together, which the source confirms) |
| PWDRESET-12 | IF `resetPassword` retorna erro do servidor THEN exibe a mensagem retornada e não redireciona | show server message, no redirect | `reset-password-form.tsx:50-53` — `toast.error("Erro ao redefinir senha: " + error.message)` then `return` (no `router.push` reached) | ✅ Traced-in-code |

### P2: Envio do e-mail de redefinição

| # | Criterion | Spec-defined outcome | `file:line` — implementation evidence | Result |
| - | --------- | --------------------- | -------------------------------------- | ------ |
| PWDRESET-13 | WHEN better-auth precisa enviar e-mail THEN usa `sendResetPassword` em `src/lib/auth.ts` para disparar via `sendEmail` | wired through `sendEmail` | `src/lib/auth.ts:16-24` — `sendResetPassword: async ({ user, url }) => { void sendEmail({...}).catch(...) }`; `sendEmail` defined at `src/lib/email.ts:8-12`, matching call shape (`to`, `subject`, `react`) | ✅ Traced-in-code |
| PWDRESET-14 | WHEN e-mail é montado THEN usa template React Email próprio com o link `url` do better-auth | template receives `url` | `auth.ts:20` — `react: EmailTemplateResetPassword({ userName: user.name, url })`; `src/modules/identity/email-templates/email-template-reset-password.tsx:16-19,106` — `url` prop used directly as the CTA `Button href={url}` | ✅ Traced-in-code |
| PWDRESET-15 | IF o envio do e-mail falhar THEN loga o erro e não propaga a falha para a resposta HTTP do pedido de reset | error caught, logged, never surfaces to the HTTP response | `auth.ts:17-23` — `sendEmail(...)` is never `await`ed inside `sendResetPassword`; `.catch((error) => console.error(...))` is attached and the async function returns immediately without waiting on that chain, so a rejection can only ever reach the `.catch` logger, never an outer caller. Confirmed better-auth's own caller (`password.mjs:71-75`, `runInBackgroundOrAwait(sendResetPassword(...))`) only ever awaits the (already-resolved) outer promise from `sendResetPassword`, not the inner un-awaited `sendEmail` promise — so even a slow/failing Resend call cannot delay or fail the HTTP response, which is unconditionally `{status:true,...}` (`password.mjs:76-79`) | ✅ Traced-in-code |

**Status**: ✅ 14/15 cleanly traced, 1/15 traced with a flagged implicit-correctness note (PWDRESET-11) — no hard gaps.

---

## Discrimination Sensor — ADAPTED (no automated tests exist to mutate/kill)

No test files exist for this feature or for any of `src/modules/identity/` (verified: `find src/modules/identity -name "*.test.ts"` → empty, including the pre-existing, structurally identical `login-signup.ts` schema — this is the established repo pattern for this module, not a gap introduced by this feature).

Because there is nothing to run a mutation against, this section reports **detectability by any existing mechanism** instead of killed/survived mutants, per the task's explicit instructions:

| Behavior | Would a plausible wrong implementation be caught by anything today? |
| -------- | ---------------------------------------------------------------------- |
| Enumeration leak (branching the success message on account existence) | ❌ Not caught by `tsc`/`eslint` (pure logic, type-valid either way). Only caught by manual QA (documented: author tested both an existing and a non-existent email and observed identical UI) or a future code review. **No automated regression guard.** |
| `revokeSessionsOnPasswordReset` flag silently flipped to `false` or removed | ❌ Not caught by `tsc`/`eslint` — it's a valid boolean either way. Only caught by manual QA (author manually verified a stale session was invalidated) or code review. **No automated regression guard.** |
| Token param mishandled (e.g., reading a wrong query key, or `!token` check inverted) | ⚠️ Partially caught: `tsc` would not catch a logic inversion; `eslint` would not either. Manual QA (author walked the full token lifecycle including reuse-after-consumption) is the only net. **No automated regression guard.** |
| `resetPasswordSchema`'s `.refine()` confirmation-match check removed or weakened | ❌ Not caught by anything automated. Same class of risk as the pre-existing, equally-untested `signupSchema.refine()`. |
| `sendResetPassword` accidentally `await`ing `sendEmail` before returning (reintroducing a timing/enumeration side channel via response latency) | ❌ Not caught by anything automated — a purely behavioral regression that changes timing characteristics, not types. |

**Sensor depth**: N/A — no scratch mutation was run because there is no test target to mutate against. This table is a detectability assessment, not a mutation run.
**Result**: **Regression safety net: ABSENT.** This is the most important finding of this validation — see Findings below. Nothing today prevents a future refactor from silently reintroducing an account-enumeration leak, disabling session revocation on reset, or breaking token handling. `tsc`/`eslint` are type/lint gates only; they cannot see any of these behaviors.

---

## Interactive UAT Results

Not re-run live by the Verifier (would require the running dev server + real Neon dev DB + Playwright, which the author already exercised end-to-end per the task brief). Instead, the Verifier independently re-derived correctness for the security-critical paths (enumeration protection, session revocation, token consumption, fire-and-forget email) directly from source, including cross-referencing the installed `better-auth` package source (`node_modules/better-auth/dist/api/routes/password.mjs`) to confirm the library's actual runtime behavior matches what the spec and code assume. All claims held up (see AC table above). No independent live UAT was performed in this pass.

---

## Code Quality

| Principle | Status | Notes |
| --------- | ------ | ----- |
| No features beyond what was asked | ✅ | Exactly the 2 pages, 2 forms, 2 schemas, 1 email template, and the `auth.ts` config diff described in the spec — no extras |
| No abstractions for single-use code | ✅ | Forms are flat, no premature generalization |
| No unnecessary "flexibility" added | ✅ | — |
| Only touched files required for task | ✅ | Diff matches the file list in the task brief exactly (`git diff 5594bc9..HEAD --stat` — 10 files) |
| Didn't "improve" unrelated code | ✅ | `login-form.tsx` diff is a single-line `href` fix, nothing else touched |
| Matches existing patterns/style | ✅ | `resetPasswordSchema`'s `.refine()` mirrors `login-signup.ts`'s `signupSchema.refine()` (`src/modules/identity/schemas/login-signup.ts:16`) verbatim in structure; forms reuse `zodResolver` + `react-hook-form` + shadcn `Field*` + `BorderBeam` exactly as `login-form.tsx`/signup do; email template reuses the `alerting/email-templates/` visual structure and `Tailwind`/`react-email` component set |
| Would senior engineer approve? | ✅ | Yes |
| Tests map to acceptance criteria and are non-shallow (spot-check one story) | N/A | No tests exist for this feature (by design, consistent with module pattern) — see Discrimination Sensor section for the explicit gap this leaves |
| Spec-anchored outcome check (asserted values match spec) | ✅ | Adapted as code-trace above; all traced values match spec-defined outcomes |
| Per-layer Coverage Expectation met | ⚠️ | Domain logic here is limited to two zod schemas with no unit coverage — flagged as a cheap, worth-adding gap below, not a blocker |
| Every test maps to a spec requirement — no unclaimed tests | N/A | No tests added |
| Documented guidelines followed | ✅ | `CLAUDE.md` module-boundary rule: `email-template-reset-password.tsx` lives under `src/modules/identity/email-templates/`, imported from `src/lib/auth.ts` (shared infra, not another module), mirroring the established `alerting/channels/email.ts` → `alerting/email-templates/*` pattern (`src/modules/alerting/channels/email.ts:3-5`) — no cross-module `infra/`/`application/` import violation |

---

## Edge Cases (from spec.md)

- [x] Token já consumido → segunda tentativa de `resetPassword` falha com erro do servidor: confirmed in `better-auth` source — `deleteVerificationValue` runs immediately after a successful reset (`password.mjs:154`), so a replay's `findVerificationValue` lookup returns nothing → `APIError("BAD_REQUEST", INVALID_TOKEN)` (`password.mjs:148`). Client surfaces this via the generic error-toast path (PWDRESET-12), no crash.
- [x] Rate limit no pedido de reset repetido → depende do default do better-auth: confirmed no custom rate-limit config was added anywhere in `src/lib/auth.ts` or elsewhere in the diff; the endpoint runs under better-auth's built-in defaults untouched.
- [x] Usuário autenticado acessa `/forgot-password` ou `/reset-password` → página normal, sem bloqueio: confirmed no `middleware.ts` exists in the app, and neither `src/app/forgot-password/page.tsx` nor `src/app/reset-password/page.tsx` contains any session check or redirect (unlike `src/app/dashboard/page.tsx`, the only page in the app that does check session) — pages render unconditionally regardless of auth state.

---

## Gate Check

- **Gate commands**: `npx tsc --noEmit` (filtered to exclude lines starting with `skills/`, per `CLAUDE.md`'s documented armadilha), `npx eslint src`
- **tsc result**: 0 errors, 0 output at all (clean; not even any `skills/` noise present currently) — PASS
- **eslint result**: exit 0; 6 pre-existing warnings (`no-unused-vars`) in unrelated files (`login-form.tsx:78` pre-existing unused-var warning unrelated to this feature's one-line `href` change, `alerting/email-templates/email-template.tsx`, `identity/actions/update-user.ts`, `price-tracking/scraping/parse-html.ts`); 0 warnings/errors in any file touched or added by this feature — PASS
- **Supplementary**: `npm test` run for completeness (not required by the adapted gate, but is listed in spec.md's Success Criteria) — 17 test files, 93 tests, all passed. No new tests were added by this feature (consistent with the deliberate no-test-file decision); no regressions in the existing suite.
- **Test count before/after feature**: 93 / 93 — unchanged (no tests added, none removed, none weakened).

---

## Fix Plans (recommended, non-blocking)

### Fix 1: Add a cheap unit test for `resetPasswordSchema`'s `.refine()`

- **Root cause / rationale**: Not a bug — a coverage gap. `resetPasswordSchema` (`src/modules/identity/schemas/reset-password.ts:4-14`) contains the only piece of *pure domain logic* introduced by this feature (the password/confirmation match check), and it currently has zero automated coverage, mirroring the pre-existing gap on `signupSchema`. Per `CLAUDE.md`'s own testing guidance ("Priorize testar `domain/`: são funções puras"), this is exactly the kind of function worth a fast unit test, and it is cheap (a handful of `expect(resetPasswordSchema.safeParse(...).success)` assertions, no mocks needed).
- **Fix task**: Add `src/modules/identity/schemas/reset-password.test.ts` covering: (a) matching passwords ≥ 8 chars → valid; (b) mismatched confirmation → invalid, error path `["password_confirmation"]`; (c) password < 8 chars → invalid.
- **Priority**: Minor (nice-to-have, not a release blocker) — flagged per the task's explicit instruction to call this out if a small test would be cheap and worth adding.

### Fix 2 (informational, no code change needed): Regression safety net is absent for this entire feature

- **Root cause**: By design — no test files were written, consistent with the rest of `src/modules/identity/`.
- **Risk**: A future refactor could silently break the enumeration-protection message, flip `revokeSessionsOnPasswordReset`, or mishandle the token/error query params, and nothing automated would catch it (see Discrimination Sensor table above).
- **Recommendation**: Not a blocker for this PASS verdict — this trade-off was explicitly accepted per the task brief as consistent with existing module conventions — but worth the team's awareness. If the module's testing posture changes in the future, this is one of the highest-value areas to backfill (security-relevant, low domain-logic surface, cheap to test at the schema/domain level even without touching Server Actions or better-auth internals).

---

## Requirement Traceability Update

Update `spec.md` requirement statuses:

| Requirement | Previous Status | New Status |
| ----------- | ---------------- | ---------- |
| PWDRESET-01 | Implementing | Verified |
| PWDRESET-02 | Implementing | Verified |
| PWDRESET-03 | Implementing | Verified |
| PWDRESET-04 | Implementing | Verified |
| PWDRESET-05 | Implementing | Verified |
| PWDRESET-06 | Implementing | Verified |
| PWDRESET-07 | Implementing | Verified |
| PWDRESET-08 | Implementing | Verified |
| PWDRESET-09 | Implementing | Verified |
| PWDRESET-10 | Implementing | Verified |
| PWDRESET-11 | Implementing | Verified |
| PWDRESET-12 | Implementing | Verified |
| PWDRESET-13 | Implementing | Verified |
| PWDRESET-14 | Implementing | Verified |
| PWDRESET-15 | Implementing | Verified |

All 15 requirements traced-in-code with matching implementation. None marked "Needs Fix" — PWDRESET-11's implicit-token-proxy note is a documented design detail, not a functional gap (verified against actual `better-auth` runtime behavior, not assumed).

---

## Summary

**Overall**: ✅ Ready (with flagged, non-blocking gaps)

**Spec-anchored check**: 15/15 ACs traced-in-code and correct (1 traced with an implicit-correctness note, not a gap)
**Sensor**: N/A — no automated tests exist to mutate; detectability-by-any-mechanism assessed instead (see table above)
**Gate**: tsc 0 errors, eslint 0 errors/0 new warnings, `npm test` 93/93 passing (unchanged)

**What works**: Full P1+P2 flow traced end-to-end against real source (both the feature's own code and the installed `better-auth` library internals): login link → request-reset with enumeration-safe generic response → email dispatch (fire-and-forget, error-contained) → token-bearing reset link → new-password form with validation → session revocation on success → redirect to `/login` (no auto-login, matching the explicit user decision) → invalid/expired/consumed-token states all degrade to a clear, non-crashing error UI.

**Issues found**:
1. No regression safety net for this feature (by design, repo-consistent) — flagged, not fixed. See Fix Plans.
2. `resetPasswordSchema`'s `.refine()` would be cheap to unit-test and is the one piece of new pure domain logic — recommended as an optional follow-up, not a blocker.

**Next steps**: Ship as-is. Optionally pick up Fix 1 (schema unit test) in a small follow-up commit if the team wants to start closing the module's testing gap; no other action required.
