# Carrossel de produtos em desconto - checks

Profile: ui
Plan: `.specs/features/deals-carousel/plan.md`

31 checks em 3 fatias · 2 portas de mão única · 1 pergunta em aberto, que bloqueia o go-live (seed no Neon), e 1 pré-requisito de ambiente para as provas de tela (ver `## Handoff`)

## Checks

### S1 - Catálogo semeado e verificado pelo cron · 7 files · ~30 KB · ~8k

**C1** - `seedCatalog` faz upsert do `User` com `id = "system-catalog"`, `email = "catalogo@system.monitorador.invalid"`, `name = "Catálogo"`, `priceAlertsEnabled = false`, `weeklySummaryEnabled = false`, e `CATALOG_USER_ID === "system-catalog"` (DEALS-01, AC 1, door 1) [x]
Proof: `npx vitest run src/modules/price-tracking/application/seed-catalog.test.ts -t "upserts the catalog user"`

**C2** - Para cada URL de `CATALOG_SEED_URLS` que o `system-catalog` ainda não tem, `seedCatalog` cria um `ProductHistory` com `priceTarget = 0`, `userId = "system-catalog"` e `lastPriceReadAt` preenchido, e um `PriceHistory` com o preço lido (DEALS-01, AC 2) [x]
Proof: `npx vitest run src/modules/price-tracking/application/seed-catalog.test.ts -t "creates missing catalog products"`

**C3** - Uma URL que o `system-catalog` já tem não gera `scrapeProduct`, `ProductHistory` nem `PriceHistory` (DEALS-01, AC 3) [x]
Proof: `npx vitest run src/modules/price-tracking/application/seed-catalog.test.ts -t "skips urls already seeded"`

**C4** - Quando o scrape de uma URL devolve `null`, devolve preço `<= 0` ou lança exceção, `seedCatalog` não cria nada para ela, registra a URL e segue para as próximas (DEALS-01, AC 4) [x]
Proof: `npx vitest run src/modules/price-tracking/application/seed-catalog.test.ts -t "skips a failed scrape and continues"`

**C5** - `runPriceCheckJob` grava `lastPriceReadAt` (um `Date`) no produto em toda leitura válida, com o preço mudando e com o preço igual (DEALS-01, AC 5) [x]
Proof: `npx vitest run src/modules/price-tracking/application/run-price-check-job.test.ts -t "records lastPriceReadAt on a valid reading"`

**C6** - `runPriceCheckJob` não grava `lastPriceReadAt` quando o scrape devolve `null`, preço `<= 0` ou leitura implausível não confirmada (DEALS-01, AC 6) [x]
Proof: `npx vitest run src/modules/price-tracking/application/run-price-check-job.test.ts -t "does not record lastPriceReadAt without a valid reading"`

**C7** - `NewProduct` cria o `ProductHistory` com `lastPriceReadAt` preenchido (DEALS-01, AC 7) [x]
Proof: `npx vitest run src/modules/price-tracking/actions/add-product.test.ts -t "sets lastPriceReadAt on creation"`

**C8** - `CATALOG_SEED_URLS` tem as 12 URLs da KaBuM listadas em `.design/deals-carousel.md` (Sources), sem duplicata por `normalizeProductUrl` (DEALS-01, AC 2) [x]
Proof: `npx vitest run src/modules/price-tracking/domain/catalog.test.ts -t "seed list"`

**C9** - `prisma/schema.prisma` declara `lastPriceReadAt DateTime?` e `addedFrom String?` em `ProductHistory`, e existe uma migração que adiciona as duas colunas como anuláveis, sem default obrigatório (door 2) [x]
Proof: `npx vitest run src/modules/price-tracking/infra/catalog-columns-schema.test.ts -t "catalog tracking columns"`

### S2 - Regra de desconto e ordenação · 6 files · ~20 KB · ~5k

