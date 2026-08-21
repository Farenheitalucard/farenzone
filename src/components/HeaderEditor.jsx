import { useState } from 'react'
import { setHeaderConfig } from '../data/headerConfig'
import { useHeaderConfig } from '../hooks/useHeaderConfig'
import { getBuiltinIcon } from '../data/headerIcons'

const BUILTIN_ICON_OPTIONS = [
  { value: '', label: 'Sin icono' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'heart', label: 'Corazón' },
  { value: 'admin', label: 'Admin' },
  { value: 'sun', label: 'Sol' },
  { value: 'moon', label: 'Luna' },
]

const ELEMENT_TYPES = [
  { value: 'social', label: 'Red social / enlace' },
  { value: 'nav', label: 'Enlace de navegación' },
  { value: 'search', label: 'Buscador' },
  { value: 'consoles', label: 'Selector de consolas' },
  { value: 'menu', label: 'Menú ☰' },
  { value: 'admin', label: 'Panel de admin' },
  { value: 'theme', label: 'Cambio de tema' },
  { value: 'language', label: 'Cambio de idioma' },
  { value: 'custom', label: 'Personalizado' },
]

const DEVICE_ICONS = { pc: '🖥️', mobile: '📱', tablet: '📲', general: '⚙️' }
const DEVICE_LABELS = { pc: 'PC', mobile: 'Móvil', tablet: 'Tablet', general: 'Configuración general' }

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function blankElement(order) {
  return { id: `el-${Date.now()}`, type: 'social', name: 'Nuevo', url: '', icon: '', visible: true, order }
}

function getElementsForDevice(cfg, deviceKey) {
  if (!cfg) return []
  const d = cfg.devices?.[deviceKey]
  if (d && Array.isArray(d.elements) && d.elements.length > 0) return d.elements
  if (Array.isArray(cfg.elements) && cfg.elements.length > 0) return cfg.elements
  return []
}

