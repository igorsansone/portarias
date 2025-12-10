#!/usr/bin/env sh
# Robust start script: build frontend when possible, fall back to API-only.
# Usage: ./scripts/start.sh <cmd-to-start-backend>...
set -eu

log() { printf '%s\n' "$*"; }

# Resolve paths
SCRIPT_DIR="$(cd "$(dirname "$0")" >/dev/null 2>&1 && pwd)"
# If script is in scripts/ subdirectory, go up one level; otherwise REPO_ROOT is SCRIPT_DIR
if [ "$(basename "$SCRIPT_DIR")" = "scripts" ]; then
  REPO_ROOT="$(cd "$SCRIPT_DIR/.." >/dev/null 2>&1 && pwd)"
else
  REPO_ROOT="$SCRIPT_DIR"
fi
FRONTEND_DIR="$REPO_ROOT/frontend"
DIST_DIR="$FRONTEND_DIR/dist"

# Env flags:
# SKIP_FRONTEND_BUILD=1|true  => skip build
# CI=true                     => fail start when build fails
# FORCED_FAIL_ON_BUILD_ERROR=1 => fail start on build error even if not CI

log "Start script: checking frontend build..."

if [ -d "$FRONTEND_DIR" ] && [ -f "$FRONTEND_DIR/package.json" ]; then
  if [ -d "$DIST_DIR" ]; then
    log "Frontend build detected at $DIST_DIR"
    FRONTEND_BUILT=1
  else
    FRONTEND_BUILT=0
  fi

  if [ "${SKIP_FRONTEND_BUILD:-}" = "1" ] || [ "${SKIP_FRONTEND_BUILD:-}" = "true" ]; then
    log "SKIP_FRONTEND_BUILD set; skipping frontend build"
  else
    if [ "$FRONTEND_BUILT" -eq 0 ]; then
      if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
        log "Building frontend: $FRONTEND_DIR"
        cd "$FRONTEND_DIR" || {
          log "Failed to cd to $FRONTEND_DIR"; exit 1
        }

        build_err=""
        if [ -f package-lock.json ]; then
          if ! npm ci --silent; then build_err=$?; fi
        else
          if ! npm install --silent; then build_err=$?; fi
        fi

        if [ -z "$build_err" ]; then
          if ! npm run build --silent; then build_err=$?; fi
        fi

        if [ -z "$build_err" ]; then
          log "Frontend build succeeded"
        else
          log "Frontend build failed with exit code ${build_err}"
          if [ "${CI:-}" = "true" ] || [ "${FORCED_FAIL_ON_BUILD_ERROR:-}" = "1" ]; then
            log "CI or FORCED_FAIL_ON_BUILD_ERROR detected — failing start"
            exit "${build_err}"
          else
            log "Continuing in API-only mode (frontend not available)"
          fi
        fi

        cd "$REPO_ROOT" || exit 1
      else
        log "Warning: node/npm not found in PATH. Skipping frontend build. API-only mode."
      fi
    else
      log "Skipping build: frontend already built"
    fi
  fi
else
  log "No frontend found at $FRONTEND_DIR. API-only mode."
fi

# Final check: warn if dist directory is still missing
if [ ! -d "$DIST_DIR" ]; then
  log "Warning: Frontend build not found at $DIST_DIR. API-only mode."
  log "To build the frontend, run: cd frontend && npm run build"
fi

log "Starting backend process..."
if [ "$#" -gt 0 ]; then
  exec "$@"
else
  if [ -x "./bin/portarias" ]; then
    exec ./bin/portarias
  else
    log "No command provided to start the backend and no ./bin/portarias found. Exiting."
    exit 1
  fi
fi