**C10** - `referencePrice` devolve o maior preço em vigor entre `now - 30 dias` e `now`. O último registro anterior à janela conta como em vigor no início dela, registros mais antigos são ignorados, e histórico vazio devolve `null` (DEALS-02, AC 8) [x]
Proof: `npx vitest run src/modules/analytics/domain/deals.test.ts -t "referencePrice"`

**C11** - `toDeal` inclui um produto com desconto de exatamente 5% (preço 95, referência 100) e devolve `discount = 0.05` (DEALS-02, AC 9) [x]
Proof: `npx vitest run src/modules/analytics/domain/deals.test.ts -t "includes a discount at the 5% floor"`

**C12** - `toDeal` devolve `null` com desconto de 4,99%, com preço igual à referência e com preço acima dela (DEALS-02, AC 10) [x]
Proof: `npx vitest run src/modules/analytics/domain/deals.test.ts -t "excludes below the 5% floor"`

**C13** - `toDeal` inclui desconto de exatamente 40% e devolve `null` com 40,01% (DEALS-02, AC 11) [x]
Proof: `npx vitest run src/modules/analytics/domain/deals.test.ts -t "40% ceiling"`

**C14** - `toDeal` devolve `null` com `lastPriceReadAt` nulo ou há 24 h e 1 ms, e inclui com 23 h (DEALS-02, AC 12) [x]
Proof: `npx vitest run src/modules/analytics/domain/deals.test.ts -t "stale reading"`

**C15** - `rankDeals` ordena por `popularity` decrescente e, no empate, por `discount` decrescente (DEALS-02, AC 13) [x]
Proof: `npx vitest run src/modules/analytics/domain/deals.test.ts -t "rankDeals"`

**C16** - `getDeals` calcula `popularity` como o número de `userId` distintos, sem contar o `system-catalog`, com `ProductHistory` de mesma `normalizeProductUrl`. Duas URLs que diferem só pela query contam como a mesma (DEALS-02, AC 13) [x]
Proof: `npx vitest run src/modules/analytics/actions/get-deals.test.ts -t "popularity"`

**C17** - `getDeals` devolve no máximo 12 itens quando há 13 candidatos (DEALS-02, AC 14) [x]
Proof: `npx vitest run src/modules/analytics/actions/get-deals.test.ts -t "at most 12"`

**C18** - `getDeals` marca `alreadyTracked = true` no item cuja URL normalizada o usuário da sessão já monitora, e `false` nos outros (DEALS-02, AC 15) [x]
Proof: `npx vitest run src/modules/analytics/actions/get-deals.test.ts -t "alreadyTracked"`

**C19** - `getDeals` devolve `[]` sem ler o banco quando `getSessionUserId()` devolve `null` (DEALS-02, AC 16) [x]
Proof: `npx vitest run src/modules/analytics/actions/get-deals.test.ts -t "no session"`

**C20** - `getDeals` só busca candidatos com `where: { userId: "system-catalog" }` (DEALS-02, AC 17) [x]
Proof: `npx vitest run src/modules/analytics/actions/get-deals.test.ts -t "only catalog products"`

**C21** - `normalizeProductUrl` tira o `www.`, a query, o hash e a barra final e deixa o host em minúsculas. Reduz KaBuM a `kabum.com.br/produto/{id}` e Amazon a `amazon.com.br/dp/{ASIN}` (DEALS-02, AC 13, AC 15) [x]
Proof: `npx vitest run src/modules/price-tracking/domain/product-url.test.ts -t "normalizeProductUrl"`

### S3 - Carrossel no dashboard · 6 files · ~40 KB · ~10k

**C22** - `NewProduct(url, target, { addedFrom: "carousel" })` grava `addedFrom = "carousel"`, e `NewProduct(url, target)` grava `addedFrom = null` (DEALS-03, AC 23, AC 28) [x]
Proof: `npx vitest run src/modules/price-tracking/actions/add-product.test.ts -t "addedFrom"`

