# Verificação de e-mail no cadastro

Sources:

- conversation - pede verificação de e-mail no cadastro, mantendo better-auth; docs atuais consultadas via Context7 (`/better-auth/better-auth`)

## Problem

Hoje qualquer e-mail digitado no formulário de cadastro (`src/components/signup-form.tsx`) vira conta ativa e sessão autenticada na hora — `emailAndPassword.requireEmailVerification` está `false` em `src/lib/auth.ts:12` e a coluna `User.emailVerified` (`prisma/schema.prisma:26`) nunca é usada. Alguém pode se cadastrar com um e-mail que não é dele (erro de digitação ou de propósito) e ainda assim usar a conta e receber os alertas de preço nela.

Quando isso for entregue, um cadastro só terá login liberado depois de confirmar clicando num link enviado por e-mail; usuários que já existem no banco não são afetados.

## Out of scope

| Excluded | Why |
| --- | --- |
| Fluxo de "esqueceu minha senha" | Já existe como link `href="#"` no login, não faz parte deste pedido |
| Tela dedicada `/verify-email` | O GET que o better-auth já expõe (`/api/auth/verify-email`) confirma o token e redireciona sozinho; uma tela própria duplicaria isso sem necessidade |
| Exigir verificação em login social (Google) | O better-auth já trata o e-mail do provedor OAuth como confiável e não aplica `requireEmailVerification` a login social; mudar isso é uma decisão maior, não pedida aqui |
| Cooldown/rate limit customizado para reenvio | Sem requisito de produto para um limite diferente do limitador padrão por IP já embutido no better-auth |
| Avisar usuários existentes por e-mail sobre a mudança | O backfill (ver Landing) torna a mudança invisível para quem já tem conta; não foi pedido um comunicado |

## Assumptions

| Assumption | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Login automático após clicar no link de verificação | `autoSignInAfterVerification: true` | Padrão de mercado (o botão elimina uma etapa manual); nenhuma desvantagem quando o link é aberto no mesmo navegador do cadastro | n |
| Onde oferecer reenvio do e-mail de verificação | Na tela de confirmação pós-cadastro e no erro 403 do login | São os dois pontos onde o usuário fica travado e precisa de uma saída | n |
| Duração do token de verificação | Padrão do better-auth, 3600s (1h) | Nenhum requisito de produto pede um valor diferente | n |
| `callbackURL` da verificação | `/login` | O GET de verificação redireciona para essa URL tanto no sucesso quanto na falha (`?error=invalid_token` ou `?error=token_expired`, conforme o better-auth 1.4.18 instalado); precisa ser uma rota pública e sempre alcançável, o que `/dashboard` não garante quando falha e não há sessão | n |
| Usuários que já existem no banco (Neon, produção) | Backfill único marcando `emailVerified = true` para quem já existia antes do corte; só cadastros novos passam a precisar verificar | Decisão do usuário: anistiar a base atual em vez de travar login de assinantes pagantes sem aviso | y |

**Open questions:** none - all resolved or logged above.

## Criteria

### S1: Cadastro passa a exigir verificação (P1)

**Acceptance Criteria**

1. WHEN um usuário envia o formulário de cadastro com um e-mail novo THEN o sistema SHALL criar o `User` com `emailVerified` igual a `false` e SHALL NOT abrir uma sessão autenticada para ele.
2. WHEN um `User` é criado pelo cadastro por e-mail/senha THEN o sistema SHALL enviar um e-mail de verificação com um link válido por 3600 segundos.
3. IF o envio do e-mail de verificação falhar (ex.: erro do Resend) THEN o sistema SHALL ainda assim retornar sucesso na resposta do cadastro e SHALL registrar a falha de envio no log do servidor.
4. WHEN o cadastro é concluído sem sessão THEN a tela de cadastro SHALL substituir o formulário por uma mensagem de confirmação pedindo para checar o e-mail, sem navegar para `/dashboard`.

**Independent test:** cadastrar um e-mail novo e observar: nenhuma sessão criada, um e-mail de verificação chega, a tela mostra a mensagem de confirmação em vez de redirecionar.

### S2: Login bloqueado até verificar, com reenvio (P1)

**Acceptance Criteria**

5. WHEN um usuário tenta entrar com e-mail e senha corretos mas `emailVerified` é `false` THEN o sistema SHALL responder com HTTP 403 e o código `EMAIL_NOT_VERIFIED`.
6. WHEN o formulário de login recebe o erro 403 de e-mail não verificado THEN a UI SHALL mostrar uma mensagem oferecendo reenviar o e-mail de verificação para o endereço digitado.
7. WHEN o usuário pede o reenvio (na tela de confirmação pós-cadastro ou no erro de login) THEN o sistema SHALL enviar um novo e-mail de verificação usando o mesmo fluxo de token de 3600 segundos.