function sortElements(arr) {
  return (arr || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export function HeaderEditor({ token }) {
  const headerConfig = useHeaderConfig()
  const [draft, setDraft] = useState(null)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [editingEl, setEditingEl] = useState(null)

  const cfg = draft || headerConfig

  function makeDraft() {
    if (draft) return draft
    const d = deepClone(headerConfig)
    setDraft(d)
    return d
  }

  function updateCfg(patch) {
    setDraft((prev) => {
      const base = prev || deepClone(headerConfig)
      const next = { ...base, ...patch }
      setHeaderConfig(next)
      return next
    })
  }

  function updateDeviceElements(deviceKey, newElements) {
    const base = makeDraft()
    const devices = { ...base.devices }
    devices[deviceKey] = { ...(devices[deviceKey] || {}), elements: newElements }
    updateCfg({ devices })
  }

  function updateDevice(deviceKey, patch) {
    const base = makeDraft()
    const devices = { ...base.devices }
    devices[deviceKey] = { ...(devices[deviceKey] || {}), ...patch }
    updateCfg({ devices })
  }

  function getDeviceElementsList(deviceKey) {
    const d = cfg.devices?.[deviceKey]
    if (d && Array.isArray(d.elements) && d.elements.length > 0) return d.elements
    if (Array.isArray(cfg.elements) && cfg.elements.length > 0) return cfg.elements
    return []
  }

  function updateElement(deviceKey, id, patch) {
    const els = getDeviceElementsList(deviceKey).map((el) => (el.id === id ? { ...el, ...patch } : el))
    updateDeviceElements(deviceKey, els)
  }

  function addElement(deviceKey) {
    const els = getDeviceElementsList(deviceKey)
    const el = blankElement(els.length)
    updateDeviceElements(deviceKey, [...els, el])
  }

  function removeElement(deviceKey, id) {
    const els = getDeviceElementsList(deviceKey).filter((el) => el.id !== id)
    updateDeviceElements(deviceKey, els)
  }

  function moveElement(deviceKey, id, dir) {
    const els = getDeviceElementsList(deviceKey)
    const sorted = sortElements(els)
    const idx = sorted.findIndex((el) => el.id === id)
    if (idx < 0) return
    const swap = idx + dir
    if (swap < 0 || swap >= sorted.length) return
    const tmpOrder = sorted[idx].order
    sorted[idx] = { ...sorted[idx], order: sorted[swap].order }
    sorted[swap] = { ...sorted[swap], order: tmpOrder }
    updateDeviceElements(deviceKey, sorted)
  }

  function updateBrand(patch) {
    updateCfg({ brand: { ...cfg.brand, ...patch } })
  }

  async function save() {
    if (!draft) return
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/header', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ config: draft }),
      })
      if (!res.ok) throw new Error('save failed')
      const data = await res.json()
      setHeaderConfig(data.config)
      setDraft(null)
      setMsg('Configuración guardada')
    } catch {
      setMsg('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  function cancel() {
    setDraft(null)
    setEditingEl(null)
    setMsg('')
  }

  const hasChanges = draft !== null

  if (!selectedDevice) {
    return (
      <div className="header-editor">
        {msg && <p className="admin-msg">{msg}</p>}
        <h2>Editor del encabezado</h2>
        <p className="header-editor-subtitle">Selecciona qué versión deseas editar</p>
        <div className="header-device-selector">
          {['pc', 'mobile', 'tablet', 'general'].map((d) => (
            <button key={d} type="button" className="header-device-card" onClick={() => setSelectedDevice(d)}>
              <span className="header-device-card-icon">{DEVICE_ICONS[d]}</span>
              <span className="header-device-card-label">{DEVICE_LABELS[d]}</span>
              <span className="header-device-card-desc">
                {d === 'pc' && 'Orden, visibilidad y diseño de la versión de escritorio'}
                {d === 'mobile' && 'Orden, visibilidad y diseño de la versión móvil'}
                {d === 'tablet' && 'Orden, visibilidad y diseño de la versión tablet'}
                {d === 'general' && 'Marca, nombre e información compartida entre dispositivos'}
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
          <h2>⚙️ Configuración general</h2>
          <div>
            {hasChanges && (
              <button type="button" onClick={cancel} style={{ marginRight: 8 }}>Descartar</button>
            )}
            <button type="button" className="admin-btn-primary" onClick={save} disabled={saving || !hasChanges}>
              {saving ? '…' : 'Guardar'}
            </button>
          </div>
        </div>

        <button type="button" className="header-back-btn" onClick={() => { setSelectedDevice(null); setEditingEl(null) }}>← Volver</button>

        <fieldset className="admin-fs">
          <legend>Marca</legend>
          <div className="admin-grid">
            <label>
              Nombre
              <input value={cfg.brand?.name || ''} onChange={(e) => updateBrand({ name: e.target.value })} />
            </label>
            <label>
              Acento
              <input value={cfg.brand?.nameAccent || ''} onChange={(e) => updateBrand({ nameAccent: e.target.value })} />
            </label>
            <label>
              Enlace
              <input value={cfg.brand?.url || '/'} onChange={(e) => updateBrand({ url: e.target.value })} />
            </label>
          </div>
        </fieldset>

        <fieldset className="admin-fs">
          <legend>Dimensiones por dispositivo</legend>
          <DeviceSizingTabs cfg={cfg} updateDevice={updateDevice} />
        </fieldset>

        {hasChanges && (
          <div className="header-preview-bar">
            <span>Vista previa activa — los cambios se reflejan en el encabezado arriba</span>
          </div>
        )}
      </div>
    )
  }

  const deviceKey = selectedDevice
  const deviceElements = sortElements(getDeviceElementsList(deviceKey))

  return (
    <div className="header-editor">
      {msg && <p className="admin-msg">{msg}</p>}

      <div className="admin-form-head">
        <h2>{DEVICE_ICONS[deviceKey]} Editar versión {DEVICE_LABELS[deviceKey]}</h2>
        <div>
          {hasChanges && (
            <button type="button" onClick={cancel} style={{ marginRight: 8 }}>Descartar</button>
          )}
          <button type="button" className="admin-btn-primary" onClick={save} disabled={saving || !hasChanges}>
            {saving ? '…' : 'Guardar'}
          </button>
        </div>
      </div>

      <button type="button" className="header-back-btn" onClick={() => { setSelectedDevice(null); setEditingEl(null) }}>← Volver</button>

      <fieldset className="admin-fs">
        <legend>Elementos del encabezado ({deviceElements.length})</legend>
        <ul className="header-el-list">
          {deviceElements.map((el) => (
            <li key={el.id} className="header-el-row">
              <div className="header-el-drag">
                <button type="button" onClick={() => moveElement(deviceKey, el.id, -1)} disabled={deviceElements[0]?.id === el.id}>↑</button>
                <button type="button" onClick={() => moveElement(deviceKey, el.id, 1)} disabled={deviceElements[deviceElements.length - 1]?.id === el.id}>↓</button>
              </div>
              <div className="header-el-icon">
                {el.icon ? (el.icon.startsWith('/') ? <img src={el.icon} alt="" style={{ width: 20, height: 20 }} /> : getBuiltinIcon(el.icon)) : <span style={{ opacity: 0.3 }}>—</span>}
              </div>
              <div className="header-el-info">
                <input className="header-el-name" value={el.name} onChange={(e) => updateElement(deviceKey, el.id, { name: e.target.value })} placeholder="Nombre" />
                <span className="header-el-type">{ELEMENT_TYPES.find((t) => t.value === el.type)?.label || el.type}</span>
              </div>
              <label className="header-el-vis">
                <input type="checkbox" checked={el.visible !== false} onChange={(e) => updateElement(deviceKey, el.id, { visible: e.target.checked })} />
              </label>
              <button type="button" className="admin-btn-secondary" onClick={() => setEditingEl(editingEl === el.id ? null : el.id)}>
                {editingEl === el.id ? 'Cerrar' : 'Editar'}
              </button>
              <button type="button" className="admin-btn-danger" onClick={() => removeElement(deviceKey, el.id)}>×</button>
            </li>
          ))}
        </ul>
        <button type="button" className="admin-btn-secondary" onClick={() => addElement(deviceKey)}>+ Agregar elemento</button>
      </fieldset>

      {editingEl && (
        <EditElementPanel
          element={deviceElements.find((e) => e.id === editingEl)}
          onUpdate={(patch) => updateElement(deviceKey, editingEl, patch)}
          onClose={() => setEditingEl(null)}
        />
      )}

      {hasChanges && (
        <div className="header-preview-bar">
          <span>Vista previa activa — los cambios se reflejan en el encabezado arriba</span>
        </div>
      )}
    </div>
  )
}

function DeviceSizingTabs({ cfg, updateDevice }) {
  const [tab, setTab] = useState('pc')
  const device = cfg.devices?.[tab] || { height: 0, maxWidth: 0, paddingX: 16, gap: 8, iconSize: 16, textSize: 13 }

  function update(patch) {
    updateDevice(tab, patch)
  }

  return (
    <>
      <div className="admin-tabs" style={{ marginBottom: 12 }}>
        {['pc', 'mobile', 'tablet'].map((d) => (
          <button key={d} type="button" className={`admin-tab${tab === d ? ' admin-tab-active' : ''}`} onClick={() => setTab(d)}>
            {DEVICE_ICONS[d]} {DEVICE_LABELS[d]}
          </button>
        ))}
      </div>
      <div className="admin-grid">
        <label>
          Altura (px, 0 = auto)
          <input type="number" value={device.height} onChange={(e) => update({ height: Number(e.target.value) })} />
        </label>
        <label>
          Ancho máximo (px, 0 = 100%)
          <input type="number" value={device.maxWidth} onChange={(e) => update({ maxWidth: Number(e.target.value) })} />
        </label>
        <label>
          Padding horizontal (px)
          <input type="number" value={device.paddingX} onChange={(e) => update({ paddingX: Number(e.target.value) })} />
        </label>
        <label>
          Separación (gap px)
          <input type="number" value={device.gap} onChange={(e) => update({ gap: Number(e.target.value) })} />
        </label>
        <label>
          Tamaño iconos (px)
          <input type="number" value={device.iconSize} onChange={(e) => update({ iconSize: Number(e.target.value) })} />
        </label>
        <label>
          Tamaño texto (px)
          <input type="number" value={device.textSize} onChange={(e) => update({ textSize: Number(e.target.value) })} />
        </label>
      </div>
    </>
  )
}

function EditElementPanel({ element, onUpdate, onClose }) {
  if (!element) return null
  return (
    <fieldset className="admin-fs">
      <legend>Editar: {element.name}</legend>
      <div className="admin-grid">
        <label>
          Nombre
          <input value={element.name} onChange={(e) => onUpdate({ name: e.target.value })} />
        </label>
        <label>
          Tipo
          <select value={element.type} onChange={(e) => onUpdate({ type: e.target.value })}>
            {ELEMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <label className="admin-span2">
          URL
          <input value={element.url || ''} onChange={(e) => onUpdate({ url: e.target.value })} placeholder="https://..." />
        </label>
        <label>
          Icono (nombre o URL)
          <input value={element.icon || ''} onChange={(e) => onUpdate({ icon: e.target.value })} placeholder="telegram o /logos/..." />
        </label>
        <label>
          ID
          <input value={element.id} onChange={(e) => onUpdate({ id: e.target.value })} />
        </label>
        {element.type === 'consoles' && (
          <label className="admin-span2">
            Consolas principales (IDs separados por coma)
            <input
              value={(element.mainIds || []).join(', ')}
              onChange={(e) => onUpdate({ mainIds: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
              placeholder="switch, ps4, ps3, xbox360"
            />
          </label>
        )}
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="button" className="admin-btn-secondary" onClick={onClose}>Cerrar edición</button>
      </div>
    </fieldset>
  )
}
