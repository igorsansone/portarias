# Use Node.js 18 LTS Alpine base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files for backend
COPY backend/package.json backend/package-lock.json* ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci --only=production || npm install --only=production

# Copy package files for frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./frontend/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm ci --only=production || npm install --only=production

# Copy the rest of the application code
WORKDIR /app
COPY . .

# Ensure start.sh is executable
RUN chmod +x /app/start.sh

# Expose port (default 8080, can be overridden)
EXPOSE 8080

# Use start.sh as entrypoint
ENTRYPOINT ["/app/start.sh"]