**Independent test:** tentar logar com uma conta não verificada, ver o 403 e a oferta de reenvio; clicar em reenviar e receber um novo e-mail.

### S3: Confirmação do link e redirecionamento (P1)

**Acceptance Criteria**

8. WHEN um usuário abre um link de verificação válido e não expirado THEN o sistema SHALL marcar `emailVerified` como `true`, SHALL criar uma sessão autenticada para esse usuário e SHALL redirecionar para `/login`.
9. IF o token do link for inválido ou adulterado THEN o sistema SHALL redirecionar para `/login?error=invalid_token` sem criar sessão.
10. IF o token do link estiver expirado THEN o sistema SHALL redirecionar para `/login?error=token_expired` sem criar sessão.
11. WHEN a página de login carrega e já existe uma sessão ativa THEN o sistema SHALL redirecionar imediatamente para `/dashboard`.
12. WHEN a página de login carrega com `error=invalid_token` ou `error=token_expired` na URL THEN a UI SHALL exibir uma mensagem explicando que o link é inválido ou expirou e convidando a entrar novamente para receber um novo.

**Corrigido na verificação (2026-09-15):** os critérios 9 e 10 eram um único critério que assumia um só código de erro (`invalid_token`) para token inválido, já usado ou expirado. O better-auth 1.4.18 instalado usa dois códigos distintos — `invalid_token` para token malformado/adulterado e `token_expired` para token expirado — então o critério foi dividido em dois e a UI (critério 12) passou a tratar ambos. Um link para um e-mail já verificado (reenvio do mesmo link) apenas redireciona ao `callbackURL` sem parâmetro de erro e sem sessão; isso é inofensivo (o usuário só volta para `/login` normalmente) e não ganhou critério próprio.

**Independent test:** clicar num link de verificação válido e cair logado no dashboard; abrir um link expirado e ver a mensagem de erro no login.

### S4: Usuários existentes não são afetados (P1)

**Acceptance Criteria**

13. The system SHALL tratar todo `User` criado antes do corte desta feature como `emailVerified = true`, via backfill único, de modo que nenhum usuário atual seja bloqueado no login por esta mudança.

**Independent test:** após o backfill e a ativação da flag, uma conta que já existia antes do corte continua logando normalmente sem passar por verificação.

## Traceability

| ID | Slice | Criteria | Status |
| --- | --- | --- | --- |
| VERIFY-01 | S1 | 1, 2, 3, 4 | Pending |
| VERIFY-02 | S2 | 5, 6, 7 | Pending |
| VERIFY-03 | S3 | 8, 9, 10, 11, 12 | Pending |
| VERIFY-04 | S4 | 13 | Pending |

## Observable

| Surface | Decision | Landing |
| --- | --- | --- |
| screen cadastro (`signup-form.tsx`) | estado de sucesso sem sessão (confirmação) | AC 4 |
| screen cadastro (`signup-form.tsx`) | estado de erro | existing - toast já usado hoje para erros do `signUp.email` |
| screen cadastro (`signup-form.tsx`) | estado vazio/carregando | existing - spinner de `isSubmitting` já implementado |
| screen cadastro (`signup-form.tsx`) | ação destrutiva confirma antes | n/a - cadastro não tem ação destrutiva |
| screen login (`login-form.tsx`) | estado de erro (e-mail não verificado) | AC 6 |
| screen login (`login-form.tsx` / `login/page.tsx`) | estado de erro (link inválido/expirado via query) | AC 12 |
| screen login | sessão já ativa ao carregar | AC 11 |
| screen login | estado vazio | n/a - formulário, não há lista |
| API `POST /api/auth/sign-up/email` (better-auth) | forma da resposta e códigos | AC 1, AC 3 |
| API `POST /api/auth/sign-in/email` (better-auth) | forma da resposta e códigos | AC 5 |
| API `GET /api/auth/verify-email` (better-auth) | forma da resposta e códigos | AC 8, AC 9, AC 10 |
| API `POST /api/auth/send-verification-email` (better-auth) | forma da resposta e códigos | AC 7 |
| API (todas acima) | quem pode chamar | existing - endpoints públicos do better-auth, sem mudança de autorização |
| API (todas acima) | versionamento | n/a - endpoints internos do better-auth, sem contrato de versão próprio |
| API (todas acima) | comportamento no rate limit | existing - limitador padrão por IP do better-auth, sem customização pedida |

## Flow

