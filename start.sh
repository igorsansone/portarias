#!/bin/sh
set -e

echo "Starting Container"

# Check if npm is available
if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not available in this container."
  echo "To fix this, use a Node.js base image (e.g., node:18-alpine) in your Dockerfile,"
  echo "or install Node.js and npm in your Dockerfile."
  exit 1
fi

# Print node and npm versions for debugging
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"

# Store the original directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Allow overriding the automatic detection with START_CMD environment variable
if [ -n "${START_CMD:-}" ]; then
  exec sh -c "$START_CMD"
fi

# Helper function to check if a package.json has a specific script
has_npm_script() {
  pkg_json="$1"
  script_name="$2"
  if [ -f "$pkg_json" ]; then
    grep -q "\"$script_name\":" "$pkg_json" 2>/dev/null
  else
    return 1
  fi
}

# Backend detection
if [ -d "$SCRIPT_DIR/backend" ]; then
  if [ -f "$SCRIPT_DIR/backend/package.json" ]; then
    cd "$SCRIPT_DIR/backend" || exit 1
    npm install --no-audit --no-fund
    if has_npm_script "package.json" "start"; then
      exec npm start
    elif has_npm_script "package.json" "dev"; then
      exec npm run dev
    fi
  fi

  if [ -f "$SCRIPT_DIR/backend/requirements.txt" ]; then
    cd "$SCRIPT_DIR/backend" || exit 1
    python -m pip install --quiet --no-cache-dir -r requirements.txt
    if command -v gunicorn >/dev/null 2>&1; then
      # Try common WSGI entry points
      if [ -f "wsgi.py" ]; then
        exec gunicorn wsgi:app --bind "0.0.0.0:${PORT:-8080}"
      elif [ -f "app.py" ]; then
        exec gunicorn app:app --bind "0.0.0.0:${PORT:-8080}"
      elif [ -f "main.py" ]; then
        exec gunicorn main:app --bind "0.0.0.0:${PORT:-8080}"
      fi
    fi
    if [ -f "app.py" ]; then
      exec python app.py
    fi
  fi
fi

# Frontend detection
if [ -d "$SCRIPT_DIR/frontend" ]; then
  if [ -f "$SCRIPT_DIR/frontend/package.json" ] && has_npm_script "$SCRIPT_DIR/frontend/package.json" "start"; then
    cd "$SCRIPT_DIR/frontend" || exit 1
    npm install --no-audit --no-fund
    exec npm start
  fi

  if [ -d "$SCRIPT_DIR/frontend/build" ]; then
    exec python -m http.server "${PORT:-8080}" --directory "$SCRIPT_DIR/frontend/build"
  elif [ -d "$SCRIPT_DIR/frontend/dist" ]; then
    exec python -m http.server "${PORT:-8080}" --directory "$SCRIPT_DIR/frontend/dist"
  fi
fi

# If no package.json exists in expected locations
if [ ! -f "$SCRIPT_DIR/backend/package.json" ] && [ ! -f "$SCRIPT_DIR/frontend/package.json" ] && [ ! -f "$SCRIPT_DIR/package.json" ]; then
  echo "No package.json found. Nothing to start."
  exit 0
fi

echo "Error: Could not detect how to start the application."
echo "Please set the START_CMD environment variable or ensure your project has a recognized structure."
exit 1
