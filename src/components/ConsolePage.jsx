import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getConsole } from '../data/consoles'
import { useGames } from '../hooks/useGames'
import { useLanguage } from '../language-context'
import { sortByTitle } from '../data/store'
import { Cover } from './Cover'
import { Pagination } from './Pagination'

const PAGE_SIZE = 12

export function ConsolePage() {
  const { id } = useParams()
  const { t } = useLanguage()
  const consoleInfo = getConsole(id) || { name: id, fullName: id, color: '#888', gradient: 'linear-gradient(135deg, #888 0%, #444 100%)' }
  const allGames = useGames()
  const games = sortByTitle(allGames.filter((g) => g.console === id))
  const [pagination, setPagination] = useState({ id, page: 1 })
  if (pagination.id !== id) {
    setPagination({ id, page: 1 })
  }
  const page = pagination.page

  const totalPages = Math.max(1, Math.ceil(games.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visible = games.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [safePage])

  if (!consoleInfo) {
    return (
      <main className="page">
        <p className="not-found">404</p>
      </main>
    )
  }

  function goTo(p) {
    setPagination({ id, page: Math.max(1, Math.min(totalPages, p)) })
  }

  return (
    <main className="page">
      <header
        className="console-hero"
        style={{ '--accent': consoleInfo.color, '--accent-grad': consoleInfo.gradient }}
      >
        {consoleInfo.video && (
          <div className="console-hero-video" aria-hidden="true">
            <video src={consoleInfo.video} muted playsInline loop autoPlay preload="auto" />
          </div>
        )}
        <span className="console-badge">{t.nav.home} / {consoleInfo.fullName || consoleInfo.name}</span>
        <h1 className="console-title">{consoleInfo.fullName || consoleInfo.name}</h1>
        <p className="console-count">
          {games.length} {t.console.gamesCount}
        </p>
      </header>

      <section className="section">
        {games.length === 0 ? (
          <p className="no-games">{t.console.noGames}</p>
        ) : (
          <>
            <div className="game-grid">
              {visible.map((game) => (
                <Link key={game.id} to={`/juego/${game.id}`} className="game-card">
                  <Cover game={game} />
                  <div className="game-info">
                    <h3 className="game-title">{game.title}</h3>
                    <p className="game-meta">
                      {game.year} · {game.genre}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <Pagination page={safePage} totalPages={totalPages} onChange={goTo} />
          </>
        )}
      </section>
    </main>
  )
}
