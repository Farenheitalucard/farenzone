import { isValidApiKey, json } from '../_apikey'
import { sanitizeGame, readGames, writeGames } from '../_shared'

export async function onRequestPost(context) {
  if (!isValidApiKey(context.request, context.env)) {
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

  const games = await readGames(context.env)
  const existing = games.findIndex((g) => g.id === game.id)

  if (existing >= 0) {
    games[existing] = game
  } else {
    games.push(game)
  }

  await writeGames(context.env, games)
  return json({ ok: true, action: existing >= 0 ? 'updated' : 'created', game })
}
