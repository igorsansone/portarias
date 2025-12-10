# Multi-stage build: Stage 1 - Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci || npm install

# Copy frontend source
COPY frontend/ ./

# Build frontend (can be skipped with --build-arg SKIP_FRONTEND_BUILD=1)
ARG SKIP_FRONTEND_BUILD=0
RUN if [ "$SKIP_FRONTEND_BUILD" != "1" ]; then npm run build; fi

# Stage 2 - Build backend image
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

# Copy frontend build from previous stage (if it exists)
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist 2>/dev/null || true

# Create data directory
RUN mkdir -p data

# Expose port
EXPOSE 3000

# Environment variables for runtime configuration
ENV SKIP_FRONTEND_BUILD=1
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
