import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useLanguage } from '../language-context'
import { useAdmin } from '../admin-context'
import { useTheme } from '../theme-context'
import { getConsole } from '../data/consoles'
import { useConsoles } from '../hooks/useConsoles'
import { useGames } from '../hooks/useGames'
import { searchGames } from '../data/store'
import { PAYPAL_URL } from '../data/config'
import { ConsoleIcon } from './ConsoleIcon'

const MAIN_CONSOLE_IDS = ['switch', 'ps4', 'ps3', 'xbox360']

export function Navbar() {
  const { lang, setLang, t } = useLanguage()
  const { isAdmin } = useAdmin()
  const { theme, setTheme } = useTheme()
  const games = useGames()
  const consoles = useConsoles()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const boxRef = useRef(null)
  const menuRef = useRef(null)

  const mainConsoles = consoles.filter((c) => MAIN_CONSOLE_IDS.includes(c.id))
  const menuConsoles = consoles

  useEffect(() => {
    function onDocClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false)
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const q = query.trim().toLowerCase()
  const results = q ? searchGames(games, query).slice(0, 8) : []

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <Link to="/" className="brand">
            Faren<span>Zone</span>
          </Link>
          <a
            href="https://t.me/zonagamerfa"
            className="telegram-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            title="Telegram"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          </a>
          <a
            href="https://youtube.com/@farenheitfa"
            className="telegram-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            title="YouTube"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
            </svg>
          </a>
          {PAYPAL_URL && (
            <a
              href={PAYPAL_URL}
              className="telegram-link donate-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.nav.donate}
              title={t.nav.donate}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </a>
          )}
        </div>

        <div className="search-box" ref={boxRef}>
          <input
            type="search"
            className="search-input"
            placeholder={t.nav.search}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                setOpen(false)
                navigate(`/buscar?q=${encodeURIComponent(query.trim())}`)
              }
              if (e.key === 'Escape') {
                setQuery('')
                setOpen(false)
              }
            }}
          />
          {open && q && (
            <div className="search-results">
              {results.length === 0 ? (
                <p className="search-empty">{t.nav.noResults}</p>
              ) : (
                results.map((game) => {
                  const consoleInfo = getConsole(game.console) || { name: game.console || '?', color: '#888' }
                  return (
                    <Link
                      key={game.id}
                      to={`/juego/${game.id}`}
                      className="search-result"
                      onClick={() => {
                        setQuery('')
                        setOpen(false)
                      }}
                    >
                      <span
                        className="search-result-dot"
                        style={{ background: consoleInfo.color }}
                      />
                      <span className="search-result-title">{game.title}</span>
                      <span className="search-result-console">
                        {consoleInfo.name}
                      </span>
                    </Link>
                  )
                })
              )}
            </div>
          )}
        </div>

          <nav className="nav-links">
            <div className="nav-links-scroll">
              <NavLink to="/" end>
                {t.nav.home}
              </NavLink>
              {mainConsoles.map((c) => (
                <NavLink key={c.id} to={`/consola/${c.id}`}>
                  <ConsoleIcon id={c.id} />
                  {t.nav[c.id] || c.name}
                </NavLink>
              ))}
            </div>
            <div className="nav-menu-wrap" ref={menuRef}>
              <button
                type="button"
                className={`nav-menu-btn${menuOpen ? ' nav-menu-open' : ''}`}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="M├ís consolas"
              >
                Ôÿ░
              </button>
              {menuOpen && (
                <div className="nav-menu-dropdown">
                  {menuConsoles.map((c) => (
                    <NavLink
                      key={c.id}
                      to={`/consola/${c.id}`}
                      className="nav-menu-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      <ConsoleIcon id={c.id} size={18} />
                      {t.nav[c.id] || c.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>

        {isAdmin ? (
          <Link to="/admin" className="panel-link">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.15" />
              <circle cx="12" cy="9.5" r="3.2" fill="currentColor" />
              <path d="M5 20a7 7 0 0 1 14 0" fill="currentColor" />
            </svg>
            {t.nav.panel}
          </Link>
        ) : (
          <Link to="/admin" className="admin-link" aria-label={t.admin.title}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.15" />
              <circle cx="12" cy="9.5" r="3.2" fill="currentColor" />
              <path d="M5 20a7 7 0 0 1 14 0" fill="currentColor" />
            </svg>
          </Link>
        )}

        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Cambiar tema / Switch theme"
          title="Cambiar tema / Switch theme"
        >
          {theme === 'dark' ? (
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <button
          type="button"
          className="lang-toggle"
          onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
          aria-label="Cambiar idioma / Switch language"
        >
          {lang === 'es' ? 'EN' : 'ES'}
        </button>
      </div>
    </header>
  )
}
