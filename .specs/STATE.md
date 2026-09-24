# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | O `User` com `id = "system-catalog"` (`CATALOG_USER_ID`) não é uma pessoa: é dono dos produtos do carrossel de ofertas. Qualquer query nova que percorra todos os usuários ou todos os produtos, como métricas globais, e-mails em massa ou cobrança, precisa excluí-lo ou incluí-lo de propósito | O catálogo reaproveita cron, histórico e plausibilidade como produtos comuns (`.specs/features/deals-carousel/plan.md`, door 1) | active | 2026-09-23 |

## Handoff

**Feature**: deals-carousel
**Where**: plan.md escrito e validado. Aguarda a revisão do usuário antes do `checks.md`
**In progress**: nada
**Next step**: com o plano aprovado, derivar `.specs/features/deals-carousel/checks.md`
**Blockers**: nenhum para construir. O go-live depende da confirmação para rodar `catalog:seed` no Neon
**Uncommitted**: `.design/deals-carousel.md`, `.specs/features/deals-carousel/plan.md`, `.specs/STATE.md`
**Branch**: main
