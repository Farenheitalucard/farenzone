import { getSessionAdmin } from './_lib'
import { readGames } from '../_shared'

const FILE_PATH = 'src/data/games.kv-backup.json'
const COMMIT_MSG = 'backup: update kv_backup.json from KV'

export async function onRequestPost(context) {
  const { env, request } = context
  const token = request.headers.get('x-admin-token')
  const admin = await getSessionAdmin(env, token)
  if (!admin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
  }

  const githubToken = env.GITHUB_TOKEN
  const githubRepo = env.GITHUB_REPO
  if (!githubToken || !githubRepo) {
    return new Response(JSON.stringify({ error: 'GITHUB_TOKEN or GITHUB_REPO not configured' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }

  const headers = {
    Authorization: `Bearer ${githubToken}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'farenzone-backup',
  }

  try {
    const games = await readGames(env)
    const newContent = JSON.stringify(games, null, 2) + '\n'

    const getUrl = `https://api.github.com/repos/${githubRepo}/contents/${FILE_PATH}`
    const getRes = await fetch(getUrl, { headers })
    if (!getRes.ok) {
      const err = await getRes.text()
      return new Response(JSON.stringify({ error: `GitHub GET failed: ${getRes.status}`, detail: err }), { status: 502, headers: { 'content-type': 'application/json' } })
    }
    const fileData = await getRes.json()
    const currentContent = atob(fileData.content.replace(/\n/g, ''))

    if (currentContent.trim() === newContent.trim()) {
      return new Response(JSON.stringify({ ok: true, unchanged: true, games: games.length }), { headers: { 'content-type': 'application/json' } })
    }

    const putRes = await fetch(getUrl, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: COMMIT_MSG,
        content: btoa(unescape(encodeURIComponent(newContent))),
        sha: fileData.sha,
        branch: 'main',
      }),
    })
    if (!putRes.ok) {
      const err = await putRes.text()
      return new Response(JSON.stringify({ error: `GitHub PUT failed: ${putRes.status}`, detail: err }), { status: 502, headers: { 'content-type': 'application/json' } })
    }

    return new Response(JSON.stringify({ ok: true, unchanged: false, games: games.length }), { headers: { 'content-type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
