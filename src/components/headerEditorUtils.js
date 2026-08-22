export const ELEMENT_TYPES = [
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

export const DEVICE_ICONS = { pc: '\uD83D\uDDA5\uFE0F', mobile: '\uD83D\uDCF1', tablet: '\uD83D\uDCF2', general: '\u2699\uFE0F' }
export const DEVICE_LABELS = { pc: 'PC', mobile: 'Movil', tablet: 'Tablet', general: 'Configuracion general' }

export const JUSTIFY_OPTIONS = [
  { value: 'flex-start', label: 'Izquierda' },
  { value: 'center', label: 'Centro' },
  { value: 'flex-end', label: 'Derecha' },
  { value: 'space-between', label: 'Espacio entre' },
  { value: 'space-around', label: 'Espacio alrededor' },
  { value: 'space-evenly', label: 'Espacio uniforme' },
]

export const ALIGN_OPTIONS = [
  { value: 'flex-start', label: 'Arriba' },
  { value: 'center', label: 'Centro' },
  { value: 'flex-end', label: 'Abajo' },
  { value: 'stretch', label: 'Estirar' },
]

export function uid(prefix) {
  return prefix + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

export function deepClone(o) {
  return JSON.parse(JSON.stringify(o))
}

export function sortEls(a) {
  return (a || []).slice().sort((x, y) => (x.order ?? 0) - (y.order ?? 0))
}

export function sortRows(a) {
  return (a || []).slice().sort((x, y) => (x.order ?? 0) - (y.order ?? 0))
}

export function blankElement(order) {
  return { id: uid('el'), type: 'custom', name: 'Nuevo', url: '', icon: '', visible: true, order }
}

export function blankRow(order) {
  return {
    id: uid('row'), name: 'Fila ' + (order + 1), order,
    height: 0, gap: 8, paddingX: 0, paddingY: 0,
    justify: 'flex-start', align: 'center', elements: [],
  }
}

export function defaultLayout(dk) {
  const d = {
    pc: { height: 64, maxWidth: 1180, paddingX: 20, gap: 10 },
    mobile: { height: 0, maxWidth: 0, paddingX: 16, gap: 6 },
    tablet: { height: 0, maxWidth: 0, paddingX: 16, gap: 8 },
  }
  return {
    height: 0, maxWidth: 0, paddingX: 0, paddingY: 0, gap: 8,
    justify: 'flex-start', align: 'center', iconSize: 18, textSize: 14,
    ...(d[dk] || {}),
  }
}

export function generateRowsFromFlat(elements) {
  const social = []
  const nav = []
  const tools = []
  const search = []
  const sorted = sortEls(elements || [])
  sorted.forEach((el) => {
    if (el.type === 'social') social.push(el)
    else if (el.type === 'search') search.push({ ...el, order: 0 })
    else if (['admin', 'theme', 'language'].includes(el.type)) tools.push(el)
    else nav.push(el)
  })
  const rows = []
  if (social.length) rows.push({
    id: uid('row'), name: 'Redes sociales', order: 0,
    height: 0, gap: 8, paddingX: 0, paddingY: 0,
    justify: 'flex-start', align: 'center',
    elements: social.map((e, i) => ({ ...e, order: i })),
  })
  if (nav.length) rows.push({
    id: uid('row'), name: 'Navegacion', order: rows.length,
    height: 0, gap: 8, paddingX: 0, paddingY: 0,
    justify: 'flex-start', align: 'center',
    elements: nav.map((e, i) => ({ ...e, order: i })),
  })
  if (tools.length) rows.push({
    id: uid('row'), name: 'Herramientas', order: rows.length,
    height: 0, gap: 8, paddingX: 0, paddingY: 0,
    justify: 'flex-start', align: 'center',
    elements: tools.map((e, i) => ({ ...e, order: i })),
  })
  if (search.length) rows.push({
    id: uid('row'), name: 'Buscador', order: rows.length,
    height: 0, gap: 8, paddingX: 0, paddingY: 0,
    justify: 'flex-start', align: 'center',
    elements: search.map((e, i) => ({ ...e, order: i })),
  })
  return rows
}
