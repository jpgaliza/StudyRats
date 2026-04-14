# 🌐 StudyRats — React + Laravel + Docker

Aplicação web para gerenciamento de estudos, utilizando Laravel no backend, React no frontend e ambiente totalmente conteinerizado com Docker.

## 🗂️ Estrutura
---
    studyrats/
    ├── backend/          # Laravel API
    ├── frontend/         # React Web
    ├── docker/           # Configurações de Nginx/PHP
    ├── docker-compose.yml
    └── README.md
---

## 🚀 1. Clonar o projeto

```bash
git clone git@github.com:jpgaliza/StudyRats.git
cd StudyRats
```

---

## ✅ Pré-requisitos

* **Docker** + **Docker Compose**
* **Node.js** (v20 ou superior)
* **Composer** (pode ser executado via Docker)

---

## 🐳 2. Subir os Containers

Na raiz do projeto, execute:

```bash
docker compose up -d --build
```

---

## ⚙️ 3. Configuração do Backend (Laravel)

### Criar o arquivo `.env`

```bash
cp backend/.env.example backend/.env
```

### Setup das dependências e chaves
Execute os comandos dentro do container da aplicação:

```bash
# Acessar o container
docker compose exec app bash

# Instalar dependências do PHP
composer install

# Gerar chave e rodar migrações
php artisan key:generate
php artisan migrate

exit
```

---

---

## 🔗 Acesso ao Ambiente

| Serviço    | URL                      |
| ---------- | ------------------------ |
| **Frontend** | http://localhost:5173 (via Docker) |
| **Backend/API**| `http://localhost:8000` |
| **phpMyAdmin** | `http://localhost:8080` |

---

## ⚙️ Variáveis de Ambiente (.env do Backend)

Certifique-se de que a conexão com o banco de dados no seu `backend/.env` aponta para o serviço do Docker:

```env
APP_NAME=StudyRats
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=mysql        # Nome do serviço no docker-compose
DB_PORT=3306
DB_DATABASE=studyrats
DB_USERNAME=studyrats_user
DB_PASSWORD=secret

CACHE_STORE=redis
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## 🛠️ Troubleshooting (Solução de Problemas)

| Problema                 | Solução                                      |
| ------------------------ | -------------------------------------------- |
| Erro de permissão (Linux) | `sudo chown -R $USER:$USER storage bootstrap/cache` |
| Container não sobe       | `docker compose logs -f` para ver o erro      |
| Mudança no .env          | `php artisan config:clear`                   |
| Porta 8000 ocupada       | Verifique se não há um `php artisan serve` rodando |

---
