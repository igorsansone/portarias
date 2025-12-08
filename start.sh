#!/usr/bin/env sh
set -eu

# Robust detection of npm / Node.js
NPM_CMD=""
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

if [ -z "$NPM_CMD" ]; then
  # As a last resort, if Node is present and an index file exists, run node directly
  if command -v node >/dev/null 2>&1 && [ -f index.js ]; then
    echo "npm not found; running node index.js"
    exec node index.js
  fi

  echo "ERROR: npm (or compatible package manager) not found in PATH."
  echo "Solution: use a Node.js base image (e.g. node:18-alpine) or install Node/npm in the image."
  exit 1
fi

echo "Using $NPM_CMD to start the app..."

# If package.json exists prefer running the start script (if present)
if [ -f package.json ]; then
  # Use npm run start --if-present to avoid failing if start script not defined
  exec "$NPM_CMD" run start --if-present
else
  # Fallback to node index.js if present
  if [ -f index.js ]; then
    exec node index.js
  fi

  echo "No package.json or index.js found; nothing to run"
  exit 1
fi
