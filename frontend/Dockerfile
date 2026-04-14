FROM node:20-alpine

# Diretório de trabalho
WORKDIR /app

# Copia apenas package.json primeiro (melhora cache)
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do projeto
COPY . .

# Expõe a porta do Vite
EXPOSE 5173

# Comando para rodar o servidor de desenvolvimento
CMD ["npm", "run", "dev", "--", "--host"]