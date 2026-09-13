# botMonitorador — Monitorador de Preços

SaaS que monitora preços de produtos em e-commerces brasileiros (Amazon, Mercado Livre, Shopee, Magalu e qualquer loja com JSON-LD/Open Graph). O sistema avisa o usuário por e-mail quando o preço atinge a meta ou cai 10% ou mais.

**Stack:**
- Next.js 16 (App Router, Server Actions)
- React 19 e Tailwind com shadcn/ui
- Prisma 7 com PostgreSQL (Neon)
- better-auth (e-mail/senha e Google)
- Resend com React Email
- AbacatePay (assinaturas)
- Puppeteer/Chromium (scraping)
- Vitest

@AGENTS.md

## Comandos

```bash
npm run dev            # servidor local em :3000
npm test               # Vitest (src/**/*.test.ts)
npx tsc --noEmit       # type-check; ignore os erros de skills/ (ver Armadilhas)
npx eslint src         # lint só do app
npm run build          # build de produção (usado no Dockerfile e no CI)
npx prisma generate    # regenera o client em generated/prisma (roda no postinstall)
npm run abacatepay:setup  # cadastra os planos como produtos na AbacatePay
```

## Arquitetura: módulos por bounded context

O código de negócio fica em `src/modules/<contexto>/`. Cada módulo corresponde a um subdomínio e tem um vocabulário próprio.

| Módulo | Tipo | Responsabilidade | Termos |
|---|---|---|---|
| `price-tracking` | **Core** | Scraping, produtos monitorados, histórico de preços, detecção de eventos de preço | produto, preço, meta (`priceTarget`), `targetReached`, histórico |
| `alerting` | Supporting | Decidir e entregar notificações (e-mail, Telegram), preferências, registros `Alert` | alerta, `TARGET_REACHED`, `PRICE_DROP`, canal |
| `billing` | Supporting | Planos, limites por plano, assinatura AbacatePay, webhook, reembolso/cancelamento | plano, assinatura, reembolso, janela de 7 dias |
| `analytics` | Supporting | Métricas do dashboard (read-model sobre os dados do Core) | economia potencial, maior queda |
| `identity` | Generic | Sessão, dados cadastrais, exclusão de conta (sobre o better-auth) | usuário, sessão |

### Camadas dentro de um módulo

- **`actions/`**: Server Actions (`"use server"`), a API pública que a UI chama. Só exportam funções async.
- **`domain/`**: regras de negócio puras, sem Prisma, sem `next/headers` e sem `"use server"`. É onde ficam os testes unitários mais importantes.
- **`application/`**: orquestração de casos de uso internos, chamada por route handlers. Sem `"use server"`.
- **`infra/`**: acesso a Prisma e a APIs externas (repositórios, cliente AbacatePay). Sem `"use server"`.
- Pastas específicas: `price-tracking/scraping/`, `alerting/channels/`, `alerting/email-templates/`, `identity/schemas/` (zod).

`src/lib/` é infraestrutura compartilhada:
- `prisma.ts` (client)
- `auth.ts` e `auth-client.ts` (better-auth)
- `email.ts`: `sendEmail`, o único ponto que usa o Resend
- `utils.ts`: `cn` do shadcn

`src/app/` contém só rotas e páginas, e `src/components/` a UI, que é transversal aos módulos.

### Regras de fronteira

- Um módulo pode importar de `@/lib/*`, do próprio módulo, do `domain/` e das `actions/` de outro módulo, e de `@/modules/identity/session`. **Nunca** do `infra/` ou `application/` de outro módulo.
- Os route handlers em `src/app/api/` são a *composition root*, o único lugar que liga `application/` de módulos diferentes.
- Para ler o usuário da sessão, use `getSessionUserId()` de `@/modules/identity/session`. Não repita `auth.api.getSession(...)`.
- **As colunas do model `User` pertencem a módulos diferentes.** O schema continua único, mas cada módulo só escreve nas suas colunas, pelo próprio repositório:
  - identity: `name, firstName, lastName, email, phone, cpf, zipCode, address, city, terms, image`
  - billing (`billing/infra/subscription-repository.ts`): `planId, subscriptionStatus, subscriptionStart, subscriptionEnd, abacatepaySubscriptionId, cancellationReason, cancellationComment, refundRequested`
  - alerting (`alerting/infra/notification-repository.ts`): `chatId, priceAlertsEnabled`
  - A leitura do registro completo com `getUser()` é permitida na UI.
