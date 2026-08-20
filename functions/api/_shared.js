function cleanText(value, max = 500) {
  return typeof value === 'string' ? value.slice(0, max) : ''
}

function cleanNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function sanitizeGame(g) {
  if (!g || typeof g.id !== 'string' || !g.id.trim() || typeof g.title !== 'string' || !g.title.trim()) {
    return null
  }
  return {
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
    multijugador: cleanText(g.multijugador, 40),
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
}

export async function readGames(env) {
  const raw = await env.GAMES_KV.get('games')
  if (raw) return JSON.parse(raw)
  return []
}

export async function writeGames(env, games) {
  await env.GAMES_KV.put('games', JSON.stringify(games))
}