**C23** - `formatDealBadge(0.123)` devolve `"-12% vs. últimos 30 dias"`, e `formatDealBadge(0.125)` devolve `"-13% vs. últimos 30 dias"` (DEALS-03, AC 19) [x]
Proof: `npx vitest run src/modules/analytics/domain/deals.test.ts -t "formatDealBadge"`

**C24** - Com pelo menos 1 item, `/dashboard` mostra o carrossel abaixo de `SectionCards` e acima do título "Últimas Atualizações", com um card por item (DEALS-03, AC 18) [x]
Proof: Manual - Playwright MCP em banco isolado: abrir `/dashboard` e conferir, pela ordem do DOM e por screenshot, SectionCards → carrossel → "Últimas Atualizações"

**C25** - Cada card mostra imagem, nome, loja, preço em BRL (`R$ 1.234,56`) e o badge `-{N}% vs. últimos 30 dias` (DEALS-03, AC 19) [x]
Proof: Manual - Playwright MCP em banco isolado: snapshot de um card, conferindo os cinco elementos e o texto do badge contra o desconto do dado de teste

**C26** - Com `getDeals()` vazio, `/dashboard` não tem o carrossel nem nenhum texto dele: SectionCards é seguido direto por "Últimas Atualizações" (DEALS-03, AC 20) [x]
Proof: Manual - Playwright MCP em banco isolado, sem produto em desconto: snapshot de `/dashboard`

**C27** - "Ver na loja" é um link com `href` igual à URL do produto, `target="_blank"` e `rel="noopener noreferrer"` (DEALS-03, AC 21) [x]
Proof: Manual - Playwright MCP: ler os atributos do link no snapshot

**C28** - "Monitorar" abre um diálogo com a URL do produto num campo somente leitura e um campo de meta de preço (DEALS-03, AC 22) [x]
Proof: Manual - Playwright MCP: clicar em "Monitorar", conferir o valor e o `readonly` do campo de URL e a presença do campo de meta

**C29** - Confirmar o diálogo com sucesso fecha o diálogo, mostra o toast "Produto adicionado!", faz o produto aparecer em "Últimas Atualizações" sem recarregar a página e troca o botão do card pelo badge "Já monitorado" (DEALS-03, AC 23, AC 24) [x]
Proof: Manual - Playwright MCP em banco isolado: confirmar o diálogo e conferir os quatro efeitos sem navegação. `addedFrom` no banco já está provado em C22

**C30** - Com o limite do plano atingido, confirmar o diálogo mostra a mensagem de limite do `NewProduct` e um link para `/planos` (DEALS-03, AC 25) [x]
Proof: Manual - Playwright MCP em banco isolado, com usuário Free que já tem 1 produto: confirmar o diálogo e conferir a mensagem e o `href="/planos"`

**C31** - Com qualquer outro erro do `NewProduct`, o erro devolvido aparece num toast e o diálogo continua aberto (DEALS-03, AC 26) [x]
Proof: Manual - Playwright MCP em banco isolado: monitorar uma URL do catálogo cujo scrape falha (ou um produto que a sessão já tem, que devolve "Você já está monitorando este produto.") e conferir o toast e o diálogo aberto

