# Recuperação de Senha Specification

## Problem Statement

O login (`src/components/login-form.tsx:123-128`) já tem um link "Esqueceu sua senha?" que aponta para `href="#"` e não faz nada. Um usuário que esquece a senha não tem como recuperar o acesso à conta e fica bloqueado. O better-auth já expõe os endpoints necessários (`requestPasswordReset` / `resetPassword`); falta implementar as duas telas e a configuração de envio do e-mail.

## Goals

- [ ] Usuário consegue pedir um e-mail de redefinição de senha a partir do login, em até 2 telas (pedir e-mail → link no e-mail → definir nova senha)
- [ ] O link "Esqueceu sua senha?" do login passa a funcionar
- [ ] A resposta do pedido de reset nunca revela se um e-mail está ou não cadastrado (proteção contra enumeração de contas)

## Out of Scope

| Feature | Reason |
| --- | --- |
| Verificação de e-mail no cadastro | Feature separada, já em andamento em outro worktree (`feat/email-verification-plan`) |
| Troca de senha logado (configurações de conta) | Não solicitado; este spec cobre apenas o fluxo "esqueci minha senha" |
| 2FA, magic link, passkey | Fora do escopo do pedido |
| Tuning de rate limit customizado | Usa o rate limit padrão do better-auth para `/request-password-reset` e `/reset-password` |
| Login automático após redefinir a senha | Decisão do usuário: redirecionar para `/login`, sem sessão automática |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Revogar sessões ativas ao redefinir senha | `revokeSessionsOnPasswordReset: true` em `emailAndPassword` (`src/lib/auth.ts`) | Reset de senha costuma indicar recuperação de conta comprometida; força novo login em todos os dispositivos | y (confirmado com o usuário) |
| Pós-reset | Redireciona para `/login` com toast de sucesso, sem criar sessão | Confirmado com o usuário; é o comportamento do fluxo de referência do better-auth (`resetPassword` não autentica) | y (confirmado com o usuário) |
| Expiração do token de reset | Mantém o default do better-auth (`resetPasswordTokenExpiresIn`: 3600s / 1h) | Nenhum requisito do usuário para um valor diferente; 1h é o padrão documentado | y (assumido) |
| Resposta ao pedir reset | Sempre retorna sucesso genérico ("se o e-mail existir, enviamos um link"), mesmo se a conta não existir | Prática padrão de segurança contra enumeração de contas; alinhado com o próprio comportamento do endpoint `requestPasswordReset` do better-auth | y (assumido) |
| Envio do e-mail dentro de `sendResetPassword` | `void` (fire-and-forget) com `try/catch` logando erro, sem `await` antes de retornar | Documentação do better-auth recomenda não aguardar o envio, para não vazar timing de existência da conta; loga erro para observabilidade (mesmo padrão de `alerting/channels/email.ts`, mas sem await) | y (assumido) |
| Local do template de e-mail | `src/modules/identity/email-templates/email-template-reset-password.tsx` | Reset de senha é domínio do módulo `identity`; `src/lib/auth.ts` importa desse módulo, seguindo o mesmo padrão de `alerting/email-templates/` | y (assumido) |
| Rotas das novas telas | `/forgot-password` (pedir e-mail) e `/reset-password` (definir nova senha, lê `?token=`) | Segue a convenção em inglês já usada por `/login` e `/signup` | y (assumido) |
| Regras de senha na redefinição | Mínimo 8 caracteres + campo de confirmação, igual ao cadastro (`signupSchema`) | Consistência com a validação já usada em `login-signup.ts` | y (assumido) |
| Token inválido/expirado | Página `/reset-password` detecta `?error=INVALID_TOKEN` (redirect do better-auth) e mostra estado de erro com link para pedir um novo e-mail, em vez de mostrar o formulário | Comportamento documentado do endpoint GET `/reset-password/:token` do better-auth, que redireciona com `?error=INVALID_TOKEN` quando o token não existe ou expirou | y (assumido) |

**Open questions:** none — todas resolvidas ou registradas acima.

---

## User Stories

### P1: Pedir redefinição de senha ⭐ MVP

**User Story**: Como usuário que esqueceu a senha, quero pedir um e-mail de redefinição a partir da tela de login, para recuperar o acesso à minha conta.

**Why P1**: É o ponto de entrada do fluxo; sem ele nada mais funciona.

**Acceptance Criteria**:

1. WHEN o usuário clica em "Esqueceu sua senha?" no login THEN o sistema SHALL navegar para `/forgot-password`
2. WHEN o usuário envia um e-mail válido no formulário de `/forgot-password` THEN o sistema SHALL chamar `authClient.requestPasswordReset` com esse e-mail e `redirectTo: "/reset-password"`
3. WHEN a chamada de `requestPasswordReset` é concluída, independentemente de o e-mail existir na base THEN o sistema SHALL exibir a mesma mensagem de sucesso ("se esse e-mail existir, enviamos um link de redefinição")
4. IF o campo de e-mail estiver vazio ou em formato inválido THEN o sistema SHALL bloquear o envio e exibir uma mensagem de validação, sem chamar a API
5. IF a chamada à API falhar por erro de rede/servidor (não relacionado a validação) THEN o sistema SHALL exibir uma mensagem de erro genérica e permitir nova tentativa

**Independent Test**: Acessar `/forgot-password`, enviar um e-mail cadastrado e um e-mail não cadastrado; ambos devem mostrar a mesma mensagem de sucesso.

---

### P1: Definir nova senha a partir do link do e-mail ⭐ MVP

