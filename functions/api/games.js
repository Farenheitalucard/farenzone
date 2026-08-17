import { games as seedGames } from '../../src/data/games'
import { getSessionEmail } from './admin/_lib'

async function readGames(env) {
  const raw = await env.GAMES_KV.get('games')
  if (raw) return JSON.parse(raw)
  const seed = JSON.parse(JSON.stringify(seedGames))
  await env.GAMES_KV.put('games', JSON.stringify(seed))
  return seed
}

async function authorized(request, env) {
  const token = (request.headers.get('x-admin-token') || '').trim()
  return Boolean(await getSessionEmail(env, token))
}

function cleanText(value, max = 500) {
  return typeof value === 'string' ? value.slice(0, max) : ''
}

function cleanNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function sanitizeGame(g) {
  if (!g || typeof g.id !== 'string' || !g.id.trim() || typeof g.title !== 'string' || !g.title.trim()) {
    return null
  }
  const clean = {
    id: g.id.trim().slice(0, 80),
    console: cleanText(g.console, 40) || 'switch',
    title: g.title.trim().slice(0, 200),
    genre: cleanText(g.genre, 100),
    developer: cleanText(g.developer, 100),
    publisher: cleanText(g.publisher, 100),
    year: cleanNumber(g.year),
    rating: cleanNumber(g.rating),
    players: cleanText(g.players, 40),
    cooperativo: cleanText(g.cooperativo, 40),
    color: cleanText(g.color, 30),
    cover: cleanText(g.cover, 500),
    trailer: cleanText(g.trailer, 40),
    screenshots: Array.isArray(g.screenshots)
      ? g.screenshots.map((s) => cleanText(s, 500)).filter(Boolean).slice(0, 20)
      : [],
    description: {
      es: cleanText(g.description?.es, 2000),
      en: cleanText(g.description?.en, 2000),
    },
    download: g.download
      ? {
          region: cleanText(g.download.region, 120),
          size: cleanText(g.download.size, 40),
          format: cleanText(g.download.format, 40),
          update: cleanText(g.download.update, 40),
          fw: cleanText(g.download.fw, 40),
          languages: cleanText(g.download.languages, 200),
          thanks: cleanText(g.download.thanks, 200),
          links: Array.isArray(g.download.links)
            ? g.download.links
                .map((l) => ({
                  label: cleanText(l.label, 60),
                  url: cleanText(l.url, 500),
                  color: cleanText(l.color, 20),
                }))
                .filter((l) => l.label && l.url)
                .slice(0, 10)
            : [],
        }
      : null,
  }
  return clean
}

function dedupeIds(games) {
  const seen = new Set()
  return games.map((g) => {
    if (seen.has(g.id)) {
      let base = g.id
      let i = 2
      while (seen.has(`${base}-${i}`)) i += 1
      g.id = `${base}-${i}`
    }
    seen.add(g.id)
    return g
  })
}

export async function onRequestGet(context) {
  const games = await readGames(context.env)
  return new Response(JSON.stringify({ games }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

export async function onRequestPut(context) {
  if (!(await authorized(context.request, context.env))) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body
  try {
    body = await context.request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!Array.isArray(body.games) || body.games.length > 2000) {
    return new Response(JSON.stringify({ error: 'invalid payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const clean = dedupeIds(body.games.map(sanitizeGame).filter(Boolean))
  await context.env.GAMES_KV.put('games', JSON.stringify(clean))
  return new Response(JSON.stringify({ ok: true, games: clean }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