- Toda query de produto feita por uma action deve filtrar pelo `userId` da sessão (ver `price-tracking/actions/product-ownership.test.ts`).
- Não crie barrels (`index.ts`): re-exportar Server Actions confunde a fronteira do `"use server"`. Importe o caminho concreto.

## Fluxos principais

**Verificação de preços (cron):** `GET /api/cron/check-prices`, com `Authorization: Bearer $CRON_SECRET`.
1. A rota chama `runPriceCheckJob({ onPriceEvent: handlePriceEvent })`.
2. Para cada produto, `scrapeProduct` tenta primeiro `fetch` com parse de JSON-LD e meta tags, e cai para o Puppeteer se falhar.
3. O job atualiza o preço, grava `PriceHistory` e ajusta `targetReached`.
4. `detectPriceEvent` classifica o evento. `TARGET_REACHED` tem precedência sobre `PRICE_DROP` (queda de 10% ou mais).
5. `alerting/application/handle-price-event.ts` confere `priceAlertsEnabled`, envia o e-mail e grava o `Alert`.

**Cadastro de produto:**
1. `price-tracking/actions/add-product.ts` verifica o limite com `billing/domain/plan-entitlements.ts#maxTrackedProducts`.
2. Faz o scraping da URL.
3. Cria o `ProductHistory` e o primeiro `PriceHistory`.
4. A extensão de navegador usa a mesma action via `POST /api/add-product`, liberada só para o plano Hacker (`canUseBrowserExtension`).

**Assinatura:**
1. `billing/actions/subscription.ts` cria o checkout na AbacatePay, com `userId` e `planId` em `metadata`.
2. `POST /api/webhooks/abacatepay?webhookSecret=...` passa para `billing/application/handle-webhook-event.ts`, que ativa, renova ou cancela a assinatura.
3. O cancelamento em até 7 dias (`domain/refund.ts`) marca pedido de reembolso e avisa o suporte por e-mail.

## Regras de negócio que valem registrar

- **Os limites de plano ficam em um único lugar, `billing/domain/plan-entitlements.ts`:** Free/sem plano 1, Noob 7, Pro 15, Hacker 30. As telas (`dashboard`, `produtos`) e o servidor usam essa mesma função. Os textos de marketing (`app/page.tsx`, `components/planos.tsx`, `app/help/page.tsx`) ainda divergem desses números.
- A janela de reembolso é de 7 dias a partir de `subscriptionStart` (`billing/domain/refund.ts`).
- A precedência entre eventos de preço e a regra dos 10% estão em `price-tracking/domain/price-events.ts`, com testes.

## Testes

- Vitest em ambiente `node`, com o alias `@` apontando para `src`. Os testes ficam ao lado do código (`*.test.ts`).
- Para actions que usam banco, faça mock com `vi.mock("@/lib/prisma", ...)`. Para sessão, `vi.mock("@/modules/identity/session", ...)`. Veja `analytics/actions/get-potential-savings.test.ts`.
- Priorize testar `domain/`: são funções puras e é onde fica a regra de negócio.

## Armadilhas

- **O `.env` aponta para um banco Neon remoto.** Não rode o cron nem crie ou apague dados localmente sem confirmar com o usuário. O cron faz scraping real e envia e-mails reais.
- **`skills/` é um submódulo git** com exemplos da AbacatePay. Ele tem erros de tipo que aparecem no `tsc` e quebram o `npm run build` local, mas não faz parte do app. Avalie `src/` com `npx tsc --noEmit | grep -v "^skills/"`.
- O client do Prisma é gerado em `generated/prisma/`, fora de `src/`, e é importado por caminho relativo (`../../../../generated/prisma/client`).
- Não mova `src/lib/auth.ts` (o CLI do better-auth procura esse caminho) nem `src/lib/utils.ts` (é o alias `utils` do shadcn em `components.json`).
- `alerting/channels/telegram-bot.ts` está todo comentado: o envio pelo bot do Telegram está desativado, e só a vinculação de `chatId` funciona. `get-products-from-db.ts` e `get-reached-count.ts` não são usados em lugar nenhum. Esses arquivos foram mantidos de propósito.
