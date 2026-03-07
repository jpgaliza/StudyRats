# StudyRats

## Descrição

O StudyRats é uma plataforma de gamificação voltada para a educação, inspirada no conceito de "GymRats". O objetivo é transformar a rotina de estudos numa experiência social e competitiva. Os utilizadores podem criar ou entrar em grupos de estudo, realizar check-ins de conteúdos estudados e acompanhar um ranking dinâmico baseado no volume de estudo dos membros do grupo.

## Arquitetura

| Camada             | Tecnologia                             |
| ------------------ | -------------------------------------- |
| Frontend           | React Native (Expo)                    |
| Backend            | Laravel 11                             |
| Base de Dados      | PostgreSQL com replicação Master/Slave |
| Proxy/Orquestração | Traefik + Docker Compose               |

## Como rodar o projeto localmente

### Pré-requisitos

- Docker e Docker Compose
- Node.js e NPM (para o frontend mobile)
- Git

### Passo a passo

**1. Clone o repositório**

```bash
git clone <url-do-repositorio>
cd studyrats
```

**2. Configure o Backend**

```bash
cd api
cp .env.example .env
cd ..
```

**3. Suba os containers**

```bash
docker compose up -d
```

**4. Inicialize o Laravel**

```bash
docker compose exec api composer install
docker compose exec api php artisan key:generate
docker compose exec api php artisan migrate
```

**5. Instale as dependências do Frontend e inicie**

```bash
cd mobile
npm install
npx expo start
```

### Acesso

#### API

O Traefik atua como proxy reverso e roteia as requisições para o container da API. Para que o endereço `api.studyrats.local` funcione, adicione a seguinte entrada no arquivo `/etc/hosts` da sua máquina:

```
127.0.0.1   api.studyrats.local
```

Após isso, a API estará acessível em:

```
http://api.studyrats.local
```

#### Mobile

Ao executar `npx expo start`, um dashboard interativo será exibido no terminal com as seguintes opções de conexão:

- Pressione `a` para abrir no emulador Android
- Pressione `i` para abrir no simulador iOS
- Escaneie o QR Code com o aplicativo **Expo Go** para acessar via dispositivo físico

> Para usar um dispositivo físico, certifique-se de que ele está na mesma rede Wi-Fi que a máquina de desenvolvimento.
