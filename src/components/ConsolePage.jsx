import { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getConsole } from '../data/consoles'
import { useGames } from '../hooks/useGames'
import { useLanguage } from '../language-context'
import { Cover } from './Cover'
import { Pagination } from './Pagination'

const PAGE_SIZE = 12

function extractGenres(games) {
  const set = new Set()
  games.forEach((g) => {
    if (g.genre) {
      g.genre.split(/\s*[-–]\s*/).forEach((part) => set.add(part.trim()))
    }
  })
  return [...set].sort()
}

function extractYears(games) {
  const set = new Set()
  games.forEach((g) => { if (g.year) set.add(g.year) })
  return [...set].sort((a, b) => b - a)
}

function filterGames(games, { query, genre, year, sort }) {
  let result = games.map((g, i) => ({ g, i }))

  if (query.trim()) {
    const q = query.trim().toLowerCase()
    result = result.filter(({ g }) => g.title.toLowerCase().includes(q) || (g.genre || '').toLowerCase().includes(q))
  }

  if (genre) {
    result = result.filter(({ g }) => {
      if (!g.genre) return false
      const parts = g.genre.split(/\s*[-–]\s*/).map((p) => p.trim().toLowerCase())
      return parts.includes(genre.toLowerCase())
    })
  }

  if (year) {
    result = result.filter(({ g }) => String(g.year) === String(year))
  }

  if (sort === 'recent') {
    result.sort((a, b) => b.i - a.i)
  } else if (sort === 'oldest') {
    result.sort((a, b) => a.i - b.i)
  } else if (sort === 'recent_year') {
    result.sort((a, b) => (b.g.year || 0) - (a.g.year || 0))
  } else if (sort === 'oldest_year') {
    result.sort((a, b) => (a.g.year || 0) - (b.g.year || 0))
  } else if (sort === 'rating') {
    result.sort((a, b) => (b.g.rating || 0) - (a.g.rating || 0))
  } else if (sort === 'az') {
    result.sort((a, b) => a.g.title.localeCompare(b.g.title))
  } else if (sort === 'za') {
    result.sort((a, b) => b.g.title.localeCompare(a.g.title))
  } else {
    result.sort((a, b) => a.g.title.localeCompare(b.g.title))
  }

  return result.map(({ g }) => g)
}

function Dropdown({ label, options, value, onChange, renderOption }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectedLabel = value
    ? (renderOption ? renderOption(value) : value)
    : label

  return (
    <div className="filter-dropdown" ref={ref}>
      <button
        type="button"
        className={`filter-btn${value ? ' filter-btn-active' : ''}`}
        onClick={() => setOpen(!open)}
      >
        {selectedLabel} <span className="filter-arrow">▾</span>
      </button>
      {open && (
        <div className="filter-menu">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`filter-option${value === opt.value ? ' filter-option-active' : ''}`}
              onClick={() => { onChange(value === opt.value ? '' : opt.value); setOpen(false) }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ConsolePage() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useLanguage()
  const consoleInfo = getConsole(id) || { name: id, fullName: id, color: '#888', gradient: 'linear-gradient(135deg, #888 0%, #444 100%)' }
  const allGames = useGames()
  const consoleGames = useMemo(() => allGames.filter((g) => g.console === id), [allGames, id])

  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('')
  const [year, setYear] = useState('')
  const [sort, setSort] = useState('')

  const genres = useMemo(() => extractGenres(consoleGames), [consoleGames])
  const years = useMemo(() => extractYears(consoleGames), [consoleGames])

  const filtered = useMemo(
    () => filterGames(consoleGames, { query, genre, year, sort }),
    [consoleGames, query, genre, year, sort]
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.max(1, Math.min(parseInt(searchParams.get('page')) || 1, totalPages))
  const safePage = page
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [safePage])

  useEffect(() => {
    setSearchParams({}, { replace: true })
  }, [query, genre, year, sort, setSearchParams])

  if (!consoleInfo) {
    return (
      <main className="page">
        <p className="not-found">404</p>
      </main>
    )
  }

  function goTo(p) {
    const newPage = Math.max(1, Math.min(totalPages, p))
    setSearchParams({ page: newPage })
  }

  return (
    <main className="page">
      <header
        className="console-hero console-hero-compact"
        style={{ '--accent': consoleInfo.color, '--accent-grad': consoleInfo.gradient }}
      >
        {consoleInfo.video && (
          <div className="console-hero-video" aria-hidden="true">
            <video src={consoleInfo.video} muted playsInline loop autoPlay preload="auto" />
          </div>
        )}
        {consoleInfo.image && (
          <div className="console-hero-image" aria-hidden="true">
            <img src={consoleInfo.image} alt="" />
          </div>
        )}
        <span className="console-badge">{t.nav.home} / {consoleInfo.fullName || consoleInfo.name}</span>
        <h1 className="console-title">{consoleInfo.fullName || consoleInfo.name}</h1>
      </header>

      <section className="section">
        {consoleGames.length === 0 ? (
          <p className="no-games">{t.console.noGames}</p>
        ) : (
          <>
            <div className="console-filters">
              <div className="filter-search">
                <span className="filter-search-icon">🔎</span>
                <input
                  type="text"
                  className="filter-search-input"
                  placeholder={`${t.nav.search}...`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="filter-row">
                <Dropdown
                  label={t.console.genre}
                  value={genre}
                  onChange={setGenre}
                  options={genres.map((g) => ({ value: g, label: g }))}
                />
                <Dropdown
                  label={t.game.year}
                  value={year}
                  onChange={setYear}
                  options={years.map((y) => ({ value: String(y), label: String(y) }))}
                />
                <Dropdown
                  label={t.console.sortBy}
                  value={sort}
                  onChange={setSort}
                  options={[
                    { value: 'recent', label: t.console.recent },
                    { value: 'oldest', label: t.console.oldest },
                    { value: 'recent_year', label: t.console.recentYear },
                    { value: 'oldest_year', label: t.console.oldestYear },
                    { value: 'rating', label: t.console.bestRated },
                    { value: 'az', label: t.console.nameAZ },
                    { value: 'za', label: t.console.nameZA },
                  ]}
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <p className="no-games">{t.console.noResults}</p>
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
          </>
        )}
      </section>
    </main>
  )
}
