const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const dbPath = path.join(dataDir, 'portarias.db');
const db = new Database(dbPath);

// Migração simples: cria tabela se não existir
db.exec(`
CREATE TABLE IF NOT EXISTS portarias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ordem TEXT UNIQUE NOT NULL,
  objeto TEXT,
  requerente TEXT,
  passou_plenaria INTEGER DEFAULT 0,
  numero_plenaria TEXT,
  passou_diretoria INTEGER DEFAULT 0,
  numero_diretoria TEXT,
  passou_despacho INTEGER DEFAULT 0,
  numero_despacho TEXT,
  tem_pdf INTEGER DEFAULT 0,
  tem_word INTEGER DEFAULT 0,
  assinada INTEGER DEFAULT 0,
  publicada INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`);

// Seed: alguns exemplos (apenas se tabela vazia)
const row = db.prepare('SELECT COUNT(1) as cnt FROM portarias').get();
if (row.cnt === 0) {
  const insert = db.prepare(`INSERT INTO portarias
  (ordem, objeto, requerente, passou_plenaria, numero_plenaria, tem_pdf, tem_word, assinada, publicada)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  insert.run(
    '001/2026',
    'Nomeação de comissão X',
    'Cadastro',
    1,
    'PL-01/2026',
    1,
    0,
    1,
    1
  );
  insert.run(
    '002/2026',
    'Contrato de prestação de serviços Y',
    'Compras',
    0,
    null,
    0,
    1,
    0,
    0
  );
}

module.exports = db;
