# 1. Imagem base
FROM node:22-alpine

# 2. Configura o pnpm
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm

# 3. Diretório de trabalho
WORKDIR /app

# 4. Instala as dependências
COPY package.json ./
RUN pnpm install

# 5. Copia o restante do código
COPY . .

EXPOSE 3000

# 6. Roda as migrations e sobe o servidor em modo dev
CMD ["sh", "-c", "pnpm db:migrate && pnpm dev"]
