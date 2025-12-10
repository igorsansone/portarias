# Multi-stage build: Stage 1 - Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies (prefer npm ci for reproducible builds)
RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# Copy frontend source
COPY frontend/ ./

# Build frontend (can be skipped with --build-arg SKIP_FRONTEND_BUILD=1)
ARG SKIP_FRONTEND_BUILD=0
RUN if [ "$SKIP_FRONTEND_BUILD" != "1" ]; then \
      npm run build; \
    else \
      mkdir -p dist && echo "Frontend build skipped" > dist/.skip; \
    fi

# Stage 2 - Build backend image
FROM node:18-alpine

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies (prefer npm ci for reproducible builds)
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi

# Copy backend code
COPY backend/ ./

# Copy frontend build from previous stage
# Note: This will copy the dist directory if it was built in stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create data directory
RUN mkdir -p data

# Expose port
EXPOSE 3000

# Environment variables for runtime configuration
ENV SKIP_FRONTEND_BUILD=1
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
