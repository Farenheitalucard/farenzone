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

function blankElement(order) {
  return { id: `el-${Date.now()}`, type: 'social', name: 'Nuevo', url: '', icon: '', visible: true, order }
}

export function HeaderEditor({ token }) {
  const headerConfig = useHeaderConfig()
  const [draft, setDraft] = useState(null)
  const [deviceTab, setDeviceTab] = useState('pc')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [previewing, setPreviewing] = useState(false)

  const cfg = draft || headerConfig
  const elements = (cfg.elements || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const device = cfg.devices?.[deviceTab] || { height: 0, maxWidth: 0, paddingX: 16, gap: 8, iconSize: 16, textSize: 13, overrides: {} }

  function updateCfg(patch) {
    setDraft((prev) => {
      const base = prev || JSON.parse(JSON.stringify(headerConfig))
      const next = { ...base, ...patch }
      setHeaderConfig(next)
      return next
    })
  }

  function updateElement(id, patch) {
    updateCfg({
      elements: elements.map((el) => (el.id === id ? { ...el, ...patch } : el)),
    })
  }

  function addElement() {
    const el = blankElement(elements.length)
    updateCfg({ elements: [...elements, el] })
  }

  function removeElement(id) {
    updateCfg({ elements: elements.filter((el) => el.id !== id) })
  }

  function moveElement(id, dir) {
    const idx = elements.findIndex((el) => el.id === id)
    if (idx < 0) return
    const arr = [...elements]
    const swap = idx + dir
    if (swap < 0 || swap >= arr.length) return
    const tmpOrder = arr[idx].order
    arr[idx] = { ...arr[idx], order: arr[swap].order }
    arr[swap] = { ...arr[swap], order: tmpOrder }
    updateCfg({ elements: arr })
  }

  function updateDevice(patch) {
    updateCfg({
      devices: {
        ...cfg.devices,
        [deviceTab]: { ...device, ...patch },
      },
    })
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
    setHeaderConfig(headerConfig)
    setMsg('')
  }

  const hasChanges = draft !== null

  return (
    <div className="header-editor">
      {msg && <p className="admin-msg">{msg}</p>}

      <div className="admin-form-head">
        <h2>Editor del encabezado</h2>
        <div>
          {hasChanges && (
            <button type="button" onClick={cancel} style={{ marginRight: 8 }}>Descartar</button>
          )}
          <button type="button" className="admin-btn-primary" onClick={save} disabled={saving || !hasChanges}>
            {saving ? '…' : 'Guardar'}
          </button>
        </div>
      </div>

      <fieldset className="admin-fs">
        <legend>Marca</legend>
        <div className="admin-grid">
          <label>
            Nombre
            <input value={cfg.brand?.name || ''} onChange={(e) => updateCfg({ brand: { ...cfg.brand, name: e.target.value } })} />
          </label>
          <label>
            Acento
            <input value={cfg.brand?.nameAccent || ''} onChange={(e) => updateCfg({ brand: { ...cfg.brand, nameAccent: e.target.value } })} />
          </label>
          <label>
            Enlace
            <input value={cfg.brand?.url || '/'} onChange={(e) => updateCfg({ brand: { ...cfg.brand, url: e.target.value } })} />
          </label>
        </div>
      </fieldset>

      <fieldset className="admin-fs">
        <legend>Elementos del encabezado</legend>
        <ul className="header-el-list">
          {elements.map((el) => (
            <li key={el.id} className="header-el-row">
              <div className="header-el-drag">
                <button type="button" onClick={() => moveElement(el.id, -1)} disabled={elements[0]?.id === el.id}>↑</button>
                <button type="button" onClick={() => moveElement(el.id, 1)} disabled={elements[elements.length - 1]?.id === el.id}>↓</button>
              </div>
              <div className="header-el-icon">
                {el.icon ? (el.icon.startsWith('/') ? <img src={el.icon} alt="" style={{ width: 20, height: 20 }} /> : getBuiltinIcon(el.icon)) : <span style={{ opacity: 0.3 }}>—</span>}
              </div>
              <div className="header-el-info">
                <input className="header-el-name" value={el.name} onChange={(e) => updateElement(el.id, { name: e.target.value })} placeholder="Nombre" />
                <span className="header-el-type">{ELEMENT_TYPES.find((t) => t.value === el.type)?.label || el.type}</span>
              </div>
              <label className="header-el-vis">
                <input type="checkbox" checked={el.visible !== false} onChange={(e) => updateElement(el.id, { visible: e.target.checked })} />
              </label>
              <button type="button" className="admin-btn-secondary" onClick={() => { setDraft(null); setTimeout(() => setDraft({ ...cfg, _editingEl: el.id }), 0) }}>Editar</button>
              <button type="button" className="admin-btn-danger" onClick={() => removeElement(el.id)}>×</button>
            </li>
          ))}
        </ul>
        <button type="button" className="admin-btn-secondary" onClick={addElement}>+ Agregar elemento</button>
      </fieldset>

      {cfg._editingEl && (
        <EditElementPanel
          element={elements.find((e) => e.id === cfg._editingEl)}
          onUpdate={(patch) => updateElement(cfg._editingEl, patch)}
          onClose={() => updateCfg({ _editingEl: null })}
        />
      )}

      <fieldset className="admin-fs">
        <legend>Configuración por dispositivo</legend>
        <div className="admin-tabs" style={{ marginBottom: 12 }}>
          {['pc', 'mobile', 'tablet'].map((d) => (
            <button key={d} type="button" className={`admin-tab${deviceTab === d ? ' admin-tab-active' : ''}`} onClick={() => setDeviceTab(d)}>
              {d === 'pc' ? '🖥️ PC' : d === 'mobile' ? '📱 Móvil' : '📲 Tablet'}
            </button>
          ))}
        </div>
        <div className="admin-grid">
          <label>
            Altura (px, 0 = auto)
            <input type="number" value={device.height} onChange={(e) => updateDevice({ height: Number(e.target.value) })} />
          </label>
          <label>
            Ancho máximo (px, 0 = 100%)
            <input type="number" value={device.maxWidth} onChange={(e) => updateDevice({ maxWidth: Number(e.target.value) })} />
          </label>
          <label>
            Padding horizontal (px)
            <input type="number" value={device.paddingX} onChange={(e) => updateDevice({ paddingX: Number(e.target.value) })} />
          </label>
          <label>
            Separación (gap px)
            <input type="number" value={device.gap} onChange={(e) => updateDevice({ gap: Number(e.target.value) })} />
          </label>
          <label>
            Tamaño iconos (px)
            <input type="number" value={device.iconSize} onChange={(e) => updateDevice({ iconSize: Number(e.target.value) })} />
          </label>
          <label>
            Tamaño texto (px)
            <input type="number" value={device.textSize} onChange={(e) => updateDevice({ textSize: Number(e.target.value) })} />
          </label>
        </div>
      </fieldset>

      {hasChanges && (
        <div className="header-preview-bar">
          <span>Vista previa activa — los cambios se reflejan en el encabezado arriba</span>
        </div>
      )}
    </div>
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
