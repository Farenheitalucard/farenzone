let cachedConsoles = null
let consolesListeners = new Set()

export const defaultConsoles = [
  {
    id: 'switch',
    name: 'Switch',
    fullName: 'Nintendo Switch',
    color: '#e60012',
    gradient: 'linear-gradient(135deg, #ff5a5f 0%, #c4001e 100%)',
    image: 'http://imgfz.com/i/2hok93e.png',
    icon: '/logos/switch.svg',
    active: true,
  },
  {
    id: 'ps4',
    name: 'PS4',
    fullName: 'PlayStation 4',
    color: '#2e6de0',
    gradient: 'linear-gradient(135deg, #5a9dff 0%, #1e4fb4 100%)',
    image: 'https://assets.gamingdeals.com/storage/uploads/2019/09/Only-on-PlayStation-header.jpg',
    icon: '/logos/playstation.svg',
    active: true,
  },
  {
    id: 'ps3',
    name: 'PS3',
    fullName: 'PlayStation 3',
    color: '#4a90d9',
    gradient: 'linear-gradient(135deg, #8fb9ff 0%, #2c5696 100%)',
    image: 'http://imgfz.com/i/m9R4lBG.png',
    icon: '/logos/playstation.svg',
    active: true,
  },
  {
    id: 'xbox360',
    name: 'Xbox 360',
    fullName: 'Xbox 360',
    color: '#107c10',
    gradient: 'linear-gradient(135deg, #3ecf3e 0%, #0a5a0a 100%)',
    image: 'http://imgfz.com/i/Cmvay9N.png',
    icon: '/logos/xbox.svg',
    active: true,
  },
]

export function getConsoles() {
  return cachedConsoles || defaultConsoles
}

export function getActiveConsoles() {
  return getConsoles().filter((c) => c.active !== false)
}

export function setConsoles(list) {
  cachedConsoles = list
  consolesListeners.forEach((l) => l())
}

export function subscribeConsoles(listener) {
  consolesListeners.add(listener)
  return () => consolesListeners.delete(listener)
}

export function getConsole(id) {
  return getConsoles().find((c) => c.id === id)
}

export async function loadConsolesFromApi() {
  try {
    const res = await fetch('/api/admin/consoles')
    if (!res.ok) return
    const data = await res.json()
    if (Array.isArray(data.consoles) && data.consoles.length) {
      setConsoles(data.consoles)
    }
  } catch {
    /* keep defaults */
  }
}
