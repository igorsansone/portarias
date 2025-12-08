FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package manifests first to leverage Docker cache
COPY package*.json ./

# Install dependencies
# Use npm ci if package-lock.json exists, otherwise npm install.
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi

# Copy application code
COPY . .

# Ensure start script is executable
RUN chmod +x ./start.sh

# Expose port (adjust if your app uses a different port)
EXPOSE 3000

# Use the project start script
CMD ["./start.sh"]
