import React, { useEffect, useState } from 'react'

const SECTORS = ['Cadastro','CPD','Financeiro','Contabilidade','Compras','Projur','Ética','Secretaria','Fiscalização']

export default function PortariaForm({ portaria, onClose, onSaved }) {
  const [form, setForm] = useState({
    ordem: '',
    objeto: '',
    requerente: '',
    passou_plenaria: false,
    numero_plenaria: '',
    passou_diretoria: false,
    numero_diretoria: '',
    passou_despacho: false,
    numero_despacho: '',
    tem_pdf: false,
    tem_word: false,
    assinada: false,
    publicada: false
  })
  useEffect(()=>{
    if (portaria && portaria.id) setForm({...form, ...portaria})
  },[portaria])

  const save = async () => {
    // Simple client validation
    if (!form.ordem) return alert('Ordem é obrigatória')
    if (form.passou_plenaria && !form.numero_plenaria) return alert('Número da plenária obrigatório')
    const method = portaria && portaria.id ? 'PUT' : 'POST'
    const url = portaria && portaria.id ? `/api/portarias/${portaria.id}` : '/api/portarias'
    const res = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    if (res.ok) { alert('Salvo'); onSaved(); } else {
      const err = await res.json()
      alert('Erro: ' + (err.error || ''))
    }
  }

  const onChange = (k,v) => setForm({...form, [k]: v})

  return (
    <div className="modal">
      <div className="modal-body">
        <h2>{portaria && portaria.id ? 'Editar Portaria' : 'Nova Portaria'}</h2>
        <div className="form-grid">
          <label>Ordem<br/><input value={form.ordem} onChange={e=>onChange('ordem', e.target.value)} /></label>
          <label>Objeto<br/><textarea value={form.objeto} onChange={e=>onChange('objeto', e.target.value)} /></label>
          <label>Requerente<br/>
            <select value={form.requerente} onChange={e=>onChange('requerente', e.target.value)}>
              <option value="">-- selecione --</option>
              {SECTORS.map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <label><input type="checkbox" checked={form.passou_plenaria} onChange={e=>onChange('passou_plenaria', e.target.checked)} /> Passou em plenária?</label>
          {form.passou_plenaria && <label>Nº plenária<br/><input value={form.numero_plenaria} onChange={e=>onChange('numero_plenaria', e.target.value)} /></label>}

          <label><input type="checkbox" checked={form.passou_diretoria} onChange={e=>onChange('passou_diretoria', e.target.checked)} /> Passou em diretoria?</label>
          {form.passou_diretoria && <label>Nº diretoria<br/><input value={form.numero_diretoria} onChange={e=>onChange('numero_diretoria', e.target.value)} /></label>}

          <label><input type="checkbox" checked={form.passou_despacho} onChange={e=>onChange('passou_despacho', e.target.checked)} /> Passou em despacho?</label>
          {form.passou_despacho && <label>Nº despacho<br/><input value={form.numero_despacho} onChange={e=>onChange('numero_despacho', e.target.value)} /></label>}

          <label><input type="checkbox" checked={form.tem_pdf} onChange={e=>onChange('tem_pdf', e.target.checked)} /> Tem PDF?</label>
          <label><input type="checkbox" checked={form.tem_word} onChange={e=>onChange('tem_word', e.target.checked)} /> Tem Word?</label>
          <label><input type="checkbox" checked={form.assinada} onChange={e=>onChange('assinada', e.target.checked)} /> Assinada?</label>
          <label><input type="checkbox" checked={form.publicada} onChange={e=>onChange('publicada', e.target.checked)} /> Publicada?</label>
        </div>

        <div className="actions">
          <button className="btn" onClick={save}>Salvar</button>
          <button className="btn" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}