**C32** - Um item com `alreadyTracked = true` mostra o badge "Já monitorado" e não tem botão "Monitorar" (DEALS-03, AC 27) [x]
Proof: Manual - Playwright MCP em banco isolado: abrir `/dashboard` com um usuário que já monitora um produto do catálogo e conferir o card

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| door 1 - usuário `system-catalog` (1) | literal id, e-mail, flags C1 | - |
| door 2 - colunas de `ProductHistory` (2) | `lastPriceReadAt` C9 · `addedFrom` C9 | - |
| entidade User system-catalog e seus produtos (2) | dono dos produtos C2 · único candidato do carrossel C20 | - |
| entidade ProductHistory e sua série de preço (2) | primeira leitura no seed C2 · série lida pela regra C10 | - |
| falha de scrape no seed (3) | `null` C4 · preço `<= 0` C4 · exceção C4 | - |
| resultado da leitura no cron (4) | válida com preço novo C5 · válida com preço igual C5 · falha (`null` / `<= 0`) C6 · implausível não confirmada C6 | - |
| janela do preço de referência (4) | registro dentro C10 · último anterior à janela C10 · anterior a esse C10 · histórico vazio C10 | - |
| limites de desconto (5 bordas) | 4,99% fora C12 · 5% dentro C11 · 40% dentro C13 · 40,01% fora C13 · preço igual ou acima da referência C12 | - |
| frescor da leitura (3 bordas) | `null` C14 · 24 h + 1 ms C14 · 23 h C14 | - |
| critérios de ordenação (2) | popularidade C15, C16 · desconto no empate C15 | - |
| regras de `normalizeProductUrl` (6) | host em minúsculas C21 · `www.` C21 · query/hash C21 · barra final C21 · KaBuM C21 · Amazon C21 | - |
| `NewProduct` `addedFrom` (2) | `"carousel"` C22 · ausente → `null` C22 | - |
| estados da tela do carrossel (4) | com itens C24, C25 · vazio C26 · item já monitorado C32 · depois de monitorar C29 | - |
| resultados do diálogo "Monitorar" (3) | sucesso C29 · limite do plano C30 · outro erro C31 | - |
| textos vinculantes (7) | "Monitorar" C28 · "Ver na loja" C27 · "Já monitorado" C29, C32 · "-N% vs. últimos 30 dias" C23, C25 · "Produto adicionado!" C29 · link "/planos" C30 · "Últimas Atualizações" como vizinho C24 | - |
| startup config (0) | nenhuma: não entra variável de ambiente nem configuração de montagem | - |

- `Surface` do plano: `None - nothing consumed outside`. Nenhuma rota deve linha de status.
- Nenhum check afirma mais do que o caso que a própria prova exercita. As regras de desconto (C10 a C15) são provadas na camada de domínio, e `getDeals` (C16 a C20) só na camada da action, sem repetir a regra.

## Test policy

O CLAUDE.md responde "testar `domain/` primeiro" e "actions com `vi.mock` de Prisma e sessão". Não diz se o *wiring* entre action e domínio precisa de prova própria, nem como provar tela, já que o Vitest roda em `node`, sem DOM. As linhas abaixo valem só para este build e não vão para o guia do repo.

| Code | Required proofs | Coverage expectation |
| --- | --- | --- |
| Decide, sem fronteira (`deals.ts`, `product-url.ts`) | uma na própria camada | um caso afirmado por borda ou regra (ver Coverage) |
| Decide e é alcançado por uma fronteira (`get-deals.ts`, `seed-catalog.ts`, `run-price-check-job.ts`, `add-product.ts`) | uma na camada da action ou do caso de uso, com Prisma e sessão mockados | cada ramo novo: filtro, contagem, limite, ausência de sessão, falha por URL |
| Tela (`deals-carousel.tsx`, `dashboard-client.tsx`) | Playwright MCP manual, como em `.specs/features/email-verification/checks.md` | cada estado e cada texto vinculante (ver Coverage) |
| Wrapper de script (`prisma/seed-catalog.ts`) | nenhuma própria | coberto por C1 a C4 sobre `seedCatalog` |

Evidence:

- `analytics/domain/deals.ts`: 5 pontos de decisão (janela, piso, teto, frescor, ordenação) -> decide
- `analytics/actions/get-deals.ts`: sessão, filtro de dono, contagem distinta, marcação, corte em 12 -> decide
- `prisma/seed-catalog.ts`: repassa para `seedCatalog` sem condição nenhuma -> instrumentação
- Análogo mais próximo: `analytics/actions/get-potential-savings.test.ts`, action com Prisma mockado provada na própria camada

Cost: 21 provas automatizadas em 7 arquivos de teste, mais 9 roteiros de Playwright.

## Swept

