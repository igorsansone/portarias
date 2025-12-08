FROM node:18-alpine AS builder

# Install build dependencies for native modules (better-sqlite3)
# Note: In some restricted environments, apk may not have internet access
# In such cases, use Dockerfile.debian instead
RUN apk add --no-cache python3 make g++ || echo "Warning: Could not install build tools"

# Define working directory
WORKDIR /app

# Copy package.json from backend directory
# Use wildcard to handle missing package-lock.json
COPY backend/package*.json ./

# Install dependencies before copying source code for better layer caching
# Use npm ci if package-lock.json exists, otherwise npm install
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi

# Copy backend application code
COPY backend/ ./

# Expose the backend port
EXPOSE 3000

# Start the backend server
CMD ["node", "server.js"]
