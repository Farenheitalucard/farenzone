import { getSessionEmail } from './_lib'
import { json } from '../_apikey'

const HEADER_KEY = 'header_config'

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

async function readConfig(env) {
  const raw = await env.GAMES_KV.get(HEADER_KEY)
  if (!raw) return DEFAULT_CONFIG
  try {
    const cfg = JSON.parse(raw)
    if (!cfg || !cfg.elements) return DEFAULT_CONFIG
    return cfg
  } catch {
    return DEFAULT_CONFIG
  }
}

async function writeConfig(env, config) {
  await env.GAMES_KV.put(HEADER_KEY, JSON.stringify(config))
}

export async function onRequestGet(context) {
  const config = await readConfig(context.env)
  return json({ config })
}

export async function onRequestPut(context) {
  const token = (context.request.headers.get('x-admin-token') || '').trim()
  const email = await getSessionEmail(context.env, token)
  if (!email) return json({ error: 'unauthorized' }, 401)

  let body
  try { body = await context.request.json() } catch { return json({ error: 'invalid json' }, 400) }
  if (!body.config) return json({ error: 'missing config' }, 400)

  const cfg = body.config
  if (cfg.brand) {
    cfg.brand = {
      name: String(cfg.brand.name || 'Faren').slice(0, 30),
      nameAccent: String(cfg.brand.nameAccent || 'Zone').slice(0, 30),
      url: String(cfg.brand.url || '/').slice(0, 200),
    }
  }
  if (Array.isArray(cfg.elements)) {
    cfg.elements = cfg.elements.map((el) => ({
      id: String(el.id || '').slice(0, 40),
      type: String(el.type || 'custom').slice(0, 20),
      name: String(el.name || '').slice(0, 40),
      url: String(el.url || '').slice(0, 500),
      icon: String(el.icon || '').slice(0, 500),
      visible: el.visible !== false,
      order: typeof el.order === 'number' ? el.order : 0,
      mainIds: Array.isArray(el.mainIds) ? el.mainIds.map((x) => String(x).slice(0, 40)) : undefined,
    })).filter((el) => el.id)
  }
  if (cfg.devices && typeof cfg.devices === 'object') {
    for (const key of ['pc', 'mobile', 'tablet']) {
      if (cfg.devices[key]) {
        const d = cfg.devices[key]
        cfg.devices[key] = {
          height: typeof d.height === 'number' ? d.height : 0,
          maxWidth: typeof d.maxWidth === 'number' ? d.maxWidth : 0,
          paddingX: typeof d.paddingX === 'number' ? d.paddingX : 16,
          gap: typeof d.gap === 'number' ? d.gap : 8,
          iconSize: typeof d.iconSize === 'number' ? d.iconSize : 16,
          textSize: typeof d.textSize === 'number' ? d.textSize : 13,
          overrides: typeof d.overrides === 'object' && d.overrides ? d.overrides : {},
        }
      }
    }
  }

  await writeConfig(context.env, cfg)
  return json({ ok: true, config: cfg })
}
