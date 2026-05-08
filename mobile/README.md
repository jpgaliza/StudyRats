# StudyRats - Aplicativo Mobile

Descrição de tecnologias e estrutura do Front-end do projeto.

## 🚀 Tecnologias e Bibliotecas

### Tecnologias Principais

- **React Native** - Desenvolvimento mobile multiplataforma
- **Expo** (~54.0.33) - Plataforma de desenvolvimento e ferramentas
- **Expo Router** (~6.0.23) - Roteamento baseado em arquivos para React Native
- **TypeScript** (~5.9.2) - Desenvolvimento com tipagem forte

### UI e Estilização

- **expo-linear-gradient** - Gradientes em backgrounds e botões
- **lucide-react-native** - Ícones modernos e customizáveis
- **React Native StyleSheet** - Estilização nativa

### Navegação e Estado

- **@react-navigation/native** (~7.1.8) - Infraestrutura de navegação
- **@react-navigation/bottom-tabs** (~7.4.0) - Navegação por abas
- **expo-router** - Sistema de roteamento baseado em arquivos

### Animações e Interações

- **react-native-reanimated** (~4.1.1) - Biblioteca poderosa de animações
- **react-native-gesture-handler** (~2.28.0) - Manipulação de gestos
- **expo-haptics** (~15.0.8) - Feedback háptico (vibração)

### Outras Funcionalidades

- **expo-image** (~3.0.11) - Componente otimizado de imagem
- **expo-splash-screen** (~31.0.13) - Gerenciamento da tela de splash
- **expo-status-bar** (~3.0.9) - Controle da barra de status

## 📱 Fluxo da Aplicação

### Fluxo de Autenticação

```
(auth)/
├── login.tsx        - Tela de login com email e senha
└── register.tsx     - Tela de registro de novo usuário
```

Os usuários começam na tela de login. Após fazer login (ou se registrar), são direcionados para a aplicação principal.

### Fluxo Principal da Aplicação

```
(tabs)/
├── index.tsx           - Dashboard com stats e atividades
├── groups.tsx          - Lista de grupos e criar/entrar grupos
├── profile.tsx         - Perfil do usuário
├── leaderboard.tsx     - Placar com query param groupId
└── explore.tsx         - Página de informações

leaderboard/
└── [id].tsx           - Rota dinâmica para placar de grupo específico
```

### 1. **Dashboard** (index.tsx)

- Mensagem de boas-vindas com nome do usuário
- Botão de check-in (abre seletor de grupo → modal de check-in)
- Quick stats (sequência atual, check-ins semanais)
- Visualização dos grupos do usuário
- Feed de atividades recentes de todos os grupos
- Seletor rápido de grupo para check-in

### 2. **Grupos** (groups.tsx)

- Lista de todos os grupos de estudo do usuário
- Botão para criar novo grupo (abre modal)
- Botão para entrar em grupo via código (abre modal)
- Cada card de grupo exibe:
  - Nome do grupo e quantidade de membros
  - Código do grupo para convites
  - Pré-visualização do top 3 do placar
  - Descrição do grupo (se houver)
  - Duração do desafio atual

### 3. **Placar** (leaderboard/[id].tsx)

- Visualizar placar específico de um grupo
- Botão de check-in para esse grupo
- Lista completa de membros ordenados por rank
- Visualização de pódio com top 3 membros
- Destaca a posição do usuário atual
- Modo de edição apenas para dono do grupo
- Botão para iniciar novo desafio (reseta check-ins)
- Informações de ciclo de desafio (duração e dias restantes)

### 4. **Perfil** (profile.tsx)

- Informações do usuário
- Estatísticas gerais

### 5. **Componentes Compartilhados**

```
components/
├── CheckInModal.tsx      - Modal para submeter check-ins de estudo
├── themed-text.tsx       - Componente de texto com tema
├── themed-view.tsx       - Componente de visualização com tema
└── (outros componentes)
```

O CheckInModal permite aos usuários:

- Inserir disciplina/tópico estudado
- Fazer upload de foto (simulado)
- Adicionar notas opcionais
- Ver animação de sucesso após submissão

## 📊 Estrutura de Dados

### Dados Mock (data/mockData.ts)

- **currentUser**: Informações do usuário logado
- **studyGroups**: Array de grupos de estudo com membros
- **recentActivity**: Check-ins recentes de todos os grupos

### Interfaces Principais

```typescript
interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

interface StudyGroup {
  id: string;
  name: string;
  code: string;
  memberCount: number;
  description?: string;
  ownerId: string;
  challengeDurationDays: number;
  challengeEndsAt: string;
  topMembers: GroupMember[];
  allMembers: GroupMember[];
}

interface GroupMember {
  userId: string;
  name: string;
  username: string;
  avatar: string;
  rank: number;
  checkInCount: number;
}

interface CheckIn {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  subject: string;
  duration: string;
  timestamp: Date;
  note?: string;
}
```

## 🔄 Roteamento

O aplicativo utiliza **Expo Router** para roteamento baseado em arquivos:

- `/(auth)/login` - Tela de login
- `/(auth)/register` - Tela de registro
- `/(tabs)/` - Dashboard (home)
- `/(tabs)/groups` - Lista de grupos de estudo
- `/(tabs)/leaderboard` - Placar com parâmetro groupId
- `/(tabs)/profile` - Perfil do usuário
- `/leaderboard/[id]` - Placar dinâmico para grupo específico

## 💻 Instalação e Execução

### Pré-requisitos

- Node.js (v16 ou superior)
- npm ou yarn
- Expo Go instalado no telefone (iOS/Android)
- OU iOS Simulator / Android Emulator no computador

### Instalação

1. **Navegue para o diretório mobile:**

   ```bash
   cd mobile
   ```

2. **Instale as dependências:**

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Inicie o servidor de desenvolvimento:**

   ```bash
   npm start
   ```

   Ou use comandos específicos de plataforma:

   ```bash
   npm run android   # Executar no Android
   npm run ios       # Executar no iOS
   npm run web       # Executar no navegador web
   ```

4. **Abra no seu dispositivo:**
   - Escaneie o código QR com o aplicativo Expo Go (Android)
   - Escaneie com o aplicativo Câmera (iOS)
   - Ou pressione `a` para emulador Android, `i` para simulador iOS

### Comandos de Desenvolvimento

```bash
npm start                      # Inicia servidor de desenvolvimento Expo
npm run android                # Inicia no emulador/dispositivo Android
npm run ios                    # Inicia no simulador/dispositivo iOS
npm run web                    # Inicia no navegador web
npm run lint                   # Executa ESLint para verificar código
npm start -- --clear           # Limpa cache e reinicia
```

## 🎨 Sistema de Design

### Paleta de Cores

| Cor                 | Hex       | Uso                                       |
| ------------------- | --------- | ----------------------------------------- |
| **Primária**        | `#0ea5e9` | Cor principal da marca, botões e destaque |
| **Primária Escura** | `#0284c7` | Gradientes e estados hover                |
| **Cinza 900**       | `#111827` | Texto primário                            |
| **Cinza 500**       | `#6b7280` | Texto secundário                          |
| **Cinza 200**       | `#e5e7eb` | Bordas padrão                             |
| **Cinza 100**       | `#f3f4f6` | Fundos leves                              |
| **Azul Claro**      | `#eff6ff` | Background principal                      |
| **Branco**          | `#ffffff` | Fundo de cards                            |
| **Ouro**            | `#fbbf24` | 1º lugar no pódio                         |
| **Prata**           | `#d1d5db` | 2º lugar no pódio                         |
| **Bronze**          | `#d97706` | 3º lugar no pódio                         |

### Espaçamento

- **Padding Pequeno**: 8px
- **Padding Médio**: 12-16px
- **Padding Grande**: 24-32px
- **Gap entre elementos**: 8-16px

### Tipografia

- **Headlines**: Peso 700-900, tamanho 20-28px
- **Body**: Peso 400-600, tamanho 14-16px
- **Labels**: Peso 600-700, tamanho 12-14px

### Componentes de UI

| Componente     | Características                                             |
| -------------- | ----------------------------------------------------------- |
| **Botões**     | Border radius 12px, padding 12-16px, sombra sutil           |
| **Cards**      | Border radius 16px, padding 16-24px, borda 1px              |
| **Modais**     | Border radius 16px, overlay com 60% opacidade, padding 24px |
| **Inputs**     | Border radius 12px, altura 44px, padding 12px               |
| **Gradientes** | Utilizados em botões primários e backgrounds                |

### Características Principais

- **Gradientes**: Usados em botões primários e backgrounds
- **Raios de Borda**: 12-16px para cards, 8-12px para inputs
- **Sombras**: Elevation sutil para profundidade
- **Feedback Háptico**: Respostas táteis em interações
- **Animações**: Transições suaves entre estados

### Responsividade

- **Layouts Flex**: Utilizados para adaptação a diferentes tamanhos
- **Max-width**: Aplicado em modais (max 400px)
- **Padding Dinâmico**: Ajustado para diferentes telas

## 📝 Notas Importantes

- Este aplicativo utiliza **dados mock** - não há integração com backend ainda
- Autenticação é simulada (sem validação real)
- Upload de foto é apenas UI (sem upload real)
- Todos os check-ins mostram sucesso mas não persistem

## 🚧 Melhorias Futuras

- Integração com API backend
- Atualizações em tempo real com WebSockets
- Notificações push para atividades do grupo
- Funcionalidade de upload de fotos
- Customização de perfil do usuário
- Recurso de chat em grupo
- Estatísticas semanais/mensais
- Badges de conquistas
- Suporte a modo escuro

## 🛠️ Resolução de Problemas

### Problemas Comuns

**Problema: "expo-linear-gradient não encontrado"**

```bash
npm install expo-linear-gradient
```

**Problema: Problemas de cache do Metro bundler**

```bash
npm start -- --clear
```

**Problema: Erros na compilação iOS/Android**

```bash
cd android && ./gradlew clean && cd ..  # Android
cd ios && pod install && cd ..          # iOS
```

**Problema: QR Code não funciona**

```bash
npm start -- --offline
```

---

Desenvolvido com ❤️ para estudantes que se dedicam juntos.
