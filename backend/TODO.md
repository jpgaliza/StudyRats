# TODO do backend para grupos e desafios

- Adicionar `description` em `groups` com migration e preencher no model.
- Adicionar `challenge_duration_days` em `groups` e validar como obrigatório na criação.
- Definir campos de ciclo do desafio para controlar início, fim e bloqueio de edição do tempo durante o desafio ativo.
- Ajustar `store()` para aceitar descrição opcional e tempo do desafio na criação do grupo.
- Ajustar `update()` para permitir apenas título e descrição pelo dono do grupo.
- Bloquear alteração do tempo de desafio durante o ciclo ativo, inclusive para o admin.
- Criar ação/rota própria para iniciar um novo desafio quando o ciclo anterior terminar.
- Implementar o reset do estado de check-ins de todos os membros ao iniciar um novo desafio.
- Cobrir criação, edição, autorização e reset com testes de feature.
