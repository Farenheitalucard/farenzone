let cached = null
let listeners = new Set()

const DEFAULT_CONFIG = {
  brand: { name: 'Faren', nameAccent: 'Zone', url: '/' },
  elements: [
    { id: 'telegram', type: 'social', name: 'Telegram', url: 'https://t.me/zonagamerfa', icon: 'telegram', visible: true, order: 0 },
    { id: 'youtube', type: 'social', name: 'YouTube', url: 'https://youtube.com/@farenheitfa', icon: 'youtube', visible: true, order: 1 },
    { id: 'donate', type: 'social', name: 'Donar', url: '', icon: 'heart', visible: true, order: 2 },
    { id: 'search', type: 'search', name: 'Buscar', visible: true, order: 3 },
    { id: 'home', type: 'nav', name: 'Inicio', url: '/', visible: true, order: 4 },
    { id: 'consoles', type: 'consoles', name: 'Consolas', visible: true, order: 5, mainIds: ['switch', 'ps4', 'ps3', 'xbox360'] },
    { id: 'menu', type: 'menu', name: '☰', visible: true, order: 6 },
    { id: 'admin', type: 'admin', name: 'Panel', visible: true, order: 7 },
    { id: 'theme', type: 'theme', name: 'Tema', visible: true, order: 8 },
    { id: 'language', type: 'language', name: 'Idioma', visible: true, order: 9 },
  ],
  devices: {
    pc: { height: 64, maxWidth: 1180, paddingX: 20, gap: 10, iconSize: 18, textSize: 14, overrides: {} },
    mobile: { height: 0, maxWidth: 0, paddingX: 16, gap: 6, iconSize: 16, textSize: 13, overrides: {} },
    tablet: { height: 0, maxWidth: 0, paddingX: 16, gap: 8, iconSize: 16, textSize: 13, overrides: {} },
  },
}

export function getHeaderConfig() {
  return cached || DEFAULT_CONFIG
}

export function setHeaderConfig(cfg) {
  cached = cfg
  listeners.forEach((l) => l())
}

export function subscribeHeaderConfig(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export async function loadHeaderConfig() {
  try {
    const res = await fetch('/api/admin/header')
    if (!res.ok) return
    const data = await res.json()
    if (data.config) setHeaderConfig(data.config)
  } catch {
    /* keep defaults */
  }
}
