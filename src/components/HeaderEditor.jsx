import { useState } from 'react'
import { setHeaderConfig } from '../data/headerConfig'
import { useHeaderConfig } from '../hooks/useHeaderConfig'
import { getBuiltinIcon } from '../data/headerIcons'

const ELEMENT_TYPES = [
  { value: 'social', label: 'Red social / enlace' },
  { value: 'nav', label: 'Enlace de navegacion' },
  { value: 'search', label: 'Buscador' },
  { value: 'consoles', label: 'Selector de consolas' },
  { value: 'menu', label: 'Menu' },
  { value: 'admin', label: 'Panel de admin' },
  { value: 'theme', label: 'Cambio de tema' },
  { value: 'language', label: 'Cambio de idioma' },
  { value: 'custom', label: 'Personalizado' },
]

const DEVICE_ICONS = { pc: '\u{1F5A5}\uFE0F', mobile: '\u{1F4F1}', tablet: '\u{1F4F2}', general: '\u2699\uFE0F' }
const DEVICE_LABELS = { pc: 'PC', mobile: 'Movil', tablet: 'Tablet', general: 'Configuracion general' }

const JUSTIFY_OPTIONS = [
  { value: 'flex-start', label: 'Izquierda' },
  { value: 'center', label: 'Centro' },
  { value: 'flex-end', label: 'Derecha' },
  { value: 'space-between', label: 'Espacio entre' },
  { value: 'space-around', label: 'Espacio alrededor' },
  { value: 'space-evenly', label: 'Espacio uniforme' },
]

const ALIGN_OPTIONS = [
  { value: 'flex-start', label: 'Arriba' },
  { value: 'center', label: 'Centro' },
  { value: 'flex-end', label: 'Abajo' },
  { value: 'stretch', label: 'Estirar' },
]

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)) }
function sortEls(arr) { return (arr || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) }
function sortRows(arr) { return (arr || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) }

