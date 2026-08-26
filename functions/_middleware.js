const SITE_URL = 'https://farenzone-1ey.pages.dev'
const DEFAULT_TITLE = 'FarenZone'
const DEFAULT_DESC = 'Juegos para PS4, PS3, Nintendo Switch, Xbox 360 y más'
const DEFAULT_IMAGE = `${SITE_URL}/favicon.png`

const BOTS = /bot|crawl|spider|facebook|twitter|whatsapp|telegram|discord|slack|skype|linkedin|pinterest|google.*image|facebot|archive|slackbot|vkbot|viber|line\/|microblog|iframely|unfurl|embedly|applebot|baiduspider|yandex|duckduckbot/i

function metaTags(og) {
  return [
    `<meta property="og:title" content="${og.title}">`,
    `<meta property="og:description" content="${og.desc}">`,
    `<meta property="og:image" content="${og.image}" width="1200" height="630">`,
    `<meta property="og:url" content="${og.url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="FarenZone">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${og.title}">`,
    `<meta name="twitter:description" content="${og.desc}">`,
    `<meta name="twitter:image" content="${og.image}" width="1200" height="630">`,
  ].join('\n    ')
}

async function readGames(env) {
  const raw = await env.GAMES_KV.get('games')
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

async function serveSPA(request, env, tags) {
  const res = await fetch(new URL('/index.html', request.url))
  let html = await res.text()
  if (tags) {
    html = html.replace(/\s*<meta\s+(?:property="og:[^"]*"|name="twitter:[^"]*")[^>]*\/?>/g, '')
    html = html.replace('<head>', `<head>\n    ${tags}`)
  }
  return new Response(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}

export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const path = url.pathname
  const ua = request.headers.get('user-agent') || ''

  if (path.startsWith('/api/') || path.startsWith('/assets/') || path === '/' || path.includes('.')) {
    return context.next()
  }

  const og = { title: DEFAULT_TITLE, desc: DEFAULT_DESC, image: DEFAULT_IMAGE, url: url.href }

  if (path.startsWith('/juego/') && path.split('/').filter(Boolean).length >= 2) {
    const gameId = path.split('/').filter(Boolean)[1]
    const games = await readGames(env)
    const game = games.find((g) => g.id === gameId)
    if (game) {
      const cover = game.cover || DEFAULT_IMAGE
      const desc = (game.description?.es || game.description?.en || '').slice(0, 200)
      og.title = `${game.title} | FarenZone`
      og.desc = desc || DEFAULT_DESC
      og.image = cover
    }
  } else if (path.startsWith('/consola/')) {
    const slug = path.split('/').filter(Boolean)[1]
    if (slug) {
      og.title = `${slug.toUpperCase()} - Juegos | FarenZone`
      og.desc = `Explora todos los juegos de ${slug.toUpperCase()} en FarenZone`
    }
  } else if (path.startsWith('/buscador')) {
    og.title = 'Buscar | FarenZone'
    og.desc = 'Busca juegos por título, género o consola'
  }

  const isBot = BOTS.test(ua)
  return serveSPA(request, env, isBot ? metaTags(og) : null)
}
