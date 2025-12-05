# Dockerfile for portarias application
# Uses Node.js 18 Alpine as a stable, lightweight base image
# See README.md for more details

FROM node:18-alpine

WORKDIR /app

# Copy backend package files first to leverage Docker layer caching
COPY backend/package*.json ./backend/

# Install production dependencies
# Use npm ci if package-lock.json exists, otherwise use npm install
RUN cd backend && \
    if [ -f package-lock.json ]; then \
      npm ci --only=production; \
    else \
      npm install --only=production; \
    fi

# Copy the rest of the repository
COPY . .

# Ensure start.sh is executable
RUN chmod +x ./start.sh

CMD ["./start.sh"]
