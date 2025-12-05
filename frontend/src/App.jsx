import React, { useEffect, useState } from 'react'
import PortariaList from './components/PortariaList'
import PortariaForm from './components/PortariaForm'

export default function App() {
  const [editing, setEditing] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Controle de Portarias - CRORS</h1>
      </header>

      <main className="app-main">
        <div className="top-actions">
          <button className="btn" onClick={() => setEditing({})}>Inserir Portaria</button>
          <a className="btn" href="/api/export?tipo=all">Exportar CSV (todas)</a>
        </div>

        <PortariaList key={refreshKey} onEdit={(p)=>setEditing(p)} onDeleted={() => setRefreshKey(k=>k+1)} />

        {editing && <PortariaForm portaria={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setRefreshKey(k=>k+1); }} />}
      </main>

      <footer className="app-footer">CRORS — Sistema de Portarias</footer>
    </div>
  )
}
