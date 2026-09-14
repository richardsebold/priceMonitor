# Ativar alertas reais por Telegram e webhook, corrigir a copy da landing

> Build this with **tlc-implement** (`.claude/skills/tlc-implement`, se vendorizado).
> Every criterion below becomes a check with a proof, referenced by its number. Nothing under
> `Unresolved` gets settled while building.

## Intent

Hoje a landing (`src/app/page.tsx`) e a tela de planos (`src/components/planos.tsx`) prometem cinco capacidades que o código não sustenta: alertas no Telegram (o `chatId` já é vinculado, mas `handlePriceEvent` só envia e-mail), webhooks pro Slack/Discord (não existe nenhum código de webhook de saída), acesso à API, frequência de coleta ajustável e comparação de preço entre lojas. Quem assina o plano Pro ou Hacker paga por um recurso que não existe até descobrir isso na primeira tentativa de uso. O produto ainda não tem usuário pagante, então o custo de continuar assim é herdado inteiro pelo primeiro assinante real.

Depois desta tarefa: um usuário Pro ou Hacker com `chatId` vinculado recebe o alerta de preço também por Telegram; um usuário Hacker que salvar uma `webhookUrl` recebe o mesmo alerta via POST nessa URL, no formato que o Slack e o Discord já sabem renderizar; e a landing/planos deixam de anunciar API pública, frequência ajustável, comparação entre lojas e os benefícios inventados de `planos.tsx` ("Relatórios avançados", "Consultoria técnica", "IP Dedicado").

17 criteria in 4 slices · 5 one-way doors · 3 open, of which 0 block

## Criteria

### Envio real de alerta por Telegram

1. Dado um destinatário com `chatId` salvo e plano Pro ou Hacker, quando um evento `TARGET_REACHED` ou `PRICE_DROP` é processado, então é feito um POST em `https://api.telegram.org/bot<BOT_TOKEN>/sendMessage` com `chat_id` igual ao `chatId` salvo e `text` contendo o nome do produto, o preço atual e a URL do produto.
2. Dado um destinatário sem `chatId` salvo, quando um evento é processado, então nenhuma chamada à API do Telegram é feita.
3. Dado um destinatário com `chatId` salvo mas em plano Free ou Noob, quando um evento é processado, então nenhuma chamada à API do Telegram é feita.
4. Se a chamada ao Telegram falhar (erro de rede, timeout ou status não-2xx), então o erro é registrado via `console.error` identificando o canal e o `userId`, e o envio do e-mail e a criação do `Alert` continuam normalmente.

### Envio real de alerta por webhook

5. Dado um destinatário com `webhookUrl` salva e plano Hacker, quando um evento é processado, então é feito um POST JSON em `webhookUrl` contendo `text` e `content` com a mesma mensagem renderizada (nome do produto, preço, meta e link), além dos campos estruturados `event`, `product` e `previousPrice`.
6. Dado um destinatário sem `webhookUrl` salva, quando um evento é processado, então nenhum POST de webhook é feito.
7. Dado um destinatário com `webhookUrl` salva mas fora do plano Hacker, quando um evento é processado, então nenhum POST de webhook é feito.
8. Se a chamada ao webhook falhar (erro de rede, timeout de 5s ou status não-2xx), então o erro é registrado via `console.error` identificando o canal e o `userId`, e o envio do e-mail/Telegram e a criação do `Alert` continuam normalmente.
9. Quando o usuário salva uma `webhookUrl` que não é uma URL absoluta `https://`, então o salvamento é rejeitado com um erro visível ao usuário e o valor anterior é mantido.

### Preferências de notificação (`/settings`, aba Notificações)

