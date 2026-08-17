import { games as seedGames } from '../../../src/data/games'
import { getSessionEmail, json } from '../admin/_lib'

async function readGames(env) {
  const raw = await env.GAMES_KV.get('games')
  if (raw) return JSON.parse(raw)
  const seed = JSON.parse(JSON.stringify(seedGames))
  await env.GAMES_KV.put('games', JSON.stringify(seed))
  return seed
}

export async function onRequestDelete(context) {
  const token = (context.request.headers.get('x-admin-token') || '').trim()
  const email = await getSessionEmail(context.env, token)
  if (!email) return json({ error: 'unauthorized' }, 401)

  const url = new URL(context.request.url)
  const id = decodeURIComponent(url.pathname.split('/').pop() || '')
  const games = await readGames(context.env)
  const next = games.filter((g) => g.id !== id)
  await context.env.GAMES_KV.put('games', JSON.stringify(next))
  return json({ ok: true })
}
