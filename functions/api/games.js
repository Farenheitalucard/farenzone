import { getSessionAdmin, hasPermission, PERMISSIONS } from './admin/_lib'
import { sanitizeGame, readGames, writeGames } from './_shared'

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
  const token = (context.request.headers.get('x-admin-token') || '').trim()
  const admin = await getSessionAdmin(context.env, token)
  if (!admin) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  if (!hasPermission(admin, PERMISSIONS.games)) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403,
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
  await writeGames(context.env, clean)
  return new Response(JSON.stringify({ ok: true, games: clean }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
