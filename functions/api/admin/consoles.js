import { getSessionEmail } from './_lib'
import { json } from '../_apikey'

const CONSOLES_KEY = 'consoles'

const DEFAULT_CONSOLES = [
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

async function readConsoles(env) {
  const raw = await env.GAMES_KV.get(CONSOLES_KEY)
  if (!raw) return DEFAULT_CONSOLES
  try {
    const list = JSON.parse(raw)
    return Array.isArray(list) && list.length > 0 ? list : DEFAULT_CONSOLES
  } catch {
    return DEFAULT_CONSOLES
  }
}

async function writeConsoles(env, consoles) {
  await env.GAMES_KV.put(CONSOLES_KEY, JSON.stringify(consoles))
}

export async function onRequestGet(context) {
  const consoles = await readConsoles(context.env)
  return json({ consoles })
}

export async function onRequestPut(context) {
  const token = (context.request.headers.get('x-admin-token') || '').trim()
  const email = await getSessionEmail(context.env, token)
  if (!email) return json({ error: 'unauthorized' }, 401)

  let body
  try {
    body = await context.request.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }

  if (!Array.isArray(body.consoles)) {
    return json({ error: 'invalid payload' }, 400)
  }

  const clean = body.consoles.map((c) => ({
    id: String(c.id || '').trim().slice(0, 40),
    name: String(c.name || '').trim().slice(0, 30),
    fullName: String(c.fullName || '').trim().slice(0, 60),
    color: String(c.color || '#888').trim().slice(0, 20),
    gradient: String(c.gradient || '').trim().slice(0, 200),
    image: String(c.image || '').trim().slice(0, 500),
    icon: String(c.icon || '').trim().slice(0, 500),
    active: c.active !== false,
  })).filter((c) => c.id && c.name)

  await writeConsoles(context.env, clean)
  return json({ ok: true, consoles: clean })
}
