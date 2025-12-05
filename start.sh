#!/usr/bin/env bash
set -euo pipefail

# Allow overriding the automatic detection with START_CMD environment variable
if [[ -n "${START_CMD:-}" ]]; then
  exec bash -lc "$START_CMD"
fi

# Helper function to check if a package.json has a specific script
has_npm_script() {
  local pkg_json="$1"
  local script_name="$2"
  if [[ -f "$pkg_json" ]]; then
    grep -q "\"$script_name\":" "$pkg_json" 2>/dev/null
  else
    return 1
  fi
}

# Backend detection
if [[ -d "backend" ]]; then
  if [[ -f "backend/package.json" ]]; then
    cd backend
    npm install --no-audit --no-fund
    if has_npm_script "package.json" "start"; then
      exec npm start
    elif has_npm_script "package.json" "dev"; then
      exec npm run dev
    fi
  fi

  if [[ -f "backend/requirements.txt" ]]; then
    cd backend
    python -m pip install --quiet --no-cache-dir -r requirements.txt
    if command -v gunicorn &>/dev/null; then
      exec gunicorn wsgi:app --bind "0.0.0.0:${PORT:-8080}"
    elif [[ -f "app.py" ]]; then
      exec python app.py
    fi
  fi
fi

# Frontend detection
if [[ -d "frontend" ]]; then
  if [[ -f "frontend/package.json" ]] && has_npm_script "frontend/package.json" "start"; then
    cd frontend
    npm install --no-audit --no-fund
    exec npm start
  fi

  if [[ -d "frontend/build" ]]; then
    exec python -m http.server "${PORT:-8080}" --directory frontend/build
  elif [[ -d "frontend/dist" ]]; then
    exec python -m http.server "${PORT:-8080}" --directory frontend/dist
  fi
fi

echo "Error: Could not detect how to start the application."
echo "Please set the START_CMD environment variable or ensure your project has a recognized structure."
exit 1