function blankElement(order) {
  return { id: 'el-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), type: 'social', name: 'Nuevo', url: '', icon: '', visible: true, order }
}

function blankRow(order) {
  return { id: 'row-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), name: 'Fila ' + (order + 1), order, height: 0, gap: 8, paddingX: 0, paddingY: 0, justify: 'flex-start', align: 'center', elements: [] }
}

function defaultLayout(deviceKey) {
  var defaults = { pc: { height: 64, maxWidth: 1180, paddingX: 20, gap: 10 }, mobile: { height: 0, maxWidth: 0, paddingX: 16, gap: 6 }, tablet: { height: 0, maxWidth: 0, paddingX: 16, gap: 8 } }
  return { height: 0, maxWidth: 0, paddingX: 0, paddingY: 0, gap: 8, justify: 'flex-start', align: 'center', iconSize: 18, textSize: 14, ...defaults[deviceKey] }
}

function LayoutControls({ layout, onChange }) {
  return (
    <div className="admin-grid">
      <label>Ancho maximo (px, 0=100%)
        <input type="number" value={layout.maxWidth || 0} onChange={(e) => onChange({ maxWidth: Number(e.target.value) })} />
      </label>
      <label>Altura (px, 0=auto)
        <input type="number" value={layout.height || 0} onChange={(e) => onChange({ height: Number(e.target.value) })} />
      </label>
      <label>Padding horizontal (px)
        <input type="number" value={layout.paddingX || 0} onChange={(e) => onChange({ paddingX: Number(e.target.value) })} />
      </label>
      <label>Padding vertical (px)
        <input type="number" value={layout.paddingY || 0} onChange={(e) => onChange({ paddingY: Number(e.target.value) })} />
      </label>
      <label>Espaciado entre elementos (gap px)
        <input type="number" value={layout.gap || 0} onChange={(e) => onChange({ gap: Number(e.target.value) })} />
      </label>
      <label>Tamano de iconos (px)
        <input type="number" value={layout.iconSize || 18} onChange={(e) => onChange({ iconSize: Number(e.target.value) })} />
      </label>
      <label>Tamano de textos (px)
        <input type="number" value={layout.textSize || 14} onChange={(e) => onChange({ textSize: Number(e.target.value) })} />
      </label>
      <label>Posicion horizontal
        <select value={layout.justify || 'flex-start'} onChange={(e) => onChange({ justify: e.target.value })}>
          {JUSTIFY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      <label>Posicion vertical
        <select value={layout.align || 'center'} onChange={(e) => onChange({ align: e.target.value })}>
          {ALIGN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
    </div>
  )
}

function EditElementPanel({ element, onUpdate, onClose }) {
  if (!element) return null
  return (
    <fieldset className="admin-fs">
      <legend>Editar: {element.name}</legend>
      <div className="admin-grid">
        <label>Nombre
          <input value={element.name} onChange={(e) => onUpdate({ name: e.target.value })} />
        </label>
        <label>Tipo
          <select value={element.type} onChange={(e) => onUpdate({ type: e.target.value })}>
            {ELEMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <label className="admin-span2">URL
          <input value={element.url || ''} onChange={(e) => onUpdate({ url: e.target.value })} placeholder="https://..." />
        </label>
        <label>Icono (nombre o URL)
          <input value={element.icon || ''} onChange={(e) => onUpdate({ icon: e.target.value })} placeholder="telegram o /logos/..." />
        </label>
        <label>ID
          <input value={element.id} onChange={(e) => onUpdate({ id: e.target.value })} />
        </label>
        {element.type === 'consoles' && (
          <label className="admin-span2">Consolas principales (IDs separados por coma)
            <input
              value={(element.mainIds || []).join(', ')}
              onChange={(e) => onUpdate({ mainIds: e.target.value.split(',').map(function(s) { return s.trim() }).filter(Boolean) })}
              placeholder="switch, ps4, ps3, xbox360"
            />
          </label>
        )}
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="button" className="admin-btn-secondary" onClick={onClose}>Cerrar edicion</button>
      </div>
    </fieldset>
  )
}

function RowCard({ row, ri, totalRows, dk, cfg, editingEl, setEditingEl, expandedRow, setExpandedRow, updateRow, moveRow, removeRow, addElementToRow, removeElementFromRow, moveElementInRow, updateElementInRow }) {
  const rowEls = sortEls(row.elements || [])
  const isExpanded = expandedRow === row.id
  return (
    <div className="header-row-card">
      <div className="header-row-header">
        <div className="header-row-drag">
          <button type="button" onClick={() => moveRow(dk, row.id, -1)} disabled={ri === 0}>\u2191</button>
          <button type="button" onClick={() => moveRow(dk, row.id, 1)} disabled={ri === totalRows - 1}>\u2193</button>
        </div>
        <input className="header-row-name" value={row.name} onChange={(e) => updateRow(dk, row.id, { name: e.target.value })} placeholder="Nombre de fila" />
        <span className="header-row-count">{rowEls.length} elem.</span>
        <button type="button" className="admin-btn-secondary" onClick={() => setExpandedRow(isExpanded ? null : row.id)}>
          {isExpanded ? '\u25BC' : '\u25B6'}
        </button>
        <button type="button" className="admin-btn-danger" onClick={() => removeRow(dk, row.id)}>X</button>
      </div>
      {isExpanded && (
        <div className="header-row-body">
          <div className="admin-grid" style={{ marginBottom: 12 }}>
            <label>Altura (px, 0=auto)
              <input type="number" value={row.height || 0} onChange={(e) => updateRow(dk, row.id, { height: Number(e.target.value) })} />
            </label>
            <label>Espaciado (gap px)
              <input type="number" value={row.gap ?? 8} onChange={(e) => updateRow(dk, row.id, { gap: Number(e.target.value) })} />
            </label>
            <label>Padding horizontal
              <input type="number" value={row.paddingX || 0} onChange={(e) => updateRow(dk, row.id, { paddingX: Number(e.target.value) })} />
            </label>
            <label>Padding vertical
              <input type="number" value={row.paddingY || 0} onChange={(e) => updateRow(dk, row.id, { paddingY: Number(e.target.value) })} />
            </label>
            <label>Posicion horizontal
              <select value={row.justify || 'flex-start'} onChange={(e) => updateRow(dk, row.id, { justify: e.target.value })}>
                {JUSTIFY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label>Posicion vertical
              <select value={row.align || 'center'} onChange={(e) => updateRow(dk, row.id, { align: e.target.value })}>
                {ALIGN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          </div>

          <ul className="header-el-list">
            {rowEls.map((el) => (
              <li key={el.id} className="header-el-row">
                <div className="header-el-drag">
                  <button type="button" onClick={() => moveElementInRow(dk, row.id, el.id, -1)} disabled={rowEls[0]?.id === el.id}>\u2191</button>
                  <button type="button" onClick={() => moveElementInRow(dk, row.id, el.id, 1)} disabled={rowEls[rowEls.length - 1]?.id === el.id}>\u2193</button>
                </div>
                <div className="header-el-icon">
                  {el.icon ? (el.icon.startsWith('/') ? <img src={el.icon} alt="" style={{ width: 20, height: 20 }} /> : getBuiltinIcon(el.icon)) : <span style={{ opacity: 0.3 }}>--</span>}
                </div>
                <div className="header-el-info">
                  <input className="header-el-name" value={el.name} onChange={(e) => updateElementInRow(dk, row.id, el.id, { name: e.target.value })} placeholder="Nombre" />
                  <span className="header-el-type">{ELEMENT_TYPES.find((t) => t.value === el.type)?.label || el.type}</span>
                </div>
                <label className="header-el-vis" title="Visible">
                  <input type="checkbox" checked={el.visible !== false} onChange={(e) => updateElementInRow(dk, row.id, el.id, { visible: e.target.checked })} />
                </label>
                <button type="button" className="admin-btn-secondary" onClick={() => setEditingEl(editingEl === el.id ? null : el.id)}>
                  {editingEl === el.id ? 'Cerrar' : 'Editar'}
                </button>
                <button type="button" className="admin-btn-danger" onClick={() => removeElementFromRow(dk, row.id, el.id)}>x</button>
              </li>
            ))}
          </ul>
          <button type="button" className="admin-btn-secondary" onClick={() => addElementToRow(dk, row.id)}>+ Agregar elemento a esta fila</button>

          {editingEl && rowEls.find((e) => e.id === editingEl) && (
            <EditElementPanel
              element={rowEls.find((e) => e.id === editingEl)}
              onUpdate={(patch) => updateElementInRow(dk, row.id, editingEl, patch)}
              onClose={() => setEditingEl(null)}
            />
          )}
        </div>
      )}
    </div>
  )
}

export function HeaderEditor({ token }) {
  const headerConfig = useHeaderConfig()
  const [draft, setDraft] = useState(null)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [editingEl, setEditingEl] = useState(null)
  const [expandedRow, setExpandedRow] = useState(null)

  const cfg = draft || headerConfig

  function makeDraft() {
    if (draft) return draft
    var d = deepClone(headerConfig)
    setDraft(d)
    return d
  }

  function updateCfg(patch) {
    setDraft((prev) => {
      var base = prev || deepClone(headerConfig)
      var next = { ...base, ...patch }
      setHeaderConfig(next)
      return next
    })
  }

  function updateBrand(patch) { updateCfg({ brand: { ...cfg.brand, ...patch } }) }

  function updateDeviceLayout(deviceKey, patch) {
    var base = makeDraft()
    var devices = { ...base.devices }
    devices[deviceKey] = { ...(devices[deviceKey] || defaultLayout(deviceKey)), ...patch }
    updateCfg({ devices })
  }

  function getRows(deviceKey) {
    var d = cfg.devices?.[deviceKey]
    return Array.isArray(d?.rows) ? d.rows : []
  }

  function updateRows(deviceKey, newRows) {
    var base = makeDraft()
    var devices = { ...base.devices }
    devices[deviceKey] = { ...(devices[deviceKey] || defaultLayout(deviceKey)), rows: newRows }
    updateCfg({ devices })
  }

  function addRow(deviceKey) {
    var rows = getRows(deviceKey)
    updateRows(deviceKey, [...rows, blankRow(rows.length)])
  }

  function removeRowFn(deviceKey, rowId) {
    updateRows(deviceKey, getRows(deviceKey).filter((r) => r.id !== rowId).map((r, i) => ({ ...r, order: i })))
    if (expandedRow === rowId) setExpandedRow(null)
  }

  function moveRowFn(deviceKey, rowId, dir) {
    var sorted = sortRows(getRows(deviceKey))
    var idx = sorted.findIndex((r) => r.id === rowId)
    if (idx < 0) return
    var swap = idx + dir
    if (swap < 0 || swap >= sorted.length) return
    var tmp = sorted[idx].order
    sorted[idx] = { ...sorted[idx], order: sorted[swap].order }
    sorted[swap] = { ...sorted[swap], order: tmp }
    updateRows(deviceKey, sorted)
  }

  function updateRowFn(deviceKey, rowId, patch) {
    var rows = getRows(deviceKey).map((r) => (r.id === rowId ? { ...r, ...patch } : r))
    updateRows(deviceKey, rows)
  }

  function addElementToRowFn(deviceKey, rowId) {
    var row = getRows(deviceKey).find((r) => r.id === rowId)
    if (!row) return
    var els = row.elements || []
    updateRowFn(deviceKey, rowId, { elements: [...els, blankElement(els.length)] })
  }

  function removeElementFromRowFn(deviceKey, rowId, elId) {
    var row = getRows(deviceKey).find((r) => r.id === rowId)
    if (!row) return
    var els = (row.elements || []).filter((e) => e.id !== elId).map((e, i) => ({ ...e, order: i }))
    updateRowFn(deviceKey, rowId, { elements: els })
  }

  function moveElementInRowFn(deviceKey, rowId, elId, dir) {
    var row = getRows(deviceKey).find((r) => r.id === rowId)
    if (!row) return
    var els = sortEls(row.elements)
    var idx = els.findIndex((e) => e.id === elId)
    if (idx < 0) return
    var swap = idx + dir
    if (swap < 0 || swap >= els.length) return
    var tmp = els[idx].order
    els[idx] = { ...els[idx], order: els[swap].order }
    els[swap] = { ...els[swap], order: tmp }
    updateRowFn(deviceKey, rowId, { elements: els })
  }

  function updateElementInRowFn(deviceKey, rowId, elId, patch) {
    var row = getRows(deviceKey).find((r) => r.id === rowId)
    if (!row) return
    var els = (row.elements || []).map((e) => (e.id === elId ? { ...e, ...patch } : e))
    updateRowFn(deviceKey, rowId, { elements: els })
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
      setMsg('Configuracion guardada')
    } catch {
      setMsg('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  function cancel() { setDraft(null); setEditingEl(null); setExpandedRow(null); setMsg('') }

  var hasChanges = draft !== null

  if (!selectedDevice) {
    return (
      <div className="header-editor">
        {msg && <p className="admin-msg">{msg}</p>}
        <h2>Editor del encabezado</h2>
        <p className="header-editor-subtitle">Selecciona que version deseas editar</p>
        <div className="header-device-selector">
          {['pc', 'mobile', 'tablet', 'general'].map((d) => (
            <button key={d} type="button" className="header-device-card" onClick={() => setSelectedDevice(d)}>
              <span className="header-device-card-icon">{DEVICE_ICONS[d]}</span>
              <span className="header-editor-card-label">{DEVICE_LABELS[d]}</span>
              <span className="header-device-card-desc">
                {d === 'pc' && 'Filas, elementos, diseno y disposicion de escritorio'}
                {d === 'mobile' && 'Filas, elementos, diseno y disposicion movil'}
                {d === 'tablet' && 'Filas, elementos, diseno y disposicion tablet'}
                {d === 'general' && 'Marca, nombre e informacion compartida entre dispositivos'}
              </span>
            </button>
          ))}
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
        <button type="button" className="header-back-btn" onClick={() => { setSelectedDevice(null); setEditingEl(null); setExpandedRow(null) }}>&#8592; Volver</button>
        <fieldset className="admin-fs">
          <legend>Marca</legend>
          <div className="admin-grid">
            <label>Nombre<input value={cfg.brand?.name || ''} onChange={(e) => updateBrand({ name: e.target.value })} /></label>
            <label>Acento<input value={cfg.brand?.nameAccent || ''} onChange={(e) => updateBrand({ nameAccent: e.target.value })} /></label>
            <label>Enlace<input value={cfg.brand?.url || '/'} onChange={(e) => updateBrand({ url: e.target.value })} /></label>
          </div>
        </fieldset>
      </div>
    )
  }

  var dk = selectedDevice
  var layout = cfg.devices?.[dk] || defaultLayout(dk)
  var rowsList = sortRows(getRows(dk))

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
      <button type="button" className="header-back-btn" onClick={() => { setSelectedDevice(null); setEditingEl(null); setExpandedRow(null) }}>&#8592; Volver</button>

      <fieldset className="admin-fs">
        <legend>Controles de diseno</legend>
        <LayoutControls layout={layout} onChange={(patch) => updateDeviceLayout(dk, patch)} />
      </fieldset>

      <fieldset className="admin-fs">
        <legend>Filas del encabezado ({rowsList.length})</legend>
        {rowsList.length === 0 && <p className="header-editor-subtitle" style={{ margin: '0 0 12px' }}>No hay filas. Crea una para organizar los elementos del encabezado en filas separadas.</p>}
        <div className="header-rows-list">
          {rowsList.map((row, ri) => (
            <RowCard
              key={row.id}
              row={row}
              ri={ri}
              totalRows={rowsList.length}
              dk={dk}
              cfg={cfg}
              editingEl={editingEl}
              setEditingEl={setEditingEl}
              expandedRow={expandedRow}
              setExpandedRow={setExpandedRow}
              updateRow={updateRowFn}
              moveRow={moveRowFn}
              removeRow={removeRowFn}
              addElementToRow={addElementToRowFn}
              removeElementFromRow={removeElementFromRowFn}
              moveElementInRow={moveElementInRowFn}
              updateElementInRow={updateElementInRowFn}
            />
          ))}
        </div>
        <button type="button" className="admin-btn-secondary" onClick={() => addRow(dk)} style={{ marginTop: 8 }}>+ Agregar fila</button>
      </fieldset>

      {hasChanges && (
        <div className="header-preview-bar">
          <span>Vista previa activa - los cambios se reflejan en el encabezado arriba</span>
        </div>
      )}
    </div>
  )
}
