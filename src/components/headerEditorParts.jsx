import { getBuiltinIcon } from '../data/headerIcons'
import { ELEMENT_TYPES, JUSTIFY_OPTIONS, ALIGN_OPTIONS } from './headerEditorUtils'

export function DesignControls({ layout, onChange }) {
  return (
    <div className="admin-grid">
      <label>Ancho maximo (px, 0=100%)
        <input type="number" value={layout.maxWidth || 0} onChange={e => onChange({ maxWidth: +e.target.value })} />
      </label>
      <label>Altura (px, 0=auto)
        <input type="number" value={layout.height || 0} onChange={e => onChange({ height: +e.target.value })} />
      </label>
      <label>Padding horizontal (px)
        <input type="number" value={layout.paddingX || 0} onChange={e => onChange({ paddingX: +e.target.value })} />
      </label>
      <label>Padding vertical (px)
        <input type="number" value={layout.paddingY || 0} onChange={e => onChange({ paddingY: +e.target.value })} />
      </label>
      <label>Espaciado entre elementos (gap px)
        <input type="number" value={layout.gap || 0} onChange={e => onChange({ gap: +e.target.value })} />
      </label>
      <label>Tamano de iconos (px)
        <input type="number" value={layout.iconSize || 18} onChange={e => onChange({ iconSize: +e.target.value })} />
      </label>
      <label>Tamano de textos (px)
        <input type="number" value={layout.textSize || 14} onChange={e => onChange({ textSize: +e.target.value })} />
      </label>
      <label>Posicion horizontal
        <select value={layout.justify || 'flex-start'} onChange={e => onChange({ justify: e.target.value })}>
          {JUSTIFY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      <label>Posicion vertical
        <select value={layout.align || 'center'} onChange={e => onChange({ align: e.target.value })}>
          {ALIGN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
    </div>
  )
}

export function EditElementPanel({ element, onUpdate, onClose }) {
  if (!element) return null
  return (
    <fieldset className="admin-fs">
      <legend>Editar: {element.name}</legend>
      <div className="admin-grid">
        <label>Nombre
          <input value={element.name} onChange={e => onUpdate({ name: e.target.value })} />
        </label>
        <label>Tipo
          <select value={element.type} onChange={e => onUpdate({ type: e.target.value })}>
            {ELEMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <label className="admin-span2">URL
          <input value={element.url || ''} onChange={e => onUpdate({ url: e.target.value })} placeholder="https://..." />
        </label>
        <label>Icono (nombre o URL)
          <input value={element.icon || ''} onChange={e => onUpdate({ icon: e.target.value })} placeholder="telegram o /logos/..." />
        </label>
        <label>ID
          <input value={element.id} onChange={e => onUpdate({ id: e.target.value })} />
        </label>
        {element.type === 'consoles' && (
          <label className="admin-span2">Consolas principales (IDs separados por coma)
            <input
              value={(element.mainIds || []).join(', ')}
              onChange={e => onUpdate({ mainIds: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
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

export function ElementCard({ el, index, total, onMoveUp, onMoveDown, onToggle, onEdit, onDelete, editingEl, setEditingEl, onUpdate }) {
  var isEditing = editingEl === el.id
  return (
    <li className="header-el-row">
      <div className="header-el-drag">
        <button type="button" onClick={onMoveUp} disabled={index === 0}>&#8593;</button>
        <button type="button" onClick={onMoveDown} disabled={index === total - 1}>&#8595;</button>
      </div>
      <div className="header-el-icon">
        {el.icon ? (el.icon.startsWith('/') ? <img src={el.icon} alt="" style={{ width: 20, height: 20 }} /> : getBuiltinIcon(el.icon)) : <span style={{ opacity: 0.3 }}>--</span>}
      </div>
      <div className="header-el-info">
        <input className="header-el-name" value={el.name} onChange={e => onUpdate({ name: e.target.value })} placeholder="Nombre" />
        <span className="header-el-type">{ELEMENT_TYPES.find(function(t) { return t.value === el.type })?.label || el.type}</span>
      </div>
      <label className="header-el-vis" title="Visible / Oculto">
        <input type="checkbox" checked={el.visible !== false} onChange={e => onToggle(e.target.checked)} />
      </label>
      <button type="button" className="admin-btn-secondary" onClick={function() { setEditingEl(isEditing ? null : el.id) }}>
        {isEditing ? 'Cerrar' : 'Editar'}
      </button>
      <button type="button" className="admin-btn-danger" onClick={onDelete}>&#10005;</button>
    </li>
  )
}
