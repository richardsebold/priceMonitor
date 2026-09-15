# Verificação de e-mail no cadastro checks

Profile: light
Plan: `.specs/features/email-verification/plan.md`

9 checks in 4 slices · 1 one-way door · 0 open, of which 0 block

## Checks

Grouped by slice do plano; numeração corre por toda a feature.

### S1 - Cadastro passa a exigir verificação · 3 files · ~10 KB · ~3k

**C1** - `requireEmailVerification` ativo em `emailAndPassword` — cadastro por e-mail/senha não abre sessão sem verificação (VERIFY-01 AC1; também prova VERIFY-02 AC5, que depende da mesma flag)
Proof: `npx vitest run src/lib/auth.test.ts -t "requireEmailVerification"`

**C2** - a configuração `emailVerification` envia o e-mail no cadastro, expira o token em 3600s e loga o usuário automaticamente após verificar (VERIFY-01 AC2; também prova VERIFY-03 AC8 e governa a janela de expiração que produz a AC10)
Proof: `npx vitest run src/lib/auth.test.ts -t "emailVerification"`

**C3** - uma falha no envio do e-mail de verificação (ex.: Resend indisponível) não impede o retorno de sucesso do cadastro, e é registrada no log (VERIFY-01 AC3)
Proof: `npx vitest run src/modules/identity/domain/send-verification-email.test.ts -t "does not throw when delivery fails"`

**C4** - quando o cadastro retorna sem sessão, a tela substitui o formulário pela confirmação "confira seu e-mail" em vez de navegar para `/dashboard` (VERIFY-01 AC4)
Proof: Manual — Playwright MCP: cadastrar um e-mail novo em `/signup`; observar que a tela mostra a confirmação sem navegar e que `/dashboard` redireciona para `/` (nenhuma sessão foi criada)

### S2 - Login bloqueado até verificar, com reenvio · 2 files · ~14 KB · ~4k

**C5** - o erro 403 `EMAIL_NOT_VERIFIED` no login mostra uma mensagem com a ação de reenviar o e-mail de verificação (VERIFY-02 AC6)
Proof: Manual — Playwright MCP: tentar logar em `/login` com uma conta não verificada e observar a mensagem com o botão de reenvio

**C6** - pedir reenvio, tanto na confirmação pós-cadastro quanto no erro de login, dispara um novo e-mail de verificação com sucesso (VERIFY-02 AC7)
Proof: Manual — Playwright MCP: clicar em "reenviar e-mail de verificação" nos dois pontos de entrada e observar a confirmação de envio

### S3 - Confirmação do link e redirecionamento · 2 files · ~8 KB · ~2k

**C7** - a página de login redireciona automaticamente para `/dashboard` quando já existe uma sessão ativa ao carregar (VERIFY-03 AC11)
Proof: Manual — Playwright MCP: abrir um link de verificação válido, cair em `/login` já autenticado e observar o redirect automático para `/dashboard`

**C8** - a página de login mostra a mensagem de link inválido/expirado quando a URL traz `error=invalid_token` ou `error=token_expired` (VERIFY-03 AC9, AC10, AC12)
Proof: Manual — Playwright MCP: navegar para `/login?error=invalid_token` e para `/login?error=token_expired`, e observar a mensagem nos dois casos

### S4 - Usuários existentes não são afetados · 2 files · ~4 KB · ~1k

**C9** - o backfill marca `emailVerified=true` apenas para usuários criados antes do corte, deixando de fora um usuário criado depois (VERIFY-04 AC13)
Proof: `npx vitest run src/modules/identity/infra/backfill-legacy-verified-users.test.ts -t "backfill"`

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| auth config gates sessão/login (1) | C1 | - |
| `emailVerification` shape (1) | C2 | - |
| falha de envio isolada (1) | C3 | - |
| porta Landing: backfill de usuários existentes (1) | C9 | - |
| tela de cadastro sem sessão (1) | C4 | - |
| erro 403 + reenvio no login (1) | C5 | - |
| reenvio dispara novo e-mail (1) | C6 | - |
| login redireciona com sessão ativa (1) | C7 | - |
| login mostra link inválido/expirado (1) | C8 | - |
| `POST /api/auth/sign-up/email` status (1) | `200` - existing (better-auth), sem sessão quando não verificado gated by C1 | - |
| `POST /api/auth/sign-in/email` status | `200` - existing (caminho inalterado) · `403` - existing (better-auth) gated by C1 | - |
| `GET /api/auth/verify-email` outcomes | válido → sessão + redirect `/login` - existing (better-auth) gated by C2 · token inválido/adulterado → redirect `/login?error=invalid_token` - existing (better-auth), tratado na UI por C8 · token expirado → redirect `/login?error=token_expired` - existing (better-auth), tratado na UI por C8 · e-mail já verificado (link reaberto) → redirect sem erro e sem sessão - existing (better-auth), inofensivo | - |
| `POST /api/auth/send-verification-email` status | `200` - existing (better-auth) gated by C2 · `429` - existing (limitador padrão por IP do better-auth) | - |

- As quatro rotas acima são geridas pelo better-auth (`src/app/api/auth/[...all]/route.ts`); seus status codes não têm proof própria porque a mudança de comportamento vem inteiramente da configuração provada em C1/C2 — testar o status novamente seria retestar a biblioteca
- Nenhum outro check afirma mais do que o caso único que sua proof exercita

## Swept

- validation: n/a - e-mail/senha já validados pelo `signupSchema` (zod) existente; o token de verificação é opaco e validado internamente pelo better-auth
- failure modes: C3
- idempotency: existing - um token já usado ou já expirado é tratado como inválido pelo próprio better-auth; nenhuma lógica de dedupe própria é adicionada
- authorization: existing - os quatro endpoints do better-auth já são públicos por natureza (sign-up/sign-in/verify/resend); o limitador padrão por IP do better-auth já cobre o reenvio, sem customização
- concurrency: n/a - nenhuma escrita concorrente própria é introduzida; a transição de `emailVerified` é uma única operação feita pelo better-auth
- data lifecycle: C9 (backfill único dos usuários existentes); a expiração do token (3600s) é coberta por C2
- dependency failure: C3
- state transitions: existing - `emailVerified` só vai de `false` para `true`, nunca o inverso, aplicado internamente pelo better-auth e habilitado por C1/C2
- observability: C3 (log da falha de envio); os demais fluxos não têm requisito de log além do que o better-auth já emite

## Handoff

Intended split, com a aritmética:

- Todo o feature (config de `src/lib/auth.ts`, dois módulos pequenos e puros em `identity/domain` e `identity/infra`, um script de backfill, e edições em `signup-form.tsx` / `login-form.tsx` / `login/page.tsx`) soma ~10 arquivos e bem menos de 40 KB de diff total — ÷4 fica muito abaixo do budget de 150k. Builder único, sem handoff.

- **Boundary:** C1-C9 fechados em `b79f8f7` (feature completa em 4 commits sobre `1a44490`/`e80062c`: `a145158`, `d34c596`, `c22a53d`, `b79f8f7`)
- **Settled mid-build:** validação manual das telas (C4-C8) autorizada explicitamente contra o Neon remoto, incluindo criar uma conta de teste nova e alternar `emailVerified` só em contas de teste — nada disso rodou o backfill real nem tocou usuários reais; a conta nova foi apagada e a conta de teste principal (`claude.teste@botmonitorador.test`) devolvida ao estado não verificado ao final
- **Abandoned:** nenhum
