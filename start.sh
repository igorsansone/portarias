#!/usr/bin/env sh
set -eu

# Detect script location and set working directory to repository root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Robust detection of npm / Node.js
NPM_CMD=""
NODE_CMD=""

if command -v npm >/dev/null 2>&1; then
  NPM_CMD="$(command -v npm)"
else
  # Try enabling corepack (if present) which can expose package managers in some images
  if command -v corepack >/dev/null 2>&1; then
    corepack enable >/dev/null 2>&1 || true
    if command -v npm >/dev/null 2>&1; then
      NPM_CMD="$(command -v npm)"
    fi
  fi
fi

if command -v node >/dev/null 2>&1; then
  NODE_CMD="$(command -v node)"
fi

if [ -z "$NPM_CMD" ]; then
  echo "ERROR: npm (or compatible package manager) not found in PATH."
  echo "Solution: use a Node.js base image (e.g. node:18-alpine) or install Node/npm in the image."
  exit 1
fi

echo "Using $NPM_CMD to start the app..."

# Frontend build handling
SKIP_BUILD="${SKIP_FRONTEND_BUILD:-}"
FRONTEND_DIR="frontend"
FRONTEND_PACKAGE_JSON="${FRONTEND_DIR}/package.json"
BACKEND_DIR="backend"

# Check if we should skip frontend build
should_skip_build() {
  [ "$SKIP_BUILD" = "1" ] || [ "$SKIP_BUILD" = "true" ]
}

# Check if frontend exists and is buildable
if [ -d "$FRONTEND_DIR" ] && [ -f "$FRONTEND_PACKAGE_JSON" ]; then
  if should_skip_build; then
    echo "Skipping frontend build (SKIP_FRONTEND_BUILD=${SKIP_BUILD})"
    echo "Warning: Frontend build may be missing. API-only mode if build doesn't exist."
  else
    echo "Building frontend..."
    
    # Perform the build (npm ci for clean install, fallback to npm install if no lockfile)
    if (cd "$FRONTEND_DIR" && ("$NPM_CMD" ci 2>/dev/null || "$NPM_CMD" install) && "$NPM_CMD" run build); then
      echo "Frontend build succeeded."
    else
      BUILD_EXIT_CODE=$?
      echo "ERROR: Frontend build failed with exit code $BUILD_EXIT_CODE"
      
      # Check if we're in CI or if forced to fail on build error
      if [ "${CI:-}" = "true" ] || [ "${FORCED_FAIL_ON_BUILD_ERROR:-}" = "1" ] || [ "${FORCED_FAIL_ON_BUILD_ERROR:-}" = "true" ]; then
        echo "Exiting due to build failure (CI=${CI:-false}, FORCED_FAIL_ON_BUILD_ERROR=${FORCED_FAIL_ON_BUILD_ERROR:-false})"
        exit $BUILD_EXIT_CODE
      else
        echo "Continuing in API-only mode (non-CI environment)"
        echo "Warning: Frontend build not found. The API will run without serving the frontend."
        echo "To build the frontend manually, run: cd frontend && npm run build"
      fi
    fi
  fi
else
  if [ ! -d "$FRONTEND_DIR" ]; then
    echo "Warning: Frontend directory not found at ./$FRONTEND_DIR"
  elif [ ! -f "$FRONTEND_PACKAGE_JSON" ]; then
    echo "Warning: Frontend package.json not found at ./$FRONTEND_PACKAGE_JSON"
  fi
  echo "Running in API-only mode."
fi

# Start the backend
if [ -d "$BACKEND_DIR" ] && [ -f "$BACKEND_DIR/package.json" ]; then
  echo "Starting backend..."
  cd "$BACKEND_DIR"
  
  # Install backend dependencies if needed (use ci if lockfile exists, otherwise install)
  if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    "$NPM_CMD" ci 2>/dev/null || "$NPM_CMD" install
  fi
  
  # Start the backend server
  exec "$NPM_CMD" run start --if-present
elif [ -f "backend/server.js" ]; then
  echo "Starting backend server directly..."
  cd backend
  exec "$NODE_CMD" server.js
else
  echo "ERROR: Backend not found. Expected backend/package.json or backend/server.js"
  exit 1
fi
