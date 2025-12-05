import React, { useEffect, useState } from 'react'

export default function PortariaList({ onEdit, onDeleted }) {
  const [list, setList] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState({ assinada: '', publicada: '', tem_pdf: '', tem_word: '' })

  const fetchList = async () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    Object.entries(filter).forEach(([k,v])=>{ if (v !== '') params.set(k, v) })
    const res = await fetch('/api/portarias?'+params.toString())
    const data = await res.json()
    setList(data)
  }

  useEffect(()=>{ fetchList() }, [])

  const doSearch = () => fetchList()

  const del = async (id) => {
    if (!confirm('Confirma exclusão?')) return;
    const res = await fetch('/api/portarias/'+id, { method: 'DELETE' })
    if (res.ok) { onDeleted(); fetchList(); alert('Excluído'); }
    else alert('Erro ao excluir')
  }

  return (
    <div className="card">
      <div className="filters">
        <input placeholder="Pesquisar..." value={search} onChange={e=>setSearch(e.target.value)} />
        <button className="btn" onClick={doSearch}>Pesquisar</button>
        <select value={filter.assinada} onChange={e=>setFilter({...filter, assinada: e.target.value})}>
          <option value="">Assinatura (todos)</option>
          <option value="true">Assinadas</option>
          <option value="false">Não assinadas</option>
        </select>
        <select value={filter.publicada} onChange={e=>setFilter({...filter, publicada: e.target.value})}>
          <option value="">Publicação (todos)</option>
          <option value="true">Publicadas</option>
          <option value="false">Não publicadas</option>
        </select>
        <select value={filter.tem_pdf} onChange={e=>setFilter({...filter, tem_pdf: e.target.value})}>
          <option value="">PDF</option>
          <option value="true">Tem PDF</option>
          <option value="false">Sem PDF</option>
        </select>
      </div>

      <table className="table">
        <thead>
          <tr><th>Ordem</th><th>Objeto</th><th>Requerente</th><th>Assinada</th><th>Publicada</th><th>PDF</th><th>Ações</th></tr>
        </thead>
        <tbody>
          {list.map(p => (
            <tr key={p.id}>
              <td>{p.ordem}</td>
              <td>{p.objeto}</td>
              <td>{p.requerente}</td>
              <td>{p.assinada ? 'Sim' : 'Não'}</td>
              <td>{p.publicada ? 'Sim' : 'Não'}</td>
              <td>{p.tem_pdf ? 'Sim' : 'Não'}</td>
              <td>
                <button className="btn" onClick={()=>onEdit(p)}>Editar</button>
                <button className="btn danger" onClick={()=>del(p.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
