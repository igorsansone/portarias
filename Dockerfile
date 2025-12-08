FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists) from backend
COPY backend/package*.json ./

# Install dependencies
# Uses package-lock.json for reproducible builds if available
RUN npm install --omit=dev

# Copy the rest of the backend code
COPY backend/ ./

# Expose backend port
EXPOSE 3000

# Start the backend server
CMD ["node", "server.js"]
