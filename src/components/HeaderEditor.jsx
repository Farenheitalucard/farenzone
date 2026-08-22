import { useState } from 'react'
import { setHeaderConfig } from '../data/headerConfig'
import { useHeaderConfig } from '../hooks/useHeaderConfig'
import {
  ELEMENT_TYPES, ELEMENT_PRESETS, DEVICE_ICONS, DEVICE_LABELS,
  deepClone, sortEls, blankElement, defaultLayout, uid,
} from './headerEditorUtils'
import { DesignControls, EditElementPanel, ElementCard } from './headerEditorParts'

export function HeaderEditor({ token }) {
  var headerConfig = useHeaderConfig()
  var [draft, setDraft] = useState(null)
  var [selectedDevice, setSelectedDevice] = useState(null)
  var [saving, setSaving] = useState(false)
  var [msg, setMsg] = useState('')
  var [editingEl, setEditingEl] = useState(null)

  var cfg = draft || headerConfig

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

  function getDeviceElements(dk) {
    var d = cfg.devices && cfg.devices[dk]
    if (Array.isArray(d && d.elements) && d.elements.length > 0) return d.elements
    return []
  }

  function setDeviceElements(dk, els) {
    var base = makeDraft()
    var devices = Object.assign({}, base.devices)
    devices[dk] = Object.assign({}, devices[dk] || defaultLayout(dk), { elements: els })
    updateCfg({ devices: devices })
  }

  function addPreset(dk, preset) {
    var els = getDeviceElements(dk)
    setDeviceElements(dk, els.concat([{
      id: uid('el'), type: preset.type, name: preset.label,
      url: preset.url || '', icon: preset.icon || '',
      mainIds: preset.mainIds || [], order: els.length, visible: true,
    }]))
  }

  function addCustom(dk, type) {
    var els = getDeviceElements(dk)
    setDeviceElements(dk, els.concat([{
      id: uid('el'), type: type || 'custom', name: 'Nuevo',
      url: '', icon: '', order: els.length, visible: true,
    }]))
  }

  function removeElement(dk, elId) {
    setDeviceElements(dk, getDeviceElements(dk)
      .filter(function(e) { return e.id !== elId })
      .map(function(e, i) { return Object.assign({}, e, { order: i }) }))
    if (editingEl === elId) setEditingEl(null)
  }

  function toggleElement(dk, elId, visible) {
    setDeviceElements(dk, getDeviceElements(dk).map(function(e) {
      return e.id === elId ? Object.assign({}, e, { visible: visible }) : e
    }))
  }

  function updateElement(dk, elId, patch) {
    setDeviceElements(dk, getDeviceElements(dk).map(function(e) {
      return e.id === elId ? Object.assign({}, e, patch) : e
    }))
  }

  function moveElement(dk, elId, dir) {
    var els = sortEls(getDeviceElements(dk))
    var idx = els.findIndex(function(e) { return e.id === elId })
    if (idx < 0) return
    var swap = idx + dir
    if (swap < 0 || swap >= els.length) return
    var tmp = els[idx].order
    els[idx] = Object.assign({}, els[idx], { order: els[swap].order })
    els[swap] = Object.assign({}, els[swap], { order: tmp })
    setDeviceElements(dk, els)
  }

  async function save() {
    if (!draft) return
    setSaving(true); setMsg('')
    try {
      var res = await fetch('/api/admin/header', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ config: draft }),
      })
      if (!res.ok) throw new Error()
      var data = await res.json()
      setHeaderConfig(data.config)
      setDraft(null); setEditingEl(null); setMsg('Configuracion guardada')
    } catch(e) { setMsg('Error al guardar') }
    finally { setSaving(false) }
  }

  function cancel() {
    setDraft(null); setEditingEl(null); setMsg('')
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
                  {d === 'pc' && 'Elementos, diseno y disposicion de escritorio'}
                  {d === 'mobile' && 'Elementos, diseno y disposicion movil'}
                  {d === 'tablet' && 'Elementos, diseno y disposicion tablet'}
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
        <button type="button" className="header-back-btn" onClick={function() { setSelectedDevice(null); setEditingEl(null) }}>&#8592; Volver</button>
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
  var elements = sortEls(getDeviceElements(dk))

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
      <button type="button" className="header-back-btn" onClick={function() { setSelectedDevice(null); setEditingEl(null) }}>&#8592; Volver</button>

      <fieldset className="admin-fs">
        <legend>Controles de diseno</legend>
        <DesignControls layout={layout} onChange={function(patch) { updateDeviceLayout(dk, patch) }} />
      </fieldset>

      <fieldset className="admin-fs">
        <legend>Elementos del encabezado ({elements.length})</legend>
        {elements.length === 0 && (
          <p className="header-editor-subtitle" style={{ margin: '0 0 12px' }}>No hay elementos. Agrega uno con los botones de abajo.</p>
        )}
        <ul className="header-el-list">
          {elements.map(function(el, i) {
            return (
              <ElementCard
                key={el.id}
                el={el}
                index={i}
                total={elements.length}
                onMoveUp={function() { moveElement(dk, el.id, -1) }}
                onMoveDown={function() { moveElement(dk, el.id, 1) }}
                onToggle={function(v) { toggleElement(dk, el.id, v) }}
                onDelete={function() { removeElement(dk, el.id) }}
                editingEl={editingEl}
                setEditingEl={setEditingEl}
                onUpdate={function(patch) { updateElement(dk, el.id, patch) }}
              />
            )
          })}
        </ul>
        {editingEl && elements.find(function(e) { return e.id === editingEl }) && (
          <EditElementPanel
            element={elements.find(function(e) { return e.id === editingEl })}
            onUpdate={function(patch) { updateElement(dk, editingEl, patch) }}
            onClose={function() { setEditingEl(null) }}
          />
        )}
      </fieldset>

      <fieldset className="admin-fs">
        <legend>Agregar elemento</legend>
        <div style={{ marginBottom: 8 }}>
          <p className="header-editor-subtitle" style={{ margin: '0 0 8px' }}>Predefinidos:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {ELEMENT_PRESETS.map(function(preset, pi) {
              return (
                <button key={pi} type="button" className="admin-btn-secondary" onClick={function() { addPreset(dk, preset) }}>
                  + {preset.label}
                </button>
              )
            })}
          </div>
          <p className="header-editor-subtitle" style={{ margin: '0 0 8px' }}>Personalizado:</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ELEMENT_TYPES.map(function(t) {
              return (
                <button key={t.value} type="button" className="admin-btn-secondary" onClick={function() { addCustom(dk, t.value) }}>
                  + {t.label}
                </button>
              )
            })}
          </div>
        </div>
      </fieldset>

      {hasChanges && (
        <div className="header-preview-bar">
          <span>Vista previa activa - los cambios se reflejan en el encabezado arriba</span>
        </div>
      )}
    </div>
  )
}
