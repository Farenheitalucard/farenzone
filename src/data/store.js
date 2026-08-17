import { games as seedGames } from './games'

let current = seedGames
const listeners = new Set()

export function getGames() {
  return current
}

export function setGames(next) {
  current = next
  listeners.forEach((l) => l())
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getGame(id) {
  return current.find((g) => g.id === id)
}

export function getGamesByConsole(consoleId) {
  return current.filter((g) => g.console === consoleId)
}

export function sortByTitle(list) {
  return [...list].sort((a, b) =>
    (a.title || '').localeCompare(b.title || '', undefined, {
      sensitivity: 'base',
      numeric: true,
    }),
  )
}

export function searchGames(list, query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return list.filter((g) =>
    [g.title, g.genre, g.developer, g.publisher, String(g.year)]
      .join(' ')
      .toLowerCase()
      .includes(q),
  )
}

export async function loadGamesFromApi() {
  try {
    const res = await fetch('/api/games')
    if (!res.ok) return
    const data = await res.json()
    if (Array.isArray(data.games) && data.games.length) {
      setGames(data.games)
    }
  } catch {
    /* keep bundled data */
  }
}

export function resetGames() {
  setGames(seedGames)
}
