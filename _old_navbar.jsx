import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useLanguage } from '../language-context'
import { useAdmin } from '../admin-context'
import { useTheme } from '../theme-context'
import { getConsole } from '../data/consoles'
import { useConsoles } from '../hooks/useConsoles'
import { useHeaderConfig } from '../hooks/useHeaderConfig'
import { useGames } from '../hooks/useGames'
import { searchGames } from '../data/store'
import { ConsoleIcon } from './ConsoleIcon'
import { getBuiltinIcon } from '../data/headerIcons'
import { PAYPAL_URL } from '../data/config'

function SocialIcon({ el }) {
  if (el.icon && el.icon.startsWith('/')) {
    return <img src={el.icon} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
  }
  return getBuiltinIcon(el.icon) || null
}

export function Navbar() {
  const { lang, setLang, t } = useLanguage()
  const { isAdmin } = useAdmin()
  const { theme, setTheme } = useTheme()
  const games = useGames()
  const consoles = useConsoles()
  const headerConfig = useHeaderConfig()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const boxRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const q = query.trim().toLowerCase()
  const results = q ? searchGames(games, query).slice(0, 8) : []

  const brand = headerConfig.brand || { name: 'Faren', nameAccent: 'Zone', url: '/' }
  const elements = (headerConfig.elements || [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const mainConsoles = consoles.filter((c) => {
    const consolesEl = elements.find((e) => e.type === 'consoles')
    const mainIds = consolesEl?.mainIds || ['switch', 'ps4', 'ps3', 'xbox360']
    return mainIds.includes(c.id)
  })

  const donateUrl = elements.find((e) => e.id === 'donate')?.url || PAYPAL_URL || ''

  function renderElement(el) {
    if (el.visible === false) return null

    switch (el.type) {
      case 'social': {
        const url = el.url || (el.id === 'donate' ? donateUrl : '')
        if (!url) return null
        return (
          <a key={el.id} href={url} className="telegram-link" target="_blank" rel="noopener noreferrer" aria-label={el.name} title={el.name}>
            <SocialIcon el={el} />
          </a>
        )
      }
      case 'search':
        return (
          <div key="search" className="search-box" ref={boxRef}>
            <input
              type="search"
              className="search-input"
              placeholder={el.name || t.nav.search}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) { setOpen(false); navigate(`/buscar?q=${encodeURIComponent(query.trim())}`) }
                if (e.key === 'Escape') { setQuery(''); setOpen(false) }
              }}
            />
            {open && q && (
              <div className="search-results">
                {results.length === 0 ? (
                  <p className="search-empty">{t.nav.noResults}</p>
                ) : (
                  results.map((game) => {
                    const ci = getConsole(game.console) || { name: game.console || '?', color: '#888' }
                    return (
                      <Link key={game.id} to={`/juego/${game.id}`} className="search-result" onClick={() => { setQuery(''); setOpen(false) }}>
                        <span className="search-result-dot" style={{ background: ci.color }} />
                        <span className="search-result-title">{game.title}</span>
                        <span className="search-result-console">{ci.name}</span>
                      </Link>
                    )
                  })
                )}
              </div>
            )}
          </div>
        )
      case 'nav':
        return (
          <NavLink key={el.id} to={el.url || '/'} end={el.url === '/'}>
            {el.name || t.nav.home}
          </NavLink>
        )
      case 'consoles':
        return (
          <div key="consoles-group" className="nav-links-scroll">
            {mainConsoles.map((c) => (
              <NavLink key={c.id} to={`/consola/${c.id}`}>
                <ConsoleIcon id={c.id} />
                {t.nav[c.id] || c.name}
              </NavLink>
            ))}
          </div>
        )
      case 'menu':
        return (
          <div key="menu" className="nav-menu-wrap" ref={menuRef}>
            <button type="button" className={`nav-menu-btn${menuOpen ? ' nav-menu-open' : ''}`} onClick={() => setMenuOpen((v) => !v)} aria-label="M├ís consolas">
              Ôÿ░
            </button>
            {menuOpen && (
              <div className="nav-menu-dropdown">
                {consoles.map((c) => (
                  <NavLink key={c.id} to={`/consola/${c.id}`} className="nav-menu-item" onClick={() => setMenuOpen(false)}>
                    <ConsoleIcon id={c.id} size={18} />
                    {t.nav[c.id] || c.name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )
      case 'admin':
        return isAdmin ? (
          <Link key={el.id} to="/admin" className="panel-link">
            <SocialIcon el={{ ...el, icon: 'adminPanel' }} />
            {el.name || t.nav.panel}
          </Link>
        ) : (
          <Link key={el.id} to="/admin" className="admin-link" aria-label={t.admin.title}>
            {getBuiltinIcon('admin')}
          </Link>
        )
      case 'theme':
        return (
          <button
            key={el.id}
            type="button"
            className="theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Cambiar tema"
            title="Cambiar tema"
          >
            {theme === 'dark' ? getBuiltinIcon('sun') : getBuiltinIcon('moon')}
          </button>
        )
      case 'language':
        return (
          <button key={el.id} type="button" className="lang-toggle" onClick={() => setLang(lang === 'es' ? 'en' : 'es')} aria-label="Cambiar idioma">
            {lang === 'es' ? 'EN' : 'ES'}
          </button>
        )
      default:
        if (el.url) {
          return (
            <a key={el.id} href={el.url} className="telegram-link" target="_blank" rel="noopener noreferrer" aria-label={el.name} title={el.name}>
              {el.icon ? <SocialIcon el={el} /> : <span>{el.name}</span>}
            </a>
          )
        }
        return null
    }
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <Link to={brand.url || '/'} className="brand">
            {brand.name}<span>{brand.nameAccent}</span>
          </Link>
          {elements.filter((e) => e.type === 'social' && e.visible !== false).map(renderElement)}
        </div>

        <nav className="nav-links">
          {elements.filter((e) => e.type !== 'social' && e.visible !== false).map(renderElement)}
        </nav>
      </div>
    </header>
  )
}
