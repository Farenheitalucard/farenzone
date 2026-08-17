import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { searchGames, sortByTitle } from '../data/store'
import { useLanguage } from '../language-context'
import { Cover } from './Cover'
import { Pagination } from './Pagination'

const PAGE_SIZE = 12

export function SearchPage() {
  const { t } = useLanguage()
  const [params] = useSearchParams()
  const q = (params.get('q') || '').trim().toLowerCase()
  const games = useGames()
  const results = sortByTitle(searchGames(games, q))
  const [pagination, setPagination] = useState({ q, page: 1 })
  if (pagination.q !== q) {
    setPagination({ q, page: 1 })
  }
  const page = pagination.page

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visible = results.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [safePage])

  function goTo(p) {
    setPagination({ q, page: Math.max(1, Math.min(totalPages, p)) })
  }

  return (
    <main className="page">
      <header className="search-header">
        <span className="console-badge">{t.nav.home} / {t.search.title}</span>
        <h1 className="search-title">{t.search.title}</h1>
        {q && (
          <p className="console-count">
            {results.length} {t.search.results} «{q}»
          </p>
        )}
      </header>

      <section className="section">
        {!q || results.length === 0 ? (
          <p className="no-games">
            {q ? `${t.search.empty} «${q}».` : t.search.prompt}
          </p>
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
