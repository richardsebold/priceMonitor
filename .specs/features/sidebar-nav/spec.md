# Sidebar Nav Specification

## Problem Statement

A sidebar (`src/components/sidebar/index.tsx`) não indica em que página o usuário está: todos os links têm o mesmo estilo, o que contraria a prática de "active state" da navegação. No mobile o menu está quebrado: Dashboard, Produtos e Alertas apontam para `/`, Ajuda aponta para `/settings`, "Sair" é um link para `/settings` que não encerra a sessão, e Planos não existe.

## Goals

- [ ] O link da página atual fica destacado e marcado com `aria-current="page"` na barra desktop e no menu mobile.
- [ ] Cada item do menu mobile leva à mesma rota do item equivalente no desktop, e "Sair" encerra a sessão.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Sidebar expansível com rótulos no desktop | Mudança de layout, não é bug. Fica para outra iteração |
| Contadores/badges nos links (ex.: alertas novos) | Precisa de dado novo do servidor |
| Mover o perfil para o topo da sidebar | Opcional no vídeo, sem ganho funcional |
| Refatorar o `UserMenu` desktop | Já funciona |
| Fechar o Sheet mobile manualmente ao navegar | Cada página renderiza a própria `Sidebar`, então o Sheet é remontado na navegação |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Estilo do item ativo | Desktop: `bg-accent text-accent-foreground`; mobile: `text-foreground` (os inativos seguem `text-muted-foreground`) | Tokens do shadcn já usados no projeto; funciona em tema claro e escuro | y |
| Rotas aninhadas | Um link fica ativo quando `pathname === href` ou quando `pathname` começa com `href + "/"` | Mantém "Configurações" ativo em subrotas futuras sem ativar `/` para tudo | y |
| Link do logo (`/`) | Nunca recebe estado ativo | É a landing page, não um destino da navegação do app | y |
| Rótulo do logout no mobile | "Sair" com ícone `LogOut`, reaproveitando `ButtonSignOut` (signOut do better-auth e depois `router.replace("/")`) | Mesmo comportamento do logout do desktop, sem duplicar lógica | y |
| Ordem dos itens no mobile | Dashboard, Produtos Rastreados, Alertas, Planos, Configurações, Ajuda, Sair | A mesma do desktop, de cima para baixo | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Destacar a página atual ⭐ MVP

**User Story**: Como usuário logado, quero ver qual item da navegação corresponde à página em que estou, para me orientar no app.

**Why P1**: Prática básica de navegação que falta em todas as telas.

**Acceptance Criteria**:

1. WHEN o `pathname` é igual ao `href` de um item THEN o item SHALL ser renderizado com `aria-current="page"`  <!-- event-driven -->
2. WHEN o `pathname` começa com o `href` de um item seguido de `/` THEN o item SHALL ser renderizado com `aria-current="page"`
3. WHEN o `pathname` não corresponde ao `href` de um item THEN o item SHALL ser renderizado sem o atributo `aria-current`
4. IF o `pathname` apenas começa com o texto do `href` sem uma `/` separando (ex.: `/produtosx` para `/produtos`) THEN o item SHALL ser renderizado sem `aria-current`
5. WHEN um item desktop está ativo THEN ele SHALL ter as classes `bg-accent` e `text-accent-foreground`
6. WHEN um item mobile está ativo THEN ele SHALL ter a classe `text-foreground` e não ter `text-muted-foreground`

**Independent Test**: abrir `/produtos` e ver o ícone de Produtos destacado, e só ele.

---

### P1: Menu mobile funcional ⭐ MVP

**User Story**: Como usuário no celular, quero que o menu me leve às páginas certas e me permita sair da conta.

**Why P1**: Hoje o menu mobile não funciona: os links vão para a página errada e "Sair" não faz logout.

**Acceptance Criteria**:

1. The menu mobile SHALL renderizar, nesta ordem, links para `/dashboard` (Dashboard), `/produtos` (Produtos Rastreados), `/alertas` (Alertas), `/planos` (Planos), `/settings` (Configurações) e `/help` (Ajuda)
2. The menu desktop SHALL renderizar links para as mesmas seis rotas
3. The item "Sair" do menu mobile SHALL ser um `<button>` que chama `authClient.signOut`, e não um link
4. WHEN "Sair" é clicado THEN o sistema SHALL chamar `authClient.signOut` e, se der certo, redirecionar para `/`

**Independent Test**: no viewport mobile, abrir o menu e navegar para cada item; clicar em "Sair" e cair na landing page deslogado.

---

## Edge Cases

- IF o `pathname` é `/` THEN nenhum item da navegação SHALL estar ativo
- IF o `pathname` é `null` THEN nenhum item SHALL estar ativo, sem erro

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| NAV-01 | P1: Destacar a página atual (AC 1-4, edge cases) | Execute | Implementing |
| NAV-02 | P1: Destacar a página atual (AC 5-6) | Execute | Pending |
| NAV-03 | P1: Menu mobile funcional (AC 1-2) | Execute | Pending |
| NAV-04 | P1: Menu mobile funcional (AC 3-4) | Execute | Pending |

**Coverage:** 4 total, 4 mapped to steps, 0 unmapped

---

## Success Criteria

- [ ] Em todas as seis páginas do app, exatamente um item da navegação está marcado como ativo
- [ ] Nenhum item do menu mobile aponta para uma rota diferente da do item equivalente no desktop
