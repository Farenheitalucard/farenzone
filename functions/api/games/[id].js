import { getSessionEmail, json } from '../admin/_lib'
import { isValidApiKey } from '../_apikey'
import { sanitizeGame, readGames, writeGames } from '../_shared'

export async function onRequestGet(context) {
  const url = new URL(context.request.url)
  const id = decodeURIComponent(url.pathname.split('/').pop() || '')
  const games = await readGames(context.env)
  const game = games.find((g) => g.id === id)
  if (!game) return json({ error: 'not found' }, 404)
  return json(game)
}

export async function onRequestPut(context) {
  const url = new URL(context.request.url)
  const id = decodeURIComponent(url.pathname.split('/').pop() || '')

  const isAdmin = Boolean(await getSessionEmail(context.env, context.request.headers.get('x-admin-token') || ''))
  const isApiKey = isValidApiKey(context.request, context.env)

  if (!isAdmin && !isApiKey) {
    return json({ error: 'unauthorized' }, 401)
  }

  let body
  try {
    body = await context.request.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }

  const game = sanitizeGame(body)
  if (!game) {
    return json({ error: 'invalid game: id and title are required' }, 400)
  }

  if (game.id !== id) {
    return json({ error: 'game id in body does not match URL' }, 400)
  }

  const games = await readGames(context.env)
  const idx = games.findIndex((g) => g.id === id)

  if (idx >= 0) {
    games[idx] = game
  } else {
    games.push(game)
  }

  await writeGames(context.env, games)
  return json({ ok: true, action: idx >= 0 ? 'updated' : 'created', game })
}

export async function onRequestDelete(context) {
  const token = (context.request.headers.get('x-admin-token') || '').trim()
  const email = await getSessionEmail(context.env, token)
  if (!email) return json({ error: 'unauthorized' }, 401)

  const url = new URL(context.request.url)
  const id = decodeURIComponent(url.pathname.split('/').pop() || '')
  const games = await readGames(context.env)
  const next = games.filter((g) => g.id !== id)
  await writeGames(context.env, next)
  return json({ ok: true })
}
