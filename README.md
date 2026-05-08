# 🌐 StudyRats

Uma plataforma completa de **gerenciamento e acompanhamento de estudos** que permite aos usuários organizar seus cronogramas de aprendizado, definir metas, rastrear progresso e interagir com uma comunidade de estudantes.

## 📖 Sobre o Projeto

O **StudyRats** é uma aplicação fullstack que auxilia estudantes na organização e disciplina de seus estudos através de recursos como:

- 📊 **Dashboard de acompanhamento** - Visualize seu progresso e estatísticas de estudo
- 📅 **Agendamento de sessões** - Organize suas sessões de estudo
- 👥 **Sistema de usuários e grupos** - Crie grupos de estudo com amigos
- 🏆 **Ranking e gamificação** - Compete com outros estudantes
- 📱 **Multiplataforma** - Acesse pelo app mobile ou web
- ☁️ **Sincronização em tempo real** - Seus dados sempre atualizados

## 🏗️ Arquitetura

O projeto é dividido em três componentes principais:

| Componente         | Tecnologia              | Descrição                                         |
| ------------------ | ----------------------- | ------------------------------------------------- |
| **Backend**        | Laravel 11 + PHP        | API RESTful que gerencia toda a lógica de negócio |
| **Mobile**         | React Native (Expo)     | Aplicativo nativo para iOS e Android              |
| **Infraestrutura** | Docker + Docker Compose | Ambiente containerizado para fácil deployment     |

## 📥 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

- **Docker** e **Docker Compose** (v2.0+)
- **Node.js** (v20 ou superior)
- **Git**

Para verificar se tudo está instalado:

```bash
docker --version
docker compose version
node --version
git --version
```

## 🚀 Instalação e Execução

### 1️⃣ Clonar o Repositório

```bash
git clone git@github.com:jpgaliza/StudyRats.git
cd StudyRats
```

### 2️⃣ Iniciar os Containers Docker

Na raiz do projeto, execute:

```bash
docker compose up -d --build
```

Este comando irá iniciar:

- ✅ Servidor PHP/Laravel (Backend API)
- ✅ Servidor Nginx (Web Server)
- ✅ Banco de dados MySQL
- ✅ Redis (Cache)
- ✅ phpMyAdmin (Gerenciador de banco de dados)

Aguarde alguns minutos até todos os containers estarem prontos.

### 3️⃣ Configurar o Backend (Laravel)

Dentro do container da aplicação:

```bash
# Acessar o container
docker compose exec app bash

# Copiar arquivo de configuração de ambiente
cp .env.example .env

# Instalar dependências PHP
composer install

# Gerar chave de aplicação
php artisan key:generate

# Executar migrações do banco de dados
php artisan migrate

# (Opcional) Executar seeders para dados de exemplo
php artisan db:seed

# Sair do container
exit
```

### 4️⃣ Configurar o App Mobile

Em outro terminal, navegue até a pasta mobile:

```bash
cd mobile

# Instalar dependências do Node.js
npm install --legacy-peer-deps

# Iniciar o Expo
npx expo start
```

Você verá um QR code no terminal. Escaneie com seu smartphone usando:

- **iOS**: App "Expo Go" da App Store
- **Android**: App "Expo Go" do Google Play

## 📍 Acessar os Serviços

Após a configuração completa, acesse:

| Serviço         | URL                   | Descrição                     |
| --------------- | --------------------- | ----------------------------- |
| **API Backend** | http://localhost:8000 | Endpoints da API              |
| **phpMyAdmin**  | http://localhost:8080 | Gerenciador de banco de dados |
| **App Mobile**  | Expo Go (smartphone)  | Via QR code                   |

## 🔐 Variáveis de Ambiente

O arquivo `.env` do backend já está pré-configurado para usar os serviços Docker. Principais variáveis:

```env
APP_URL=http://localhost:8000
DB_HOST=mysql
DB_DATABASE=studyrats
DB_USERNAME=studyrats_user
DB_PASSWORD=secret
REDIS_HOST=redis
```

## 🛠️ Comandos Úteis

```bash
# Ver logs dos containers
docker compose logs -f

# Acessar o container do app
docker compose exec app bash

# Rodar testes do backend
docker compose exec app php artisan test

# Parar os containers
docker compose down

# Remover containers e volumes
docker compose down -v
```

## 📱 Desenvolvimento

### Backend (Laravel)

- **Framework**: Laravel 11
- **Banco de dados**: MySQL 8.0
- **Cache**: Redis
- **Testes**: PHPUnit

### Mobile (React Native)

- **Framework**: Expo/React Native
- **Linguagem**: TypeScript
- **Runtime**: Node.js

## 🤝 Contribuindo

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

**Desenvolvido com ❤️ para estudantes que querem fazer mais com seus estudos.**
