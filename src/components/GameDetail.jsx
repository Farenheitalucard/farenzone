import { useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getConsole } from '../data/consoles'
import { setGames } from '../data/store'
import { useGames } from '../hooks/useGames'
import { useLoaded } from '../hooks/useLoaded'
import { useLanguage } from '../language-context'
import { useAdmin } from '../admin-context'
import { ScreenshotGallery } from './ScreenshotGallery'
import { DownloadInfo } from './DownloadInfo'
import { RecommendedGames } from './RecommendedGames'

export function GameDetail() {
  const { id } = useParams()
  const { lang, t } = useLanguage()
  const { isAdmin, token } = useAdmin()
  const navigate = useNavigate()
  const games = useGames()
  const loaded = useLoaded()
  const game = games.find((g) => g.id === id)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [id])

  if (!loaded) {
    return (
      <main className="page">
        <p className="loading">Cargando...</p>
      </main>
    )
  }

  if (!game) {
    return (
      <main className="page">
        <p className="not-found">404</p>
      </main>
    )
  }

  const consoleInfo = getConsole(game.console) || { name: game.console, color: '#888' }

  async function handleDelete() {
    if (!window.confirm(t.admin.confirmDelete)) return
    try {
      const res = await fetch(`/api/games/${encodeURIComponent(game.id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      })
      if (res.ok) {
        setGames(games.filter((g) => g.id !== game.id))
        navigate(`/consola/${game.console}`)
      }
    } catch {
      /* ignore */
    }
  }

  const fields = [
    { label: t.game.genre, value: game.genre },
    { label: t.game.developer, value: game.developer },
    { label: t.game.publisher, value: game.publisher },
    { label: t.game.year, value: game.year },
    { label: t.game.rating, value: game.rating ? `${game.rating}/100` : null },
    { label: t.game.players, value: game.players },
    { label: t.game.cooperative, value: game.cooperativo },
    { label: t.game.multiplayer, value: game.multijugador },
  ].filter((f) => f.value)

  return (
    <main className="page">
      <div className="game-detail">
        <div className="game-detail-cover">
          <DownloadInfo download={game.download} t={t} game={game} />
          <RecommendedGames currentGame={game} />
        </div>
        <div className="game-detail-info">
          <Link
            to={`/consola/${game.console}`}
            className="game-console-link"
            style={{ '--accent': consoleInfo.color }}
          >
            {consoleInfo.name}
          </Link>
          {isAdmin && (
            <div className="game-admin-bar">
              <Link to={`/admin?edit=${game.id}`} className="game-admin-btn">
                {t.admin.edit}
              </Link>
              <button
                type="button"
                className="game-admin-btn game-admin-danger"
                onClick={handleDelete}
              >
                {t.admin.delete}
              </button>
            </div>
          )}
          <h1 className="game-detail-title">{game.title}</h1>
          <p className="game-description">{game.description?.[lang] || ''}</p>

          {game.screenshots && game.screenshots.length > 0 && (
            <>
              <h2 className="details-title">{t.game.screenshots}</h2>
              <ScreenshotGallery screenshots={game.screenshots} trailer={game.trailer} title={game.title} />
            </>
          )}

          <h2 className="details-title">{t.game.details}</h2>
          <dl className="game-fields">
            {fields.map((f) => (
              <div className="game-field" key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>

          <Link to={`/consola/${game.console}`} className="btn-back">
            ← {t.game.backToConsole} {consoleInfo.name}
          </Link>
        </div>
      </div>
    </main>
  )
}
