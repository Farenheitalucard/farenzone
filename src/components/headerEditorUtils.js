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

export const ELEMENT_PRESETS = [
  { label: 'Switch', type: 'consoles', mainIds: ['switch', 'ps4', 'ps3', 'xbox360'] },
  { label: 'PS4', type: 'consoles', mainIds: ['ps4'] },
  { label: 'PS3', type: 'consoles', mainIds: ['ps3'] },
  { label: 'Xbox 360', type: 'consoles', mainIds: ['xbox360'] },
  { label: 'Telegram', type: 'social', url: 'https://t.me/zonagamerfa', icon: 'telegram' },
  { label: 'YouTube', type: 'social', url: 'https://youtube.com/@farenheitfa', icon: 'youtube' },
  { label: 'Donar', type: 'social', icon: 'heart' },
  { label: 'Inicio', type: 'nav', url: '/' },
  { label: 'Buscador', type: 'search' },
  { label: 'Panel admin', type: 'admin' },
  { label: 'Cambio tema', type: 'theme' },
  { label: 'Cambio idioma', type: 'language' },
  { label: 'Menu', type: 'menu' },
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

export function blankElement(order) {
  return { id: uid('el'), type: 'custom', name: 'Nuevo', url: '', icon: '', visible: true, order }
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
