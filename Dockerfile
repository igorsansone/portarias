# Use node:18 (Debian-based) instead of alpine to include build tools for better-sqlite3
FROM node:18

# Defina o diretório de trabalho
WORKDIR /app

# Copie package.json e, se houver, package-lock.json do backend
COPY backend/package*.json ./

# Instale dependências (usa npm ci se houver package-lock.json)
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi

# Copie o restante do código do backend
COPY backend/ .

# Crie diretório para dados do SQLite
RUN mkdir -p /app/data

# Execute o servidor
CMD ["node", "server.js"]