- validation: C12, C13, C14 (limites de desconto e frescor). A meta vazia no diálogo segue o comportamento que já existe (`Number("") = 0`, Assumptions)
- failure modes: C4 (seed segue depois de falha por URL), C6 (cron sem leitura válida não finge frescor), C31 (erro no diálogo)
- idempotency: C3 (seed rodado de novo não duplica). O duplicado no "Monitorar" já é barrado por `userId_url` e pela checagem em `NewProduct` (C31 exercita a mensagem)
- authorization: C19 (sem sessão, nada é devolvido) e C20 (só produtos do catálogo, nunca os de outros usuários). A página já redireciona sem sessão
- concurrency: n/a - o seed é rodado à mão por uma pessoa, e dois "Monitorar" simultâneos do mesmo usuário caem no `@@unique([userId, url])` que já existe (P2002 tratado em `add-product.ts`)
- data lifecycle: C9 (colunas anuláveis, sem backfill; as linhas existentes ficam `null` até a próxima leitura, e C14 trata `null` como velho)
- dependency failure: C4 (KaBuM fora do ar durante o seed) e C14 (cron parado ou em timeout: o produto sai sozinho do carrossel em 24 h)
- state transitions: C11 a C14 (produto entra e sai do carrossel conforme preço e frescor) e C29, C32 (card de "Monitorar" para "Já monitorado")
- observability: C4 (URL que falhou no seed é registrada). O carrossel não ganha log próprio, e `addedFrom` (C22) é a medida do Success

## Handoff

Divisão planejada, com a conta, antes de qualquer código: S1 + S2 + S3 ≈ 23k tokens de leitura (≈ 90 KB / 4), bem abaixo de 150k -> um único builder, sem handoff.

Pré-requisito das provas manuais (C24 a C32): o `.env` aponta para o Neon de produção, e essas provas precisam de produto do catálogo em desconto e de cadastro pelo diálogo. Elas só rodam contra um banco isolado (um branch do Neon ou um Postgres local), com a escolha confirmada pelo Richard antes da S3. Não rodam contra produção.

- **Boundary:** C1-C32 closed at the S3 commit and this commit. Provas manuais C24-C32 rodadas em 2026-09-24 com Playwright 1.63 (script, porque o Playwright MCP não está configurado neste ambiente) contra `next dev -p 3100` ligado a um Postgres local (`embedded-postgres`, porta 55432), nunca contra o Neon. O banco local recebeu as 25 migrações e o `catalog:seed` real (12/12 produtos lidos da KaBuM), mais um histórico montado à mão para criar os descontos. As 9 passaram, com screenshots no scratchpad da sessão (`uiproof/shots/`). A ordem esperada dos cards (popularidade, depois desconto) conferiu: Vivobook, Electrolux, TCL 32 (popularidade 1), depois TCL 65 (23%), G35 (20%), inexistente (17%), A07 (9%). O iPhone (3%), o IdeaPad (44%, acima do teto), o Nitro (leitura de 30 h) e o TCL 50 (sem queda) ficaram de fora
- **Settled mid-build:** posição do carrossel entre `SectionCards` e "Últimas Atualizações" (usuário, na aprovação do plano). Postgres local no lugar do Docker e script do Playwright no lugar do MCP (usuário, 2026-09-24). Door 3 (`embla-carousel-react`) acrescentada ao Landing antes do código. O pacote `cn`, que o CLI do shadcn acrescentou, foi removido
- **Abandoned:** Docker (o daemon não sobe nesta máquina) e Playwright MCP (não configurado)
- **Bug encontrado, fora do escopo, não corrigido:** `priceScale([])` em `src/components/chart-area-interactive.tsx:75` entra em loop infinito quando o primeiro produto expandido tem `priceTarget = 0`, porque no primeiro render o histórico ainda está vazio. Isso trava o SSR e o browser do `/dashboard`. Já existia (o diálogo "CADASTRAR PRODUTO" aceita meta vazia, que vira 0), e o diálogo "Monitorar" do carrossel abre um segundo caminho para ele (reproduzido na primeira rodada da C31)
