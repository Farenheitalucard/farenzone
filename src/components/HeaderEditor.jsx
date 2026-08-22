import { useState } from 'react'
import { setHeaderConfig } from '../data/headerConfig'
import { useHeaderConfig } from '../hooks/useHeaderConfig'
import {
  ELEMENT_TYPES, DEVICE_ICONS, DEVICE_LABELS,
  deepClone, sortEls, sortRows,
  blankElement, blankRow, defaultLayout, generateRowsFromFlat,
} from './headerEditorUtils'
import { DesignControls, EditElementPanel, RowCard } from './headerEditorParts'

export function HeaderEditor({ token }) {
  const headerConfig = useHeaderConfig()
  const [draft, setDraft] = useState(null)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [editingEl, setEditingEl] = useState(null)
  const [expandedRow, setExpandedRow] = useState(null)
  const [addElRowId, setAddElRowId] = useState(null)

  const cfg = draft || headerConfig

  function makeDraft() {
    if (draft) return draft
    var d = deepClone(headerConfig)
    setDraft(d)
    return d
  }

  function updateCfg(patch) {
    setDraft(function(prev) {
      var base = prev || deepClone(headerConfig)
      var next = Object.assign({}, base, patch)
      setHeaderConfig(next)
      return next
    })
  }

  function updateBrand(patch) {
    updateCfg({ brand: Object.assign({}, cfg.brand, patch) })
  }

  function updateDeviceLayout(dk, patch) {
    var base = makeDraft()
    var devices = Object.assign({}, base.devices)
    devices[dk] = Object.assign({}, devices[dk] || defaultLayout(dk), patch)
    updateCfg({ devices: devices })
  }

  function getRows(dk) {
    var d = cfg.devices && cfg.devices[dk]
    return Array.isArray(d && d.rows) ? d.rows : []
  }

  function ensureRows(dk) {
    var rows = getRows(dk)
    if (rows.length === 0) {
      var flatEls = (cfg.devices && cfg.devices[dk] && cfg.devices[dk].elements) || cfg.elements || []
      rows = generateRowsFromFlat(flatEls)
      var base = makeDraft()
      var devices = Object.assign({}, base.devices)
      devices[dk] = Object.assign({}, devices[dk] || defaultLayout(dk), { rows: rows })
      updateCfg({ devices: devices })
    }
    return rows
  }

  function updateRows(dk, newRows) {
    var base = makeDraft()
    var devices = Object.assign({}, base.devices)
    devices[dk] = Object.assign({}, devices[dk] || defaultLayout(dk), { rows: newRows })
    updateCfg({ devices: devices })
  }

  function addRow(dk) {
    var rows = ensureRows(dk)
    updateRows(dk, rows.concat([blankRow(rows.length)]))
  }

  function removeRow(dk, rowId) {
    updateRows(dk, getRows(dk).filter(function(r) { return r.id !== rowId }).map(function(r, i) { return Object.assign({}, r, { order: i }) }))
    if (expandedRow === rowId) setExpandedRow(null)
  }

  function moveRowFn(dk, rowId, dir) {
    var sorted = sortRows(getRows(dk))
    var idx = sorted.findIndex(function(r) { return r.id === rowId })
    if (idx < 0) return
    var swap = idx + dir
    if (swap < 0 || swap >= sorted.length) return
    var tmp = sorted[idx].order
    sorted[idx] = Object.assign({}, sorted[idx], { order: sorted[swap].order })
    sorted[swap] = Object.assign({}, sorted[swap], { order: tmp })
    updateRows(dk, sorted)
  }

  function updateRow(dk, rowId, patch) {
    updateRows(dk, getRows(dk).map(function(r) { return r.id === rowId ? Object.assign({}, r, patch) : r }))
  }

  function addElementToRow(dk, rowId, element) {
    var rows = getRows(dk)
    var row = rows.find(function(r) { return r.id === rowId })
    if (!row) return
    var els = row.elements || []
    updateRows(dk, rows.map(function(r) {
      if (r.id !== rowId) return r
      return Object.assign({}, r, { elements: els.concat([Object.assign({}, element, { order: els.length, visible: true })]) })
    }))
    setAddElRowId(null)
  }

  function removeElementFromRow(dk, rowId, elId) {
    var rows = getRows(dk)
    updateRows(dk, rows.map(function(r) {
      if (r.id !== rowId) return r
      return Object.assign({}, r, { elements: r.elements.filter(function(e) { return e.id !== elId }).map(function(e, i) { return Object.assign({}, e, { order: i }) }) })
    }))
  }

  function moveElementInRow(dk, rowId, elId, dir) {
    var rows = getRows(dk)
    updateRows(dk, rows.map(function(r) {
      if (r.id !== rowId) return r
      var els = sortEls(r.elements)
      var idx = els.findIndex(function(e) { return e.id === elId })
      if (idx < 0) return r
      var swap = idx + dir
      if (swap < 0 || swap >= els.length) return r
      var tmp = els[idx].order
      els[idx] = Object.assign({}, els[idx], { order: els[swap].order })
      els[swap] = Object.assign({}, els[swap], { order: tmp })
      return Object.assign({}, r, { elements: els })
    }))
  }

  function updateElementInRow(dk, rowId, elId, patch) {
    var rows = getRows(dk)
    updateRows(dk, rows.map(function(r) {
      if (r.id !== rowId) return r
      return Object.assign({}, r, { elements: r.elements.map(function(e) { return e.id === elId ? Object.assign({}, e, patch) : e }) })
    }))
  }

  function moveElementToRow(dk, fromRowId, elId, toRowId) {
    var rows = getRows(dk).slice()
    var el = null
    rows = rows.map(function(r) {
      if (r.id === fromRowId) {
        var found = r.elements.find(function(e) { return e.id === elId })
        if (found) el = Object.assign({}, found)
        return Object.assign({}, r, { elements: r.elements.filter(function(e) { return e.id !== elId }).map(function(e, i) { return Object.assign({}, e, { order: i }) }) })
      }
      return r
    })
    if (!el) return
    rows = rows.map(function(r) {
      if (r.id === toRowId) {
        var newEls = r.elements.concat([Object.assign({}, el, { order: r.elements.length })])
        return Object.assign({}, r, { elements: newEls })
      }
      return r
    })
    updateRows(dk, rows)
  }

  async function save() {
    if (!draft) return
    setSaving(true)
    setMsg('')
    try {
      var res = await fetch('/api/admin/header', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ config: draft }),
      })
      if (!res.ok) throw new Error('save failed')
      var data = await res.json()
      setHeaderConfig(data.config)
      setDraft(null)
      setEditingEl(null)
      setExpandedRow(null)
      setAddElRowId(null)
      setMsg('Configuracion guardada')
    } catch(e) {
      setMsg('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  function cancel() {
    setDraft(null)
    setEditingEl(null)
    setExpandedRow(null)
    setAddElRowId(null)
    setMsg('')
  }

  var hasChanges = draft !== null

  if (!selectedDevice) {
    return (
      <div className="header-editor">
        {msg && <p className="admin-msg">{msg}</p>}
        <h2>Editor del encabezado</h2>
        <p className="header-editor-subtitle">Selecciona que version deseas editar</p>
        <div className="header-device-selector">
          {['pc', 'mobile', 'tablet', 'general'].map(function(d) {
            return (
              <button key={d} type="button" className="header-device-card" onClick={function() { setSelectedDevice(d) }}>
                <span className="header-device-card-icon">{DEVICE_ICONS[d]}</span>
                <span className="header-editor-card-label">{DEVICE_LABELS[d]}</span>
                <span className="header-device-card-desc">
                  {d === 'pc' && 'Filas, elementos, diseno y disposicion de escritorio'}
                  {d === 'mobile' && 'Filas, elementos, diseno y disposicion movil'}
                  {d === 'tablet' && 'Filas, elementos, diseno y disposicion tablet'}
                  {d === 'general' && 'Marca, nombre e informacion compartida entre dispositivos'}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (selectedDevice === 'general') {
    return (
      <div className="header-editor">
        {msg && <p className="admin-msg">{msg}</p>}
        <div className="admin-form-head">
          <h2>Configuracion general</h2>
          <div>
            {hasChanges && <button type="button" onClick={cancel} style={{ marginRight: 8 }}>Descartar</button>}
            <button type="button" className="admin-btn-primary" onClick={save} disabled={saving || !hasChanges}>{saving ? '...' : 'Guardar'}</button>
          </div>
        </div>
        <button type="button" className="header-back-btn" onClick={function() { setSelectedDevice(null); setEditingEl(null); setExpandedRow(null) }}>&#8592; Volver</button>
        <fieldset className="admin-fs">
          <legend>Marca</legend>
          <div className="admin-grid">
            <label>Nombre<input value={(cfg.brand && cfg.brand.name) || ''} onChange={function(e) { updateBrand({ name: e.target.value }) }} /></label>
            <label>Acento<input value={(cfg.brand && cfg.brand.nameAccent) || ''} onChange={function(e) { updateBrand({ nameAccent: e.target.value }) }} /></label>
            <label>Enlace<input value={(cfg.brand && cfg.brand.url) || '/'} onChange={function(e) { updateBrand({ url: e.target.value }) }} /></label>
          </div>
        </fieldset>
      </div>
    )
  }

  var dk = selectedDevice
  var layout = (cfg.devices && cfg.devices[dk]) || defaultLayout(dk)
  var rowsList = sortRows(getRows(dk))
  var globalPool = (cfg.elements || []).slice().sort(function(a, b) { return (a.order ?? 0) - (b.order ?? 0) })

  var elementsInRows = {}
  rowsList.forEach(function(r) {
    (r.elements || []).forEach(function(el) { elementsInRows[el.id] = r.name })
  })

  var availableForDropdown = globalPool.filter(function(el) { return !elementsInRows[el.id] })

  return (
    <div className="header-editor">
      {msg && <p className="admin-msg">{msg}</p>}
      <div className="admin-form-head">
        <h2>{DEVICE_ICONS[dk]} Editar version {DEVICE_LABELS[dk]}</h2>
        <div>
          {hasChanges && <button type="button" onClick={cancel} style={{ marginRight: 8 }}>Descartar</button>}
          <button type="button" className="admin-btn-primary" onClick={save} disabled={saving || !hasChanges}>{saving ? '...' : 'Guardar'}</button>
        </div>
      </div>
      <button type="button" className="header-back-btn" onClick={function() { setSelectedDevice(null); setEditingEl(null); setExpandedRow(null) }}>&#8592; Volver</button>

      <fieldset className="admin-fs">
        <legend>Controles de diseno</legend>
        <DesignControls layout={layout} onChange={function(patch) { updateDeviceLayout(dk, patch) }} />
      </fieldset>

      <fieldset className="admin-fs">
        <legend>Filas del encabezado ({rowsList.length})</legend>
        {rowsList.length === 0 && (
          <div style={{ marginBottom: 12 }}>
            <p className="header-editor-subtitle" style={{ margin: '0 0 8px' }}>No hay filas. Puedes crear una nueva o convertir los elementos existentes en filas.</p>
            <button type="button" className="admin-btn-secondary" onClick={function() { ensureRows(dk) }}>Convertir elementos actuales en filas</button>
          </div>
        )}
        <div className="header-rows-list">
          {rowsList.map(function(row, ri) {
            return (
              <RowCard
                key={row.id}
                row={row}
                ri={ri}
                totalRows={rowsList.length}
                dk={dk}
                editingEl={editingEl}
                setEditingEl={setEditingEl}
                expandedRow={expandedRow}
                setExpandedRow={setExpandedRow}
                allRows={rowsList}
                updateRow={updateRow}
                moveRow={moveRowFn}
                removeRow={removeRow}
                addElementToRow={addElementToRow}
                removeElementFromRow={removeElementFromRow}
                moveElementInRow={moveElementInRow}
                updateElementInRow={updateElementInRow}
                moveElementToRow={moveElementToRow}
              />
            )
          })}
        </div>
        <div className="header-row-add-row">
          <button type="button" className="admin-btn-secondary" onClick={function() { addRow(dk) }}>+ Agregar fila</button>
        </div>
      </fieldset>

      {rowsList.length > 0 && (
        <fieldset className="admin-fs">
          <legend>Agregar elemento existente a una fila</legend>
          <div className="header-add-el-form">
            <select className="header-add-el-select" value={addElRowId || ''} onChange={function(e) { setAddElRowId(e.target.value || null) }}>
              <option value="">Seleccionar fila destino...</option>
              {rowsList.map(function(r) { return <option key={r.id} value={r.id}>{r.name} ({(r.elements || []).length} elem.)</option> })}
            </select>
            {addElRowId && (
              <select className="header-add-el-select" value="" onChange={function(e) {
                if (!e.target.value) return
                var poolEl = globalPool.find(function(p) { return p.id === e.target.value })
                if (poolEl) addElementToRow(dk, addElRowId, poolEl)
              }}>
                <option value="">Seleccionar elemento...</option>
                {globalPool.map(function(el) {
                  var inRow = elementsInRows[el.id]
                  return <option key={el.id} value={el.id}>{el.name} ({el.type}){inRow ? ' [en: ' + inRow + ']' : ''}</option>
                })}
              </select>
            )}
          </div>
        </fieldset>
      )}

      {hasChanges && (
        <div className="header-preview-bar">
          <span>Vista previa activa - los cambios se reflejan en el encabezado arriba</span>
        </div>
      )}
    </div>
  )
}
