# Build and Deployment Guide

## Docker Build

### Overview
This repository contains a monorepo with separate `backend/` (Node.js/Express API) and `frontend/` (React/Vite) directories. The Dockerfiles are configured to build and run the backend API service.

### Fixed Issues
The Docker build was failing because:
1. ❌ **Old Issue**: Dockerfile tried to copy `package.json` from root directory
2. ❌ **Old Issue**: No `package.json` existed at root (only in `backend/` and `frontend/`)
3. ❌ **Old Issue**: Missing `.dockerignore` file
4. ✅ **Fixed**: Dockerfile now correctly copies from `backend/` directory
5. ✅ **Fixed**: Added `.dockerignore` to exclude `node_modules` while including `package.json`
6. ✅ **Fixed**: Set `WORKDIR /app` for consistent working directory
7. ✅ **Fixed**: Use `package*.json` wildcard to handle missing `package-lock.json`
8. ✅ **Fixed**: Dependencies installed before copying source for better layer caching

### Building the Docker Image

#### Option 1: Alpine-based Image (Recommended)
```bash
docker build -t portarias:latest .
```

**Note**: The backend uses `better-sqlite3` which is a native module requiring build tools. The Dockerfile attempts to install build tools (`python3`, `make`, `g++`) via `apk`. In environments with network restrictions where `apk` cannot access package repositories, the build may continue but dependency installation could fail. In that case, use Option 2 (Debian-based image).

#### Option 2: Debian-based Image (Full Node.js with Build Tools)
```bash
docker build -f Dockerfile.debian -t portarias:latest .
```

This uses the full Debian-based Node.js image which includes all necessary build tools.

#### Debug Build
To debug the build and see what files are being copied:
```bash
docker build -f Dockerfile.debug -t portarias:debug .
```

### Running the Container

```bash
# Run the backend API on port 3000
docker run -p 3000:3000 portarias:latest

# Run in detached mode
docker run -d -p 3000:3000 --name portarias-backend portarias:latest

# View logs
docker logs portarias-backend

# Stop the container
docker stop portarias-backend
docker rm portarias-backend
```

### Testing the API

Once the container is running, test the API endpoints:

```bash
# Health check / List portarias
curl http://localhost:3000/api/portarias

# Get specific portaria
curl http://localhost:3000/api/portarias/1

# Create new portaria
curl -X POST http://localhost:3000/api/portarias \
  -H "Content-Type: application/json" \
  -d '{"ordem":"001/2025","objeto":"Test","requerente":"User"}'
```

## Local Development (Without Docker)

### Backend
```bash
cd backend
npm install
npm start
```

The backend API will run on `http://localhost:3000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` and proxy API requests to `http://localhost:3000`

## File Structure

```
portarias/
├── backend/
│   ├── package.json       # Backend dependencies
│   ├── server.js          # Express API server
│   ├── db.js             # SQLite database setup
│   └── data/             # SQLite database storage (created on first run)
├── frontend/
│   ├── package.json      # Frontend dependencies
│   └── src/              # React application source
├── Dockerfile            # Alpine-based Node.js image
├── Dockerfile.debian     # Debian-based Node.js image (includes build tools)
├── Dockerfile.debug      # Debug version with verbose output
├── .dockerignore         # Files to exclude from Docker build
└── .gitignore           # Files to exclude from git
```

## Docker Layer Caching

The Dockerfiles are optimized for layer caching:
1. **Layer 1**: Base image (node:18-alpine or node:18)
2. **Layer 2**: Set WORKDIR /app
3. **Layer 3**: Copy only package.json (changes rarely)
4. **Layer 4**: Install dependencies (cached unless package.json changes)
5. **Layer 5**: Copy application code (changes frequently)

This means that dependency installation is only re-run when `package.json` changes, significantly speeding up subsequent builds.

## Environment Variables

The backend accepts the following environment variables:

- `PORT`: API port (default: 3000)

Example:
```bash
docker run -p 8080:8080 -e PORT=8080 portarias:latest
```

## Troubleshooting

### Build fails with "better-sqlite3" native module error
**Solution**: Use the Debian-based Dockerfile:
```bash
docker build -f Dockerfile.debian -t portarias:latest .
```

### "Cannot find module" error when running container
**Cause**: Dependencies were not installed during build
**Solution**: 
1. Ensure you have internet access during build
2. Try using `Dockerfile.debian` instead of `Dockerfile`
3. Check that `backend/package.json` exists

### Port 3000 already in use
**Solution**: Either:
1. Stop the service using port 3000, or
2. Map to a different port: `docker run -p 8080:3000 portarias:latest`

## Production Considerations

For production deployment:

1. **Multi-stage build**: Consider creating a multi-stage Dockerfile to reduce final image size
2. **Health checks**: Add Docker health check instructions
3. **Volume mounts**: Mount `/app/backend/data` to persist SQLite database
4. **Environment variables**: Use environment variables for configuration
5. **Logging**: Configure proper logging and log rotation
6. **Security**: Run as non-root user, scan for vulnerabilities

Example production command:
```bash
docker run -d \
  -p 3000:3000 \
  -v /path/to/data:/app/backend/data \
  -e NODE_ENV=production \
  --restart unless-stopped \
  --name portarias-backend \
  portarias:latest
```
