# Fluxo de Usuário - StudyRats App

Este documento detalha o fluxo de navegação e as interações do usuário no aplicativo mobile StudyRats.

## 1. Autenticação

O fluxo de autenticação é o ponto de entrada para o aplicativo.

### 1.1. Tela Inicial (Redirecionamento)

- Ao abrir o aplicativo, o usuário é automaticamente redirecionado da rota `/` para a tela de login em `/(auth)/login`.

### 1.2. Tela de Login (`/(auth)/login`)

- **Campos:**
  - Email
  - Senha
- **Ações:**
  - **Entrar:**
    1.  O usuário preenche os campos.
    2.  Ao clicar em "Entrar", o aplicativo valida os dados.
    3.  **Validação:** Se um campo estiver vazio, a borda do campo fica vermelha e uma mensagem de erro é exibida abaixo dele.
    4.  **Sucesso:** Se as credenciais estiverem corretas, o usuário é autenticado e redirecionado para a tela principal (Dashboard - `/(tabs)`).
    5.  **Falha:** Se as credenciais estiverem incorretas, um alerta de erro é exibido.
  - **Criar Conta:**
    - Um link "Criar conta" redireciona o usuário para a tela de Registro (`/(auth)/register`).

### 1.3. Tela de Registro (`/(auth)/register`)

- **Campos:**
  - Nome real
  - Nome de usuário
  - Email
  - Senha
  - Confirmar senha
- **Ações:**
  - **Criar Conta:**
    1.  O usuário preenche os campos.
    2.  Ao clicar em "Criar conta", o aplicativo valida os dados.
    3.  **Validação:**
        - Se algum campo obrigatório estiver vazio, sua borda fica vermelha com uma mensagem de erro.
        - Se as senhas não coincidirem, um alerta de erro é exibido.
    4.  **Sucesso:** Uma nova conta de usuário é criada, o usuário é automaticamente logado e redirecionado para a tela principal (Dashboard - `/(tabs)`).
    5.  **Falha:** Se ocorrer um erro durante o registro (ex: email já existe), um alerta de erro é exibido.
  - **Entrar:**
    - Um link "Entrar" redireciona o usuário de volta para a tela de Login (`/(auth)/login`).

## 2. Navegação Principal (Abas)

Após o login, o usuário tem acesso a uma navegação por abas na parte inferior da tela.

### 2.1. Dashboard (Aba "Dashboard" - `/(tabs)/index`)

- É a tela principal após o login.
- **Conteúdo:**
  - Saudação ao usuário ("Olá, [Nome do Usuário]").
  - Botão de **"Check-in de Estudo"**.
  - Card de **"Estatísticas Rápidas"**:
    - Sequência Atual (dias).
    - Check-ins na semana.
  - Card de **"Meus Grupos"**:
    - Exibe uma prévia dos 3 primeiros grupos do usuário.
    - Link "Ver Todos" que leva para a tela de Grupos.
- **Ações:**
  - **Clicar em "Check-in de Estudo"**: Abre um modal para selecionar em qual grupo fazer o check-in. Após a seleção, o modal de Check-in é exibido.
  - **Clicar em um grupo**: Redireciona para a tela de Leaderboard daquele grupo.
  - **Clicar em "Ver Todos"**: Navega para a aba "Grupos".

### 2.2. Grupos (Aba "Groups" - `/(tabs)/groups`)

- **Conteúdo:**
  - Título "Grupos de Estudo".
  - Botões de ação: "Criar Grupo" e "Entrar via Código".
  - Seção "Seus Grupos" que lista todos os grupos dos quais o usuário faz parte.
- **Ações:**
  - **Criar Grupo**: Abre um modal para o usuário inserir o nome do novo grupo e criá-lo.
  - **Entrar via Código**: Abre um modal para o usuário inserir o código de convite de um grupo existente.
  - **Clicar em um grupo da lista**: Redireciona para a tela de Leaderboard daquele grupo.

### 2.3. Leaderboard (Aba "Leaderboard" - `/(tabs)/leaderboard`)

- Esta tela exibe a classificação dos membros de um grupo específico.
- **Conteúdo:**
  - Nome do grupo e número de membros.
  - Botão de **"Check-in para [Nome do Grupo]"**.
  - Lista de membros com sua classificação, nome, avatar e contagem de check-ins.
  - Pódio com os 3 melhores membros.
- **Ações:**
  - **Clicar em "Check-in..."**: Abre o modal de Check-in para o grupo atual.

## 3. Modais

### 3.1. Modal de Check-in (`/components/CheckInModal.tsx`)

- Aparece sobre a tela atual quando o usuário decide fazer um check-in.
- **Campos:**
  - Assunto / Tópico (obrigatório).
  - Foto (obrigatório).
  - Nota (opcional).
- **Ações:**
  - **Confirmar Check-in**:
    1.  Valida se os campos obrigatórios foram preenchidos.
    2.  Simula o envio e exibe uma mensagem de sucesso ("Check-in Registrado!").
    3.  Fecha o modal automaticamente após 2 segundos.
  - **Fechar Modal**: O usuário pode fechar o modal clicando no 'X' ou fora da área do modal.