**User Story**: Como usuário que recebeu o e-mail de redefinição, quero definir uma nova senha pelo link recebido, para voltar a acessar minha conta.

**Why P1**: Completa o fluxo — sem essa etapa o pedido de reset não tem efeito prático.

**Acceptance Criteria**:

1. WHEN o usuário abre `/reset-password?token=<token válido>` THEN o sistema SHALL exibir o formulário de nova senha (campo senha + confirmação)
2. WHEN o usuário envia uma nova senha válida e confirmada THEN o sistema SHALL chamar `authClient.resetPassword({ newPassword, token })`
3. WHEN `resetPassword` retorna sucesso THEN o sistema SHALL revogar as demais sessões ativas do usuário (`revokeSessionsOnPasswordReset: true`), exibir um toast de sucesso e redirecionar para `/login`
4. IF a nova senha e a confirmação não coincidirem THEN o sistema SHALL bloquear o envio e exibir mensagem de validação, sem chamar a API
5. IF a nova senha tiver menos de 8 caracteres THEN o sistema SHALL bloquear o envio e exibir mensagem de validação, sem chamar a API
6. IF o usuário abrir `/reset-password` sem `token` ou com `?error=INVALID_TOKEN` (token inválido/expirado, conforme redirect do better-auth) THEN o sistema SHALL exibir um estado de erro explicando que o link expirou ou é inválido, com um link para `/forgot-password`
7. IF a chamada a `resetPassword` retornar erro do servidor (ex.: token consumido entre a abertura da página e o envio) THEN o sistema SHALL exibir a mensagem de erro retornada e não redirecionar

**Independent Test**: Gerar um token real pedindo reset, abrir o link, definir uma nova senha e confirmar login com a nova senha; testar também `/reset-password` sem token e com `?error=INVALID_TOKEN`.

---

### P2: Envio do e-mail de redefinição

**User Story**: Como usuário, quero receber um e-mail com visual consistente com os outros e-mails do produto, contendo o link de redefinição.

**Why P2**: Necessário para o fluxo funcionar de ponta a ponta, mas é configuração/infra em vez de uma tela nova — menor risco de ambiguidade que as duas stories acima.

**Acceptance Criteria**:

1. WHEN o better-auth precisa enviar um e-mail de redefinição THEN o sistema SHALL usar `sendResetPassword` em `src/lib/auth.ts` para montar e disparar o e-mail via `sendEmail` (`src/lib/email.ts`)
2. WHEN o e-mail é montado THEN o sistema SHALL usar um template React Email próprio (`email-template-reset-password.tsx`) com o link de redefinição (`url`) recebido do better-auth
3. IF o envio do e-mail falhar (erro do Resend ou exceção) THEN o sistema SHALL logar o erro no servidor e não deve propagar a falha para a resposta HTTP do pedido de reset (a resposta ao cliente continua sendo o sucesso genérico da story P1)

**Independent Test**: Disparar um pedido de reset em ambiente local e conferir no log/Resend que o e-mail foi enviado com o link correto.

---

## Edge Cases

- IF o token já foi usado uma vez (consumido) THEN uma segunda tentativa de `resetPassword` com o mesmo token SHALL falhar com erro do servidor (comportamento nativo do better-auth: consumo atômico do token)
- IF o usuário pede reset várias vezes seguidas THEN o sistema SHALL depender do rate limit padrão do better-auth para o endpoint `/request-password-reset` (sem lógica customizada adicional)
- WHEN o usuário já está autenticado e acessa `/forgot-password` ou `/reset-password` THEN o sistema SHALL exibir a página normalmente (sem bloqueio), já que redefinir a senha é uma ação legítima mesmo logado

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| PWDRESET-01 | P1: Pedir redefinição de senha | Execute | Verified |
| PWDRESET-02 | P1: Pedir redefinição de senha | Execute | Verified |
| PWDRESET-03 | P1: Pedir redefinição de senha | Execute | Verified |
| PWDRESET-04 | P1: Pedir redefinição de senha | Execute | Verified |
| PWDRESET-05 | P1: Pedir redefinição de senha | Execute | Verified |
| PWDRESET-06 | P1: Definir nova senha | Execute | Verified |
| PWDRESET-07 | P1: Definir nova senha | Execute | Verified |
| PWDRESET-08 | P1: Definir nova senha | Execute | Verified |
| PWDRESET-09 | P1: Definir nova senha | Execute | Verified |
| PWDRESET-10 | P1: Definir nova senha | Execute | Verified |
| PWDRESET-11 | P1: Definir nova senha | Execute | Verified |
| PWDRESET-12 | P1: Definir nova senha | Execute | Verified |
| PWDRESET-13 | P2: Envio do e-mail de redefinição | Execute | Verified |
| PWDRESET-14 | P2: Envio do e-mail de redefinição | Execute | Verified |
| PWDRESET-15 | P2: Envio do e-mail de redefinição | Execute | Verified |

**ID format:** `PWDRESET-NN`

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 15 total, 15 mapped to stories, 0 unmapped

---

## Success Criteria

- [ ] Usuário com conta existente consegue: pedir reset → receber e-mail → clicar no link → definir nova senha → logar com a nova senha
- [ ] Usuário sem conta cadastrada recebe a mesma mensagem de sucesso ao pedir reset (sem vazar existência da conta)
- [ ] Link "Esqueceu sua senha?" do login (`login-form.tsx:123-128`) leva a `/forgot-password`
- [ ] Token expirado/inválido mostra estado de erro claro, sem quebrar a tela
- [ ] `npx tsc --noEmit` (ignorando `skills/`) e `npm test` passam
