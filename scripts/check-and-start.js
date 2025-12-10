#!/usr/bin/env node

/**
 * check-and-start.js
 * 
 * Ensures frontend is built before starting the backend server.
 * This script:
 * 1. Detects the package manager (npm/yarn/pnpm) from lockfiles
 * 2. Checks if frontend build directory exists (frontend/dist for Vite)
 * 3. If missing, builds the frontend
 * 4. Starts the backend server
 * 
 * Exit codes:
 * 0 - Success
 * 1 - Build or start failure
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(REPO_ROOT, 'frontend');
const FRONTEND_DIST = path.join(FRONTEND_DIR, 'dist');
const BACKEND_DIR = path.join(REPO_ROOT, 'backend');

// Detect package manager from lockfiles
function detectPackageManager() {
  const frontendLockfiles = {
    'package-lock.json': 'npm',
    'yarn.lock': 'yarn',
    'pnpm-lock.yaml': 'pnpm',
  };

  for (const [lockfile, pm] of Object.entries(frontendLockfiles)) {
    if (fs.existsSync(path.join(FRONTEND_DIR, lockfile))) {
      return pm;
    }
  }
  
  // Default to npm if no lockfile found
  return 'npm';
}

// Run a command and return a promise
function runCommand(cmd, args, cwd, label) {
  return new Promise((resolve, reject) => {
    console.log(`[${label}] Running: ${cmd} ${args.join(' ')}`);
    const proc = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`[${label}] Success`);
        resolve();
      } else {
        console.error(`[${label}] Failed with exit code ${code}`);
        reject(new Error(`${label} failed with exit code ${code}`));
      }
    });

    proc.on('error', (err) => {
      console.error(`[${label}] Error:`, err);
      reject(err);
    });
  });
}

// Check if frontend build exists
function frontendBuildExists() {
  return fs.existsSync(FRONTEND_DIST) && fs.readdirSync(FRONTEND_DIST).length > 0;
}

// Build frontend if needed
async function ensureFrontendBuild() {
  // Check if SKIP_FRONTEND_BUILD is set
  if (process.env.SKIP_FRONTEND_BUILD === '1' || process.env.SKIP_FRONTEND_BUILD === 'true') {
    console.log('[Frontend] SKIP_FRONTEND_BUILD is set, skipping build check');
    return;
  }

  if (frontendBuildExists()) {
    console.log('[Frontend] Build already exists at', FRONTEND_DIST);
    return;
  }

  console.log('[Frontend] Build not found, building frontend...');
  
  if (!fs.existsSync(FRONTEND_DIR)) {
    console.warn('[Frontend] Frontend directory not found at', FRONTEND_DIR);
    console.warn('[Frontend] Running in API-only mode');
    return;
  }

  const pm = detectPackageManager();
  console.log(`[Frontend] Detected package manager: ${pm}`);

  try {
    // Install dependencies
    const installCmd = pm === 'npm' && fs.existsSync(path.join(FRONTEND_DIR, 'package-lock.json'))
      ? 'ci'
      : 'install';
    
    await runCommand(pm, [installCmd], FRONTEND_DIR, 'Frontend Install');

    // Build frontend
    await runCommand(pm, ['run', 'build'], FRONTEND_DIR, 'Frontend Build');

    console.log('[Frontend] Build completed successfully');
  } catch (err) {
    // Check if we should fail on build error
    if (process.env.CI === 'true' || process.env.FORCED_FAIL_ON_BUILD_ERROR === '1') {
      console.error('[Frontend] Build failed and CI or FORCED_FAIL_ON_BUILD_ERROR is set');
      throw err;
    } else {
      console.warn('[Frontend] Build failed, but continuing in API-only mode');
      console.warn('[Frontend] Error:', err.message);
    }
  }
}

// Start backend server
async function startBackend() {
  console.log('[Backend] Starting server...');
  
  const backendScript = path.join(BACKEND_DIR, 'server.js');
  
  if (!fs.existsSync(backendScript)) {
    throw new Error(`Backend script not found at ${backendScript}`);
  }

  // Spawn the backend process and replace current process
  const proc = spawn('node', [backendScript], {
    cwd: BACKEND_DIR,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  // Forward signals to child process
  process.on('SIGTERM', () => proc.kill('SIGTERM'));
  process.on('SIGINT', () => proc.kill('SIGINT'));

  proc.on('close', (code) => {
    process.exit(code || 0);
  });

  proc.on('error', (err) => {
    console.error('[Backend] Error starting server:', err);
    process.exit(1);
  });
}

// Main execution
async function main() {
  try {
    await ensureFrontendBuild();
    await startBackend();
  } catch (err) {
    console.error('[Error]', err.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { ensureFrontendBuild, startBackend };
