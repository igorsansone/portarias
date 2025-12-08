FROM node:18-alpine

# Defina o diretório de trabalho
WORKDIR /app

# Copie package.json e, se houver, package-lock.json
COPY package*.json ./

# (opcional) listar para debug - remova depois
RUN echo "Arquivos em /app:" && ls -la /app

# Instale dependências (usa npm ci se houver package-lock.json)
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi

# Copie o restante do código
COPY . .

# Ajuste o comando de entrada conforme sua app
CMD ["node", "index.js"]