10. Dado um usuário no plano Pro ou Hacker sem `chatId` vinculado, quando ele abre a aba Notificações, então o `TelegramButton` (fluxo "1. Abrir Telegram" / "2. Confirmar Vínculo") é exibido.
11. Dado um usuário no plano Free ou Noob, quando ele abre a aba Notificações, então o bloco de Telegram exibe a chamada de upgrade "Alertas no Telegram disponíveis a partir do plano Pro." em vez do botão de vínculo.
12. Dado um usuário no plano Hacker, quando ele abre a aba Notificações, então um campo de texto para `webhookUrl` é exibido, pré-populado com o valor salvo quando existir.
13. Dado um usuário fora do plano Hacker, quando ele abre a aba Notificações, então o campo de webhook não é exibido.

### Correção da landing e da tela de planos

14. Sempre, a lista de features do plano Pro em `page.tsx` não contém "Compare 3 lojas no mesmo card".
15. Sempre, a lista de features do plano Hacker em `page.tsx` não contém "Acesso à API" nem "Frequência de coleta ajustável".
16. Sempre, o card "Setup em 12 segundos" em `page.tsx` não afirma "Sem extensão de navegador, sem instalação" — o texto é reescrito para não contradizer a extensão real do plano Hacker.
17. Sempre, a lista de features dos planos Pro e Hacker em `planos.tsx` não contém "Relatórios avançados", "Consultoria técnica" nem "IP Dedicado".

## Out of scope

- Construir API pública, frequência de coleta ajustável ou comparação de produto entre lojas de verdade - sem evidência de demanda pré-lançamento (ver `.design/landing-product-gap.md`).
- Corrigir os depoimentos fabricados e o "R$ 2,4 milhões salvos" em `testimonials-marquee.tsx` - decisão de negócio/jurídica do usuário, registrada como item `open` no Roadmap do design doc, não desta tarefa.
- Corrigir os limites de plano divergentes entre `page.tsx`, `planos.tsx` e `help/page.tsx` - já é uma decisão registrada em memória (`plan-limits-decision.md`), fora do escopo.
- Confirmar se as 8 lojas sem extração dedicada (Americanas, Casas Bahia, Kabum, Pichau, Centauro, Netshoes, Fast Shop, AliExpress) têm JSON-LD suficiente - é o spike do Roadmap do design doc, não uma mudança de código.
- Hardening de SSRF além de exigir `https://` em `webhookUrl` (bloquear IP privado/link-local) - ver Unresolved 3.

## Observable

| Surface | Decision | Landing |
| --- | --- | --- |
| screen `/settings` (aba Notificações) | estado vazio (sem `chatId`/`webhookUrl`) | 10, 12 |
| screen `/settings` (aba Notificações) | estado de erro ao salvar `webhookUrl` inválida | 9 |
| screen `/settings` (aba Notificações) | estado não elegível (plano não permite) | 11, 13 |
| screen `/settings` (aba Notificações) | ação destrutiva confirma antes de executar | n/a - nenhuma ação destrutiva nesta tarefa |
| landing `page.tsx` / `planos.tsx` | estado de carregamento/erro | n/a - páginas de marketing estáticas, sem dados assíncronos |

## Swept

- validation: 9
- failure modes: 4, 8
- idempotency and retry: n/a - nenhum retry automático é adicionado; `onPriceEvent` já é chamado no máximo uma vez por produto por execução do cron, sem mudança neste comportamento
- authorization: existing - `getSessionUserId()` já escopa toda action de `alerting` ao usuário da sessão, mesmo padrão de `setChatIdUser`/`setPriceAlertsEnabled`
- concurrency and ordering: n/a - os canais são despachados sequencialmente dentro do mesmo `handlePriceEvent`, sem chamada concorrente nova
- data lifecycle: 3, 7 - o valor de `chatId`/`webhookUrl` permanece salvo ao trocar de plano; o envio é bloqueado pelo gate de plano, não pela remoção do dado; a exclusão de conta já remove a linha inteira do `User` pelo fluxo existente de `identity`
- external-dependency failure: 4, 8
- state transitions: n/a - `chatId` e `webhookUrl` são apenas presentes ou ausentes, sem máquina de estados
- observability: 4, 8 - mesmo padrão de log já usado em `deliver()` (`channels/email.ts`) e em `scrapeProduct`

## Impact

| Front | What changes |
|---|---|
| domain | novo termo: `webhookUrl` (coluna em `User`) - URL de webhook de saída configurada pelo usuário para receber alertas de preço, de propriedade do módulo `alerting` |
| domain | existing term: `getRecipient` (`notification-repository.ts`) hoje seleciona só `email, name, priceAlertsEnabled` — passa a selecionar também `chatId`, `webhookUrl` e `planId`; hoje só `handle-price-event.ts` depende do retorno |
| stored data | nova coluna nullable em `User`, sem dado a migrar (campo novo, sem backfill) |

## Decided

| Decision | Shape | Alternative rejected |
|---|---|---|
| Mecanismo de envio do Telegram | `fetch` direto em `https://api.telegram.org/bot<BOT_TOKEN>/sendMessage`, sem biblioteca | telegraf/node-telegram-bot-api (já instaladas) - rejeitado por adicionar uma dependência completa só para uma chamada HTTP, quando `telegram-actions.ts` já usa `fetch` direto na mesma API |
| Onde mora `webhookUrl` | Coluna `webhookUrl String?` em `User`, escrita só por `alerting/infra/notification-repository.ts` | Tabela `WebhookConfig` separada - rejeitada por não haver evidência de que um usuário precise de mais de um webhook |
| Gate de plano | `canUseTelegram(planId)` = Pro ou Hacker; `canUseWebhook(planId)` = só Hacker, em `plan-entitlements.ts`, mesmo padrão de `canUseBrowserExtension` | Liberar para todos os planos - rejeitado por contradizer a segmentação de tier que a própria landing já vende |
| Formato do payload do webhook | JSON com `text` e `content` (mesma mensagem renderizada) mais os campos estruturados `event`, `product`, `previousPrice` | Schema só estruturado, sem `text`/`content` - rejeitado porque não renderiza nada no Slack/Discord sem um relay extra, contradizendo a promessa "Webhooks pro Slack/Discord" |
| Validação de `webhookUrl` | Aceita só URL absoluta `https://` no momento de salvar | Aceitar qualquer string - rejeitado por permitir `http://` e reduzir a barreira contra apontar para serviços internos |

## Surface

| Route | In | Out | Status | Criteria |
|---|---|---|---|---|
| Webhook POST `<webhookUrl configurada pelo usuário>` | `text`, `content`, `event`, `product` (`name`, `url`, `price`, `priceTarget`, `image`), `previousPrice` | n/a - fire-and-forget, a resposta do destinatário não é processada | 2xx tratado como sucesso; qualquer outro código ou timeout de 5s tratado como falha logada | 5, 8, 9 |

## Sources

- `.design/landing-product-gap.md` - **binding for the interface**: decisões de Telegram/webhook/gate de plano, e onde a copy da landing/planos deve mudar.

Este documento é o registro da decisão. Se `.design/landing-product-gap.md` divergir depois, pergunte antes de construir.

## Unresolved

| # | Kind | Question | Until answered |
|---|---|---|---|
| 1 | open | Qual o texto exato do upsell exibido para planos Free/Noob no bloco de Telegram? | Critério 11 é satisfeito com o texto default "Alertas no Telegram disponíveis a partir do plano Pro." — ajustar depois se o usuário quiser outro texto |
| 2 | open | O texto da mensagem enviada por Telegram/webhook deve seguir o mesmo tom dos templates de e-mail (`EmailTemplate`/`EmailTemplateDrop`)? | Critérios 1 e 5 usam um texto simples equivalente ao e-mail (nome, preço, meta, link) até revisão |
| 3 | open | `webhookUrl` deve bloquear IPs privados/link-local além de exigir `https://`, para reduzir risco de SSRF? | Critério 9 exige só `https://` absoluta por ora; hardening adicional fica fora do escopo até haver usuários reais no plano Hacker |
