// Example Express middleware: ensure /api/* is handled by API and returns JSON 404,
// while non-/api routes use SPA fallback (index.html) only when frontend/dist exists.

const express = require('express');
const path = require('path');
const fs = require('fs');

const createApp = () => {
  const app = express();

  // Mount your API routes here before the static/fallback middleware
  // const apiRouter = require('./api');
  // app.use('/api', apiRouter);

  const distPath = path.join(__dirname, '..', 'frontend', 'dist');
  const hasFrontend = fs.existsSync(distPath);

  if (hasFrontend) {
    app.use(express.static(distPath, { index: false }));

    // Ensure unknown API routes return JSON 404 (place after API routers)
    app.use('/api', (req, res) => {
      res.status(404).json({ error: 'not found' });
    });

    // SPA fallback for non-API routes
    app.use((req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(distPath, 'index.html'), err => {
        if (err) next(err);
      });
    });
  } else {
    // No frontend: API 404 should be JSON; other routes 404 text/plain
    app.use('/api', (req, res) => {
      res.status(404).json({ error: 'not found' });
    });
    app.use((req, res) => {
      res.status(404).type('text').send('Not Found');
    });
  }

  return app;
};

module.exports = createApp;