Reaproveita o pipeline nativo do better-auth (`emailAndPassword` + `emailVerification`) de ponta a ponta — cadastro, bloqueio de login, GET de verificação e reenvio já existem como rotas internas do better-auth expostas por `src/app/api/auth/[...all]/route.ts`. Nenhuma rota nova é criada; só mudam `src/lib/auth.ts`, o template de e-mail e as telas de cadastro/login.

1. Formulário de cadastro (`signup-form.tsx`, exists) → `authClient.signUp.email` → `POST /api/auth/sign-up/email` (exists, gerenciado pelo better-auth) → cria `User` com `emailVerified=false`, sem sessão; dispara `sendVerificationEmail` (door 1, novo callback em `src/lib/auth.ts`) que chama `sendEmail` (`src/lib/email.ts`, exists) com um novo template de e-mail de verificação (new, colocação por convenção do módulo `identity`).
2. Formulário de cadastro (exists) - quando o sucesso não vem com sessão, renderiza uma confirmação em vez de navegar, com uma ação de reenvio chamando `authClient.sendVerificationEmail`.
3. Formulário de login (`login-form.tsx`, exists) → `authClient.signIn.email` → `POST /api/auth/sign-in/email` (exists) → responde 403 `EMAIL_NOT_VERIFIED` quando não verificado; o formulário de login (exists) mostra a mesma ação de reenvio nesse erro.
4. Link do e-mail → `GET /api/auth/verify-email` (exists, gerenciado pelo better-auth) → valida o token, marca `emailVerified=true`, cria sessão (autoSignInAfterVerification) e redireciona para `/login` (sucesso) ou `/login?error=invalid_token` / `/login?error=token_expired` (falha).
5. Página de login (`login/page.tsx` / `login-form.tsx`, exists) → ao carregar, verifica se já existe sessão e redireciona para `/dashboard`; lê `error=invalid_token` ou `error=token_expired` na URL e mostra a mensagem correspondente.
6. Backfill único (door 2) → linhas de `User` criadas antes do corte recebem `emailVerified=true`, executado uma vez antes de a flag `requireEmailVerification` entrar em produção.

## Relations

`None - no stored-data shape change` (`User.emailVerified` e a tabela `Verification` já existem no schema atual, só passam a ser usadas).

## Surface

| Route | In | Out | Status |
| --- | --- | --- | --- |
| `POST /api/auth/sign-up/email` (better-auth) | `name`, `email`, `password`, `callbackURL` | `user` (`emailVerified:false`), sessão só quando não exigida | `200` |
| `POST /api/auth/sign-in/email` (better-auth) | `email`, `password` | sessão ou erro | `200`, `403` |
| `GET /api/auth/verify-email` (better-auth) | `token`, `callbackURL` (query) | redirecionamento | `302` |
| `POST /api/auth/send-verification-email` (better-auth) | `email`, `callbackURL` | confirmação | `200`, `429` |

Essas quatro rotas já existem, geridas pelo better-auth via `src/app/api/auth/[...all]/route.ts`; esta feature muda o comportamento delas por configuração (`requireEmailVerification`, `sendVerificationEmail`), não o código da rota.

## Landing

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| Backfill de usuários existentes | Script/SQL único, rodado uma vez, imediatamente antes de ativar `requireEmailVerification: true`: `UPDATE "User" SET "emailVerified" = true WHERE "emailVerified" = false AND "createdAt" < '<timestamp fixado na hora de escrever o script>';` — o timestamp é um literal fixo no momento da escrita, não `now()`, para que uma reexecução acidental depois do corte não marque como verificado um cadastro novo genuinely não verificado | Exigir verificação de todo mundo no próximo login (sem backfill) — rejeitada pela decisão do usuário: bloquearia assinantes pagantes existentes sem aviso |

- Nada mais nesta mudança é difícil de reverter: `requireEmailVerification`, o template de e-mail e os estados de tela são configuração/código comuns.

## Impact

| Front | What changes |
| --- | --- |
| domain | termo existente: sessão autenticada (login) — hoje concedida a qualquer par e-mail/senha correto; passa a exigir também `emailVerified=true`. Afeta o login web (`login-form.tsx`) e o login da extensão de navegador, que usa a mesma rota `POST /api/auth/sign-in/email` (liberada só para o plano Hacker via `canUseBrowserExtension`, `src/app/api/add-product/route.ts`) |
| domain | termo existente: `User.emailVerified` (`prisma/schema.prisma:26`) — coluna já existe mas era inerte; passa a ser condição de login |
| stored data | backfill único para linhas existentes no corte (ver Landing); nenhuma migração de schema é necessária — `User.emailVerified` e a tabela `Verification` já existem |
| stored data | sessões já ativas no momento do deploy não são afetadas — a flag só passa a valer para tentativas de login futuras, não revoga sessões abertas |
