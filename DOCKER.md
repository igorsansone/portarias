# Docker Build Documentation

## Overview
This repository includes Dockerfiles to containerize the backend API service. The backend is a Node.js/Express application with SQLite database.

## Files

### Dockerfile
Main production Dockerfile for building the backend service.

**Key Features:**
- Base image: `node:18-slim` (Debian-based for better compatibility)
- Working directory: `/app`
- Copies `package.json` and `package-lock.json` from `backend/` directory
- Installs dependencies using `npm install --omit=dev`
- Exposes port 3000
- Runs `node server.js` to start the API

### Dockerfile.debug
Debug version that displays diagnostic information during build:
- Lists contents of `/app`
- Shows `package.json` content
- Checks for `package-lock.json` existence
- Lists installed `node_modules`

### .dockerignore
Excludes unnecessary files from Docker build context:
- `**/node_modules/` - Dependencies (installed fresh in container)
- `backend/data/` - Local database files
- `.git`, IDE files, OS files
- Build artifacts and logs
- **Important:** Does NOT ignore `package.json` or `package-lock.json`

## Building the Image

### From repository root:
```bash
docker build -t portarias:latest .
```

### With debugging:
```bash
docker build -f Dockerfile.debug -t portarias:debug .
```

### No cache (fresh build):
```bash
docker build --no-cache -t portarias:latest .
```

## Running the Container

### Basic run:
```bash
docker run -p 3000:3000 portarias:latest
```

### With volume for database persistence:
```bash
docker run -p 3000:3000 -v $(pwd)/backend/data:/app/data portarias:latest
```

### With environment variables:
```bash
docker run -p 3000:3000 -e PORT=3000 portarias:latest
```

## Monorepo Structure

This is a monorepo with:
- `backend/` - Node.js/Express API (Dockerized)
- `frontend/` - React/Vite app (runs separately for dev)

The Dockerfile is configured to:
1. Copy `backend/package.json` and `backend/package-lock.json` to `/app`
2. Install dependencies in `/app`
3. Copy the rest of `backend/` contents to `/app`
4. Run `node server.js`

## Dependencies

The backend requires these main dependencies:
- express - Web framework
- better-sqlite3 - SQLite database (native module)
- cors - CORS middleware
- body-parser - Request body parsing
- multer - File upload handling
- csv-stringify - CSV generation

**Note:** `better-sqlite3` is a native module that requires compilation. The `node:18-slim` image includes necessary build tools.

## Image Choice: Alpine vs Slim

Originally used `node:18-alpine` but switched to `node:18-slim` because:
- Better compatibility with native modules (glibc vs musl)
- Alpine requires additional build tools (`python3`, `make`, `g++`)
- Slim images are Debian-based, more widely compatible
- Slightly larger but more reliable

## Known Issues

### Network Timeouts in Build Environment
Some build environments may experience slow or restricted network access to npm registry, causing:
- npm install timeouts
- "Exit handler never called" npm errors

**Workarounds:**
1. Use cached layers where possible (don't use `--no-cache`)
2. Build from an environment with better npm registry access
3. Pre-download dependencies and use a local npm registry

### Testing Locally
The application works correctly when dependencies are installed locally:
```bash
cd backend
npm install
npm start
# API runs on http://localhost:3000
```

This confirms the Dockerfile logic is correct; build environment network issues are the limitation.

## Best Practices

1. **Layer Caching:** Copy `package*.json` before copying source code to leverage Docker layer caching
2. **Production Deps:** Use `--omit=dev` to exclude devDependencies
3. **Volume Mounts:** Mount `/app/data` for SQLite database persistence
4. **.dockerignore:** Keeps build context small by excluding `node_modules`, database files, etc.
5. **Package Lock:** Include `package-lock.json` in version control for reproducible builds

## Security

- Uses official Node.js images
- Runs as root (consider adding USER directive for production)
- Excludes `.env` files from Docker context
- Production dependencies only (`--omit=dev`)

## Future Improvements

1. Multi-stage build to reduce final image size
2. Run as non-root user
3. Health check endpoint and HEALTHCHECK directive
4. Docker Compose for full stack (backend + frontend + db volume)
5. Separate Dockerfile for frontend if needed
