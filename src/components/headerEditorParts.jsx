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

export function RowCard({ row, ri, totalRows, dk, editingEl, setEditingEl, expandedRow, setExpandedRow, allRows, updateRow, moveRow, removeRow, addElementToRow, removeElementFromRow, moveElementInRow, updateElementInRow, moveElementToRow }) {
  const rowEls = (row.elements || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const isExpanded = expandedRow === row.id
  const otherRows = allRows.filter(r => r.id !== row.id)

  return (
    <div className="header-row-card">
      <div className="header-row-header">
        <div className="header-row-drag">
          <button type="button" onClick={() => moveRow(dk, row.id, -1)} disabled={ri === 0}>&#8593;</button>
          <button type="button" onClick={() => moveRow(dk, row.id, 1)} disabled={ri === totalRows - 1}>&#8595;</button>
        </div>
        <input className="header-row-name" value={row.name} onChange={e => updateRow(dk, row.id, { name: e.target.value })} placeholder="Nombre de fila" />
        <span className="header-row-count">{rowEls.length} elem.</span>
        <button type="button" className="admin-btn-secondary" onClick={() => setExpandedRow(isExpanded ? null : row.id)}>
          {isExpanded ? '▼' : '▶'}
        </button>
        <button type="button" className="admin-btn-danger" onClick={() => removeRow(dk, row.id)}>&#10005;</button>
      </div>
      {isExpanded && (
        <div className="header-row-body">
          <div className="admin-grid" style={{ marginBottom: 12 }}>
            <label>Altura (px, 0=auto)
              <input type="number" value={row.height || 0} onChange={e => updateRow(dk, row.id, { height: +e.target.value })} />
            </label>
            <label>Espaciado (gap px)
              <input type="number" value={row.gap ?? 8} onChange={e => updateRow(dk, row.id, { gap: +e.target.value })} />
            </label>
            <label>Padding horizontal
              <input type="number" value={row.paddingX || 0} onChange={e => updateRow(dk, row.id, { paddingX: +e.target.value })} />
            </label>
            <label>Padding vertical
              <input type="number" value={row.paddingY || 0} onChange={e => updateRow(dk, row.id, { paddingY: +e.target.value })} />
            </label>
            <label>Posicion horizontal
              <select value={row.justify || 'flex-start'} onChange={e => updateRow(dk, row.id, { justify: e.target.value })}>
                {JUSTIFY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label>Posicion vertical
              <select value={row.align || 'center'} onChange={e => updateRow(dk, row.id, { align: e.target.value })}>
                {ALIGN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          </div>

          <ul className="header-el-list">
            {rowEls.map(el => (
              <li key={el.id} className="header-el-row">
                <div className="header-el-drag">
                  <button type="button" onClick={() => moveElementInRow(dk, row.id, el.id, -1)} disabled={rowEls[0]?.id === el.id}>&#8593;</button>
                  <button type="button" onClick={() => moveElementInRow(dk, row.id, el.id, 1)} disabled={rowEls[rowEls.length - 1]?.id === el.id}>&#8595;</button>
                </div>
                <div className="header-el-icon">
                  {el.icon ? (el.icon.startsWith('/') ? <img src={el.icon} alt="" style={{ width: 20, height: 20 }} /> : getBuiltinIcon(el.icon)) : <span style={{ opacity: 0.3 }}>--</span>}
                </div>
                <div className="header-el-info">
                  <input className="header-el-name" value={el.name} onChange={e => updateElementInRow(dk, row.id, el.id, { name: e.target.value })} placeholder="Nombre" />
                  <span className="header-el-type">{ELEMENT_TYPES.find(t => t.value === el.type)?.label || el.type}</span>
                </div>
                <label className="header-el-vis" title="Visible">
                  <input type="checkbox" checked={el.visible !== false} onChange={e => updateElementInRow(dk, row.id, el.id, { visible: e.target.checked })} />
                </label>
                {otherRows.length > 0 && (
                  <select className="header-el-move-select" value="" onChange={e => {
                    if (e.target.value) { moveElementToRow(dk, row.id, el.id, e.target.value); e.target.value = '' }
                  }}>
                    <option value="">Mover a...</option>
                    {otherRows.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                )}
                <button type="button" className="admin-btn-secondary" onClick={() => setEditingEl(editingEl === el.id ? null : el.id)}>
                  {editingEl === el.id ? 'Cerrar' : 'Editar'}
                </button>
                <button type="button" className="admin-btn-danger" onClick={() => removeElementFromRow(dk, row.id, el.id)}>&#10005;</button>
              </li>
            ))}
          </ul>
          <button type="button" className="admin-btn-secondary" onClick={() => addElementToRow(dk, row.id)}>+ Agregar elemento a esta fila</button>

          {editingEl && rowEls.find(e => e.id === editingEl) && (
            <EditElementPanel
              element={rowEls.find(e => e.id === editingEl)}
              onUpdate={patch => updateElementInRow(dk, row.id, editingEl, patch)}
              onClose={() => setEditingEl(null)}
            />
          )}
        </div>
      )}
    </div>
  )
}
