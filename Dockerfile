FROM node:18-alpine

# Defina o diretório de trabalho
WORKDIR /app

# Copie explicitamente os manifests (evita problemas com wildcard)
COPY package.json package-lock.json ./

# Opcional: debug (remova depois). Vai listar arquivos para confirmar que package.json está aqui.
# RUN ls -la /app
# RUN cat /app/package.json

# Instale dependências (usa npm ci se houver package-lock.json)
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi

# Copie o restante do código
COPY . .

# Build / start (ajuste conforme sua app)
# RUN npm run build
CMD ["node", "index.js"]
