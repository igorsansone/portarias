# Dockerfile for portarias application
# Uses Node.js 18 Alpine as a stable, lightweight base image
# See README.md for more details

FROM node:18-alpine

WORKDIR /app

# Create backend directory for package files
RUN mkdir -p backend

# Copy backend package files first to leverage Docker layer caching
COPY backend/package.json ./backend/

# Install production dependencies
# Use npm install since package-lock.json may not exist
RUN cd backend && npm install --only=production

# Copy the rest of the repository
COPY . .

# Ensure start.sh is executable
RUN chmod +x ./start.sh

CMD ["./start.sh"]
