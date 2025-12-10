const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const stringify = require('csv-stringify').stringify;

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors());
app.use(bodyParser.json());
app.use('/api/', limiter);

// Helpers
function toBooleanInt(v) {
  return v ? 1 : 0;
}

// Listagem com pesquisa e filtros
app.get('/api/portarias', (req, res) => {
  const {
    search,
    assinada,
    publicada,
    tem_pdf,
    tem_word,
    page = 1,
    limit = 20,
  } = req.query;
  const offset = (page - 1) * limit;
  let filters = [];
  let params = [];

  if (search) {
    filters.push('(ordem LIKE ? OR objeto LIKE ? OR requerente LIKE ?)');
    const s = `%${search}%`;
    params.push(s, s, s);
  }
  if (assinada !== undefined) {
    filters.push('assinada = ?');
    params.push(assinada == 'true' ? 1 : 0);
  }
  if (publicada !== undefined) {
    filters.push('publicada = ?');
    params.push(publicada == 'true' ? 1 : 0);
  }
  if (tem_pdf !== undefined) {
    filters.push('tem_pdf = ?');
    params.push(tem_pdf == 'true' ? 1 : 0);
  }
  if (tem_word !== undefined) {
    filters.push('tem_word = ?');
    params.push(tem_word == 'true' ? 1 : 0);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const stmt = db.prepare(
    `SELECT * FROM portarias ${where} ORDER BY ordem LIMIT ? OFFSET ?`
  );
  const rows = stmt.all(...params, Number(limit), Number(offset));
  res.json(rows);
});

// Get por id
app.get('/api/portarias/:id', (req, res) => {
  const row = db
    .prepare('SELECT * FROM portarias WHERE id = ?')
    .get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// Create
app.post('/api/portarias', (req, res) => {
  const p = req.body;
  if (!p.ordem) return res.status(400).json({ error: 'ordem é obrigatória' });

  // Valida campos condicionais
  if (p.passou_plenaria && !p.numero_plenaria)
    return res
      .status(400)
      .json({ error: 'numero_plenaria é obrigatório se passou_plenaria' });
  if (p.passou_diretoria && !p.numero_diretoria)
    return res
      .status(400)
      .json({ error: 'numero_diretoria é obrigatório se passou_diretoria' });
  if (p.passou_despacho && !p.numero_despacho)
    return res
      .status(400)
      .json({ error: 'numero_despacho é obrigatório se passou_despacho' });

  // Inserção
  try {
    const stmt = db.prepare(`INSERT INTO portarias
      (ordem, objeto, requerente, passou_plenaria, numero_plenaria, passou_diretoria, numero_diretoria, passou_despacho, numero_despacho, tem_pdf, tem_word, assinada, publicada)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const info = stmt.run(
      p.ordem,
      p.objeto || '',
      p.requerente || '',
      toBooleanInt(p.passou_plenaria),
      p.numero_plenaria || null,
      toBooleanInt(p.passou_diretoria),
      p.numero_diretoria || null,
      toBooleanInt(p.passou_despacho),
      p.numero_despacho || null,
      toBooleanInt(p.tem_pdf),
      toBooleanInt(p.tem_word),
      toBooleanInt(p.assinada),
      toBooleanInt(p.publicada)
    );
    const created = db
      .prepare('SELECT * FROM portarias WHERE id = ?')
      .get(info.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE'))
      return res.status(400).json({ error: 'Ordem já existe' });
    res.status(500).json({ error: err.message });
  }
});

// Update
app.put('/api/portarias/:id', (req, res) => {
  const p = req.body;
  const id = req.params.id;
  // Validations as above
  if (p.passou_plenaria && !p.numero_plenaria)
    return res
      .status(400)
      .json({ error: 'numero_plenaria é obrigatório se passou_plenaria' });

  try {
    db.prepare(
      `UPDATE portarias SET
      ordem = ?, objeto = ?, requerente = ?, passou_plenaria = ?, numero_plenaria = ?, passou_diretoria = ?, numero_diretoria = ?, passou_despacho = ?, numero_despacho = ?, tem_pdf = ?, tem_word = ?, assinada = ?, publicada = ?, updated_at = datetime('now')
      WHERE id = ?`
    ).run(
      p.ordem,
      p.objeto || '',
      p.requerente || '',
      toBooleanInt(p.passou_plenaria),
      p.numero_plenaria || null,
      toBooleanInt(p.passou_diretoria),
      p.numero_diretoria || null,
      toBooleanInt(p.passou_despacho),
      p.numero_despacho || null,
      toBooleanInt(p.tem_pdf),
      toBooleanInt(p.tem_word),
      toBooleanInt(p.assinada),
      toBooleanInt(p.publicada),
      id
    );
    const updated = db.prepare('SELECT * FROM portarias WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE'))
      return res.status(400).json({ error: 'Ordem já existe' });
    res.status(500).json({ error: err.message });
  }
});

// Delete
app.delete('/api/portarias/:id', (req, res) => {
  const id = req.params.id;
  const info = db.prepare('DELETE FROM portarias WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ deleted: true });
});

// Relatório de pendentes
// tipo = assinatura|publicacao|documento
app.get('/api/report', (req, res) => {
  const { tipo } = req.query;
  let rows;
  if (tipo === 'assinatura') {
    rows = db
      .prepare('SELECT * FROM portarias WHERE assinada = 0 ORDER BY ordem')
      .all();
  } else if (tipo === 'publicacao') {
    rows = db
      .prepare('SELECT * FROM portarias WHERE publicada = 0 ORDER BY ordem')
      .all();
  } else if (tipo === 'documento') {
    rows = db
      .prepare(
        'SELECT * FROM portarias WHERE (tem_pdf = 0 AND tem_word = 0) ORDER BY ordem'
      )
      .all();
  } else {
    rows = db.prepare('SELECT * FROM portarias ORDER BY ordem').all();
  }
  res.json(rows);
});

// Export CSV do relatório
app.get('/api/export', (req, res) => {
  const { tipo } = req.query;
  let rows;
  if (tipo === 'assinatura') {
    rows = db
      .prepare('SELECT * FROM portarias WHERE assinada = 0 ORDER BY ordem')
      .all();
  } else if (tipo === 'publicacao') {
    rows = db
      .prepare('SELECT * FROM portarias WHERE publicada = 0 ORDER BY ordem')
      .all();
  } else if (tipo === 'documento') {
    rows = db
      .prepare(
        'SELECT * FROM portarias WHERE (tem_pdf = 0 AND tem_word = 0) ORDER BY ordem'
      )
      .all();
  } else {
    rows = db.prepare('SELECT * FROM portarias ORDER BY ordem').all();
  }

  const columns = [
    'ordem',
    'objeto',
    'requerente',
    'assinada',
    'publicada',
    'tem_pdf',
    'tem_word',
    'created_at',
  ];
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="portarias_${tipo || 'all'}.csv"`
  );

  stringify(
    rows.map((r) => columns.map((c) => r[c])),
    { header: true, columns },
    (err, output) => {
      if (err) return res.status(500).send(err.message);
      res.send(output);
    }
  );
});

// Serve static files from the frontend build directory
// Use environment variable for flexibility in different deployments
const frontendPath =
  process.env.FRONTEND_PATH || path.join(__dirname, '..', 'frontend', 'dist');

// Check if frontend build exists
const indexPath = path.join(frontendPath, 'index.html');
if (fs.existsSync(indexPath)) {
  app.use(express.static(frontendPath));

  // Catch-all route to serve index.html for single-page application routing
  // This must be after all API routes
  // Note: Rate limiting is not applied here as this serves static frontend files
  // which are essential for the UI and not computationally expensive.
  // API routes are protected by rate limiting (see line 21).
  app.get('*', (req, res) => {
    // Ensure API routes that don't exist return JSON 404, not HTML
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).json({
          error: 'Failed to serve frontend application',
          message:
            'The frontend build may be missing. Run "npm run build" in the frontend directory.',
        });
      }
    });
  });
} else {
  console.warn(
    `Warning: Frontend build not found at ${frontendPath}. API-only mode.`
  );
  console.warn('To build the frontend, run: cd frontend && npm run build');
  
  // API-only mode: return JSON 404 for unknown API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Not found' });
    }
    // Non-API routes in API-only mode
    res.status(404).json({ 
      error: 'Frontend not available',
      message: 'The frontend build is not available. This server is running in API-only mode.'
    });
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
  console.log(`Servindo arquivos estáticos de: ${frontendPath}`);
});
