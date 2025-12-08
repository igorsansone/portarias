FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists) from backend
COPY backend/package*.json ./

# Install dependencies (use npm ci if package-lock.json exists, otherwise npm install)
# Note: better-sqlite3 requires build tools, but we'll try using pre-built binaries first
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi

# Copy the rest of the backend code
COPY backend/ ./

# Expose backend port
EXPOSE 3000

# Start the backend server
CMD ["node", "server.js"]
