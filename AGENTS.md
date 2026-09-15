# AGENTS.md

## Criação de Pull Requests

Toda abertura de PR neste repositório deve seguir a skill `stacked-pr` (`.claude/skills/stacked-pr/SKILL.md`) — ela usa a funcionalidade nativa de stacked pull requests do GitHub (`gh stack`), não o fluxo manual antigo (`git branch` + `gh pr create --base`). A própria skill decide quando usar uma stack (commits que devem entrar em ordem, cada um revisável separadamente) e quando abrir um PR único normal — não force uma stack para uma mudança coerente só porque tem vários commits.

## Validação de telas (UI)

Sempre que uma implementação envolver alterações em telas (componentes de UI, páginas, fluxos visuais), ao final da implementação é obrigatório validar o resultado usando o Playwright (MCP), navegando na aplicação e conferindo visualmente que a funcionalidade alterada funciona como esperado antes de considerar a tarefa concluída.
