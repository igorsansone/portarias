FROM node:18-alpine

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --omit=dev || npm install --omit=dev

# Copy backend code
COPY backend/ ./

# Create data directory
RUN mkdir -p data

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
