import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getConsole, setConsoles, loadConsolesFromApi } from '../data/consoles'
import { setGames, sortByTitle } from '../data/store'
import { useGames } from '../hooks/useGames'
import { useConsoles } from '../hooks/useConsoles'
import { useLanguage } from '../language-context'
import { useAdmin } from '../admin-context'
import { HeaderEditor } from './HeaderEditor'

const linkColors = ['blue', 'green', 'brown', 'purple', 'white']
const ALL_PERMISSIONS = ['games', 'consoles', 'header', 'settings', 'users']

function blankLinks() {
  return [
    { label: 'Mediafire', url: '', color: 'blue' },
    { label: 'Gdrive', url: '', color: 'green' },
    { label: 'gofile', url: '', color: 'brown' },
  ]
}

function blankGame(firstActiveConsole) {
  return {
    id: '',
    console: firstActiveConsole || 'switch',
    title: '',
    genre: '',
    developer: '',
    publisher: '',
    year: null,
    rating: null,
    players: '',
    cooperativo: '',
    multijugador: '',
    color: '#7c5cff',
    cover: '',
    trailer: '',
    screenshots: [],
    description: { es: '', en: '' },
    download: {
      region: '',
      size: '',
      format: '',
      update: '',
      fw: '',
      languages: '',
      thanks: '',
      mod: '',
      links: blankLinks(),
    },
  }
}

function blankConsole() {
  return {
    id: '',
    name: '',
    fullName: '',
    color: '#888888',
    gradient: 'linear-gradient(135deg, #888 0%, #444 100%)',
    image: '',
    icon: '',
    active: true,
    _origId: null,
  }
}

function blankUser() {
  return { email: '', name: '', password: '', role: 'editor', permissions: [], active: true }
}

const permLabels = {
  games: 'Juegos',
  consoles: 'Consolas',
  header: 'Encabezado',
  settings: 'Configuración',
  users: 'Usuarios',
}

export function AdminPage() {
  const { t } = useLanguage()
  const { token, user, isAdmin, checking, login, logout, updateUser, hasPerm, isSuperadmin } = useAdmin()
  const [searchParams, setSearchParams] = useSearchParams()
  const games = useGames()
  const allConsoles = useConsoles()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [logging, setLogging] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const autoEditRef = useRef(false)

  const [adminTab, setAdminTab] = useState('games')
  const [consoleDraft, setConsoleDraft] = useState(null)
  const [savingConsole, setSavingConsole] = useState(false)

  const [showProfile, setShowProfile] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profileCurrentPass, setProfileCurrentPass] = useState('')
  const [profileNewPass, setProfileNewPass] = useState('')
  const [profileAvatar, setProfileAvatar] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userDraft, setUserDraft] = useState(null)
  const [savingUser, setSavingUser] = useState(false)

  const [backupStatus, setBackupStatus] = useState('')
  const [backupRunning, setBackupRunning] = useState(false)

  const editParam = searchParams.get('edit')

  useEffect(() => {
    if (isAdmin && editParam && !autoEditRef.current) {
      const g = games.find((x) => x.id === editParam)
      if (g) {
        startEdit(g)
        autoEditRef.current = true
      }
    }
  })

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '')
      setProfileAvatar(user.avatar || '')
    }
  }, [user])

  async function submitLogin(e) {
    e.preventDefault()
    setLoginError(false)
    setLogging(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      if (res.ok) {
        const data = await res.json()
        login(data.token, data.user)
      } else {
        setLoginError(true)
      }
    } catch {
      setLoginError(true)
    } finally {
      setLogging(false)
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'x-admin-token': token },
      })
    } catch { /* ignore */ }
    logout()
  }

  async function handleBackupKV() {
    setBackupRunning(true)
    setBackupStatus('📦 Obteniendo juegos de KV...')
    try {
      const res = await fetch('/api/admin/backup-kv', {
        method: 'POST',
        headers: { 'x-admin-token': token },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
      if (data.unchanged) {
        setBackupStatus(`✓ KV y kv_backup.json ya están sincronizados (${data.games} juegos).\nNo se creó ningún commit.`)
      } else {
        setBackupStatus(`✓ ${data.games} juegos obtenidos\n✓ "kv_backup.json" actualizado\n✓ Commit creado\n✅ Backup completado correctamente`)
      }
    } catch (e) {
      setBackupStatus(`❌ Error: ${e.message}`)
    } finally {
      setBackupRunning(false)
    }
  }

  async function saveAll(next) {
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ games: next }),
      })
      if (!res.ok) throw new Error(`put failed: ${res.status}`)
      const data = await res.json()
      setGames(data.games)
      setMsg(t.admin.saved)
    } catch (e) {
      console.error('saveAll error:', e)
      setMsg(t.admin.error)
    } finally {
      setSaving(false)
    }
  }

  async function saveConsoles(next) {
    setSavingConsole(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/consoles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ consoles: next }),
      })
      if (!res.ok) throw new Error(`put failed: ${res.status}`)
      const data = await res.json()
      setConsoles(data.consoles)
      setMsg(t.admin.saved)
    } catch (e) {
      console.error('saveConsoles error:', e)
      setMsg(t.admin.error)
    } finally {
      setSavingConsole(false)
    }
  }

  function ensureUniqueId(id, originalId) {
    let base = id || 'juego'
    let candidate = base
    let i = 2
    while (games.some((g) => g.id === candidate && g.id !== originalId)) {
      candidate = `${base}-${i}`
      i += 1
    }
    return candidate
  }

  function ensureUniqueConsoleId(id, originalId) {
    let base = id || 'consola'
    let candidate = base
    let i = 2
    while (allConsoles.some((c) => c.id === candidate && c.id !== originalId)) {
      candidate = `${base}-${i}`
      i += 1
    }
    return candidate
  }

  function slugify(str) {
    return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
  }

  function buildFromDraft() {
    const d = draft
    const screenshots = (d.screenshots || []).map((s) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean)
    const links = (d.download?.links || []).filter((l) => l.label?.trim() && l.url?.trim()).map((l) => ({ label: l.label.trim(), url: l.url.trim(), color: l.color || 'blue' }))
    const dl = d.download || {}
    const hasDownload = links.length > 0 || dl.region || dl.size || dl.format || dl.update || dl.fw || dl.languages || dl.thanks || dl.mod
    const desc = d.description || {}
    return {
      id: ensureUniqueId(slugify(d.id || '') || slugify(d.title || ''), d._origId),
      console: d.console || allConsoles.find((c) => c.active !== false)?.id || 'switch',
      title: (d.title || '').trim(),
      genre: (d.genre || '').trim(),
      developer: (d.developer || '').trim(),
      publisher: (d.publisher || '').trim(),
      year: d.year === '' || d.year == null ? null : Number(d.year),
      rating: d.rating === '' || d.rating == null ? null : Number(d.rating),
      players: (d.players || '').trim(),
      cooperativo: (d.cooperativo || '').trim(),
      multijugador: (d.multijugador || '').trim(),
      color: (d.color || '').trim() || '#7c5cff',
      cover: (d.cover || '').trim(),
      trailer: (d.trailer || '').trim(),
      screenshots,
      description: { es: (desc.es || '').trim(), en: (desc.en || '').trim() },
      download: hasDownload
        ? { region: (dl.region || '').trim(), size: (dl.size || '').trim(), format: (dl.format || '').trim(), update: (dl.update || '').trim(), fw: (dl.fw || '').trim(), languages: (dl.languages || '').trim(), thanks: (dl.thanks || '').trim(), mod: (dl.mod || '').trim(), links }
        : null,
    }
  }

  function onSave(e) {
    e.preventDefault()
    try {
      if (!draft || !draft.title?.trim()) return
      const game = buildFromDraft()
      const next = draft._origId ? games.map((g) => (g.id === draft._origId ? game : g)) : [...games, game]
      saveAll(next).then(() => {
        setDraft(null)
        if (editParam) setSearchParams({}, { replace: true })
      })
    } catch (err) {
      console.error('onSave failed:', err)
      setMsg(t.admin.error)
    }
  }

  function onDelete(game) {
    if (!window.confirm(t.admin.confirmDelete)) return
    saveAll(games.filter((g) => g.id !== game.id))
  }

  function startEdit(g) {
    setMsg('')
    setDraft({ ...g, id: g.id, screenshots: [...(g.screenshots || [])], description: { es: g.description?.es || '', en: g.description?.en || '' }, download: g.download ? { ...g.download, links: (g.download.links || []).map((l) => ({ ...l })) } : blankGame().download, _origId: g.id })
  }

  function startNew() {
    setMsg('')
    setDraft(blankGame(allConsoles.find((c) => c.active !== false)?.id))
  }

  function setField(path, value) {
    setDraft((d) => {
      const next = JSON.parse(JSON.stringify(d))
      const parts = path.split('.')
      let obj = next
      for (let i = 0; i < parts.length - 1; i += 1) obj = obj[parts[i]]
      obj[parts[parts.length - 1]] = value
      return next
    })
  }

  function startNewConsole() { setMsg(''); setConsoleDraft(blankConsole()) }

  function startEditConsole(c) { setMsg(''); setConsoleDraft({ ...c, _origId: c.id }) }

  function setConsoleField(path, value) {
    setConsoleDraft((d) => {
      const next = JSON.parse(JSON.stringify(d))
      const parts = path.split('.')
      let obj = next
      for (let i = 0; i < parts.length - 1; i += 1) obj = obj[parts[i]]
      obj[parts[parts.length - 1]] = value
      return next
    })
  }

  function onSaveConsole(e) {
    e.preventDefault()
    if (!consoleDraft || !consoleDraft.name?.trim()) return
    const clean = { ...consoleDraft, id: ensureUniqueConsoleId(slugify(consoleDraft.id || '') || slugify(consoleDraft.name || ''), consoleDraft._origId), name: consoleDraft.name.trim(), fullName: (consoleDraft.fullName || '').trim() || consoleDraft.name.trim(), color: (consoleDraft.color || '#888').trim(), gradient: (consoleDraft.gradient || '').trim(), image: (consoleDraft.image || '').trim(), icon: (consoleDraft.icon || '').trim(), active: consoleDraft.active }
    delete clean._origId
    const next = consoleDraft._origId ? allConsoles.map((c) => (c.id === consoleDraft._origId ? clean : c)) : [...allConsoles, clean]
    saveConsoles(next).then(() => setConsoleDraft(null))
  }

  function onDeleteConsole(c) {
    const gameCount = games.filter((g) => g.console === c.id).length
    const label = c.fullName || c.name
    if (gameCount > 0) {
      if (!window.confirm(`"${label}" tiene ${gameCount} juego${gameCount > 1 ? 's' : ''} asociado${gameCount > 1 ? 's' : ''}.\n\n¿Estás seguro de eliminar esta consola?\n\nLos juegos NO se eliminarán.`)) return
      if (!window.confirm(`Segunda confirmación: ¿Eliminar "${label}" definitivamente?\n\nLos ${gameCount} juegos seguirán existiendo pero no tendrán consola asignada.`)) return
    } else {
      if (!window.confirm(`¿Eliminar la consola "${label}"?`)) return
    }
    saveConsoles(allConsoles.filter((x) => x.id !== c.id))
  }

  function onToggleConsole(c) {
    saveConsoles(allConsoles.map((x) => x.id === c.id ? { ...x, active: !x.active } : x))
  }

  async function saveProfile(e) {
    e.preventDefault()
    setSavingProfile(true)
    setMsg('')
    try {
      const body = { name: profileName }
      if (profileCurrentPass && profileNewPass) {
        body.currentPassword = profileCurrentPass
        body.newPassword = profileNewPass
      }
      if (profileAvatar !== (user?.avatar || '')) body.avatar = profileAvatar
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const data = await res.json()
        updateUser(data.user)
        setProfileCurrentPass('')
        setProfileNewPass('')
        setMsg(t.admin.saved)
      } else {
        const data = await res.json()
        setMsg(data.error || t.admin.error)
      }
    } catch {
      setMsg(t.admin.error)
    } finally {
      setSavingProfile(false)
    }
  }

  function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500 * 1024) { setMsg('La imagen no puede superar 500KB'); return }
    const reader = new FileReader()
    reader.onload = () => setProfileAvatar(reader.result)
    reader.readAsDataURL(file)
  }

  async function loadUsers() {
    setLoadingUsers(true)
    try {
      const res = await fetch('/api/admin/users', { headers: { 'x-admin-token': token } })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch { /* ignore */ }
    setLoadingUsers(false)
  }

  useEffect(() => {
    if (isAdmin && (isSuperadmin || hasPerm('users')) && adminTab === 'users') loadUsers()
  }, [isAdmin, adminTab])

  async function saveUser(e) {
    e.preventDefault()
    if (!userDraft) return
    setSavingUser(true)
    setMsg('')
    try {
      const action = userDraft._isNew ? 'create' : 'update'
      const body = { action, email: userDraft.email, name: userDraft.name, role: userDraft.role, permissions: userDraft.permissions, active: userDraft.active }
      if (userDraft._isNew && userDraft.password) body.password = userDraft.password
      if (!userDraft._isNew && userDraft.password) body.password = userDraft.password
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setMsg(t.admin.saved)
        setUserDraft(null)
        loadUsers()
      } else {
        const data = await res.json()
        setMsg(data.error || t.admin.error)
      }
    } catch {
      setMsg(t.admin.error)
    } finally {
      setSavingUser(false)
    }
  }

  async function deleteUser(u) {
    if (!window.confirm(`¿Eliminar al usuario "${u.name || u.email}"?`)) return
    setMsg('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ action: 'delete', email: u.email }),
      })
      if (res.ok) {
        setMsg('Usuario eliminado')
        loadUsers()
      } else {
        const data = await res.json()
        setMsg(data.error || t.admin.error)
      }
    } catch {
      setMsg(t.admin.error)
    }
  }

  async function toggleUserActive(u) {
    setMsg('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ action: 'update', email: u.email, active: !u.active }),
      })
      if (res.ok) loadUsers()
    } catch { /* ignore */ }
  }

  if (checking) {
    return <main className="page"><p className="not-found">…</p></main>
  }

  if (!isAdmin) {
    return (
      <main className="page">
        <div className="admin-login-card">
          <div className="admin-login-head">
            <div className="admin-lock-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="admin-title">{t.admin.title}</h1>
            <p className="admin-login-sub">{t.admin.loginSub}</p>
          </div>
          <form className="admin-login" onSubmit={submitLogin}>
            <div className="admin-field">
              <label htmlFor="admin-email">{t.admin.email}</label>
              <div className="admin-input-wrap">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus required />
              </div>
            </div>
            <div className="admin-field">
              <label htmlFor="admin-pass">{t.admin.password}</label>
              <div className="admin-input-wrap">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
                <input id="admin-pass" type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
                <button type="button" className="admin-eye" onClick={() => setShowPass((v) => !v)} tabIndex={-1} aria-label={t.admin.showPass}>
                  {showPass
                    ? <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                </button>
              </div>
            </div>
            {loginError && <div className="admin-error-banner" role="alert">{t.admin.wrong}</div>}
            <button type="submit" className="admin-btn-primary admin-btn-block" disabled={logging}>{logging ? t.admin.loading : t.admin.enter}</button>
          </form>
        </div>
      </main>
    )
  }

  const q = query.trim().toLowerCase()
  const filtered = sortByTitle(q ? games.filter((g) => `${g.title} ${g.genre} ${g.console} ${g.id}`.toLowerCase().includes(q)) : games)

  return (
    <main className="page">
      <div className="admin">
        <div className="admin-head">
          <h1 className="admin-title">{t.admin.title}</h1>
          <div className="admin-head-actions">
            <div className="admin-user-badge" onClick={() => { setShowProfile(true); setAdminTab('profile') }}>
              <span className="admin-user-name">{user?.name || user?.email}</span>
            </div>
            <button type="button" onClick={handleLogout}>{t.admin.logout}</button>
          </div>
        </div>

        {msg && <p className="admin-msg">{msg}</p>}

        {showProfile && !draft && !consoleDraft && !userDraft ? (
          <div className="admin-profile-section">
            <div className="admin-form-head">
              <h2>Mi perfil</h2>
              <button type="button" onClick={() => setShowProfile(false)}>← Volver</button>
            </div>
            <form className="admin-form" onSubmit={saveProfile}>
              <fieldset className="admin-fs">
                <legend>Información</legend>
                <div className="admin-grid">
                  <label>
                    Correo
                    <input value={user?.email || ''} disabled />
                  </label>
                  <label>
                    Nombre
                    <input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Tu nombre" />
                  </label>
                </div>
              </fieldset>
              <fieldset className="admin-fs">
                <legend>Cambiar contraseña</legend>
                <div className="admin-grid">
                  <label className="admin-span2">
                    Contraseña actual
                    <input type="password" value={profileCurrentPass} onChange={(e) => setProfileCurrentPass(e.target.value)} placeholder="Dejar vacío para no cambiar" />
                  </label>
                  <label className="admin-span2">
                    Nueva contraseña (mínimo 8 caracteres)
                    <input type="password" value={profileNewPass} onChange={(e) => setProfileNewPass(e.target.value)} minLength={8} />
                  </label>
                </div>
              </fieldset>
              <div><button type="submit" className="admin-btn-primary" disabled={savingProfile}>{savingProfile ? '…' : t.admin.save}</button></div>
            </form>
          </div>
        ) : null}

        {!showProfile && !draft && !consoleDraft && !userDraft && (
          <div className="admin-tabs">
            <button type="button" className={`admin-tab${adminTab === 'games' ? ' admin-tab-active' : ''}`} onClick={() => setAdminTab('games')} disabled={!hasPerm('games')}>Juegos ({games.length})</button>
            <button type="button" className={`admin-tab${adminTab === 'consoles' ? ' admin-tab-active' : ''}`} onClick={() => setAdminTab('consoles')} disabled={!hasPerm('consoles')}>Consolas ({allConsoles.length})</button>
            <button type="button" className={`admin-tab${adminTab === 'header' ? ' admin-tab-active' : ''}`} onClick={() => setAdminTab('header')} disabled={!hasPerm('header')}>Encabezado</button>
            {(isSuperadmin || hasPerm('users')) && (
              <button type="button" className={`admin-tab${adminTab === 'users' ? ' admin-tab-active' : ''}`} onClick={() => setAdminTab('users')}>Usuarios</button>
            )}
            {isSuperadmin && (
              <button type="button" className={`admin-tab${adminTab === 'backup' ? ' admin-tab-active' : ''}`} onClick={() => setAdminTab('backup')}>📦 Backup</button>
            )}
          </div>
        )}

        {draft ? (
          <form className="admin-form" onSubmit={onSave}>
            <div className="admin-form-head">
              <h2>{draft._origId ? t.admin.edit : t.admin.newGame}</h2>
              <div>
                <button type="button" onClick={() => setDraft(null)}>{t.admin.cancel}</button>
                <button type="submit" className="admin-btn-primary" disabled={saving}>{saving ? '…' : t.admin.save}</button>
              </div>
            </div>
            <fieldset className="admin-fs">
              <legend>{t.admin.basicInfo}</legend>
              <div className="admin-grid">
                <label>{t.admin.console}<select value={draft.console} onChange={(e) => setField('console', e.target.value)}>{allConsoles.filter((c) => c.active !== false).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
                <label>{t.admin.id}<input value={draft.id} onChange={(e) => setField('id', e.target.value)} placeholder={slugify(draft.title)} /></label>
                <label className="admin-span2">{t.admin.fieldTitle}<input value={draft.title} onChange={(e) => setField('title', e.target.value)} required /></label>
                <label>{t.admin.genre}<input value={draft.genre} onChange={(e) => setField('genre', e.target.value)} /></label>
                <label>{t.admin.developer}<input value={draft.developer} onChange={(e) => setField('developer', e.target.value)} /></label>
                <label>{t.admin.publisher}<input value={draft.publisher} onChange={(e) => setField('publisher', e.target.value)} /></label>
                <label>{t.admin.year}<input type="number" value={draft.year ?? ''} onChange={(e) => setField('year', e.target.value)} /></label>
                <label>{t.admin.rating}<input type="number" value={draft.rating ?? ''} onChange={(e) => setField('rating', e.target.value)} placeholder="0" /></label>
                <label>{t.admin.players}<input type="text" value={draft.players ?? ''} onChange={(e) => setField('players', e.target.value)} placeholder={t.admin.playersPlaceholder} /></label>
                <label>{t.game.cooperative}<select value={draft.cooperativo ?? ''} onChange={(e) => setField('cooperativo', e.target.value)}><option value="">Sin especificar</option><option value="No">No</option><option value="Local">Local</option><option value="Online">Online</option><option value="Local y online">Local y online</option></select></label>
                <label>{t.admin.multiplayer}<select value={draft.multijugador ?? ''} onChange={(e) => setField('multijugador', e.target.value)}><option value="">Sin especificar</option><option value="No">No</option><option value="Local">Local</option><option value="Online">Online</option><option value="Local y online">Local y online</option></select></label>
                <label>{t.admin.color}<input type="color" value={draft.color} onChange={(e) => setField('color', e.target.value)} /></label>
              </div>
            </fieldset>
            <fieldset className="admin-fs">
              <legend>{t.admin.media}</legend>
              <div className="admin-grid">
                <label className="admin-span2">{t.admin.cover}<input value={draft.cover} onChange={(e) => setField('cover', e.target.value)} /></label>
                <label className="admin-span2">{t.admin.trailer}<input value={draft.trailer} onChange={(e) => setField('trailer', e.target.value)} /></label>
                <label className="admin-span2">{t.admin.screenshots}<textarea rows="4" value={draft.screenshots.join('\n')} onChange={(e) => setField('screenshots', e.target.value.split('\n'))} /></label>
              </div>
            </fieldset>
            <fieldset className="admin-fs">
              <legend>{t.admin.download}</legend>
              <div className="admin-grid">
                <label>{t.admin.region}<textarea rows={3} value={draft.download.region} onChange={(e) => setField('download.region', e.target.value)} /></label>
                <label>{t.admin.size}<input value={draft.download.size} onChange={(e) => setField('download.size', e.target.value)} /></label>
                <label>{t.admin.format}<input value={draft.download.format} onChange={(e) => setField('download.format', e.target.value)} /></label>
                <label>{t.admin.update}<input value={draft.download.update} onChange={(e) => setField('download.update', e.target.value)} /></label>
                <label>{t.admin.fw}<input value={draft.download.fw} onChange={(e) => setField('download.fw', e.target.value)} /></label>
                <label>{t.admin.languages}<input value={draft.download.languages} onChange={(e) => setField('download.languages', e.target.value)} /></label>
                <label>{t.admin.thanks}<input value={draft.download.thanks} onChange={(e) => setField('download.thanks', e.target.value)} /></label>
                <label>{t.admin.mod}<input value={draft.download.mod || ''} onChange={(e) => setField('download.mod', e.target.value)} /></label>
              </div>
              <h3 className="admin-subtitle">{t.admin.links}</h3>
              <div className="admin-links">
                {draft.download.links.map((link, i) => (
                  <div key={i} className="admin-link-row">
                    <label>{t.admin.linkLabel}<input value={link.label} onChange={(e) => setField(`download.links.${i}.label`, e.target.value)} /></label>
                    <label>{t.admin.linkUrl}<input value={link.url} onChange={(e) => setField(`download.links.${i}.url`, e.target.value)} /></label>
                    <label>{t.admin.linkColor}<select value={link.color} onChange={(e) => setField(`download.links.${i}.color`, e.target.value)}>{linkColors.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
                    <button type="button" className="admin-link-remove" aria-label={t.admin.removeLink} title={t.admin.removeLink} onClick={() => setField('download.links', draft.download.links.filter((_, idx) => idx !== i))}>×</button>
                  </div>
                ))}
              </div>
              <button type="button" className="admin-btn-secondary" onClick={() => setField('download.links', [...draft.download.links, { label: '', url: '', color: 'blue' }])}>+ {t.admin.addLink}</button>
            </fieldset>
            <fieldset className="admin-fs">
              <legend>{t.admin.description}</legend>
              <div className="admin-grid">
                <label>{t.admin.descriptionEs}<textarea rows="4" value={draft.description?.es || ''} onChange={(e) => setField('description.es', e.target.value)} /></label>
                <label>{t.admin.descriptionEn}<textarea rows="4" value={draft.description?.en || ''} onChange={(e) => setField('description.en', e.target.value)} /></label>
              </div>
            </fieldset>
          </form>
        ) : consoleDraft ? (
          <form className="admin-form" onSubmit={onSaveConsole}>
            <div className="admin-form-head">
              <h2>{consoleDraft._origId ? 'Editar consola' : 'Nueva consola'}</h2>
              <div>
                <button type="button" onClick={() => setConsoleDraft(null)}>{t.admin.cancel}</button>
                <button type="submit" className="admin-btn-primary" disabled={savingConsole}>{savingConsole ? '…' : t.admin.save}</button>
              </div>
            </div>
            <fieldset className="admin-fs">
              <legend>Datos de la consola</legend>
              <div className="admin-grid">
                <label>Nombre corto<input value={consoleDraft.name} onChange={(e) => setConsoleField('name', e.target.value)} required placeholder="ej: Switch" /></label>
                <label>Nombre completo<input value={consoleDraft.fullName} onChange={(e) => setConsoleField('fullName', e.target.value)} placeholder="ej: Nintendo Switch" /></label>
                <label>ID<input value={consoleDraft.id} onChange={(e) => setConsoleField('id', e.target.value)} placeholder={slugify(consoleDraft.name)} /></label>
                <label>Color<input type="color" value={consoleDraft.color} onChange={(e) => setConsoleField('color', e.target.value)} /></label>
                <label className="admin-span2">Gradiente CSS<input value={consoleDraft.gradient} onChange={(e) => setConsoleField('gradient', e.target.value)} placeholder="linear-gradient(135deg, #ff5a5f 0%, #c4001e 100%)" /></label>
                <label className="admin-span2">Imagen de portada (URL)<input value={consoleDraft.image} onChange={(e) => setConsoleField('image', e.target.value)} placeholder="https://..." /></label>
                <label className="admin-span2">Icono (URL — imagen o SVG)<input value={consoleDraft.icon} onChange={(e) => setConsoleField('icon', e.target.value)} placeholder="/logos/switch.svg o https://..." /></label>
                <label className="admin-check-label"><input type="checkbox" checked={consoleDraft.active} onChange={(e) => setConsoleField('active', e.target.checked)} />Activa (visible en selección de nuevos juegos)</label>
              </div>
              {consoleDraft.icon && <div className="console-preview"><span className="console-preview-label">Vista previa icono:</span><img src={consoleDraft.icon} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} /><span>{consoleDraft.name}</span></div>}
            </fieldset>
          </form>
        ) : userDraft ? (
          <form className="admin-form" onSubmit={saveUser}>
            <div className="admin-form-head">
              <h2>{userDraft._isNew ? 'Nuevo usuario' : 'Editar usuario'}</h2>
              <div>
                <button type="button" onClick={() => setUserDraft(null)}>{t.admin.cancel}</button>
                <button type="submit" className="admin-btn-primary" disabled={savingUser}>{savingUser ? '…' : t.admin.save}</button>
              </div>
            </div>
            <fieldset className="admin-fs">
              <legend>Datos del usuario</legend>
              <div className="admin-grid">
                <label className="admin-span2">Correo electrónico<input type="email" value={userDraft.email} onChange={(e) => setUserDraft({ ...userDraft, email: e.target.value })} required disabled={!userDraft._isNew} /></label>
                <label className="admin-span2">Nombre<input value={userDraft.name} onChange={(e) => setUserDraft({ ...userDraft, name: e.target.value })} placeholder="Nombre para mostrar" /></label>
                <label className="admin-span2">{userDraft._isNew ? 'Contraseña (mínimo 8 caracteres)' : 'Nueva contraseña (dejar vacío para no cambiar)'}<input type="password" value={userDraft.password || ''} onChange={(e) => setUserDraft({ ...userDraft, password: e.target.value })} minLength={userDraft._isNew ? 8 : 0} required={userDraft._isNew} /></label>
                <label>Rol<select value={userDraft.role} onChange={(e) => setUserDraft({ ...userDraft, role: e.target.value })} disabled={userDraft.email === user?.email}><option value="editor">Editor</option><option value="admin">Admin</option></select></label>
                <label className="admin-check-label"><input type="checkbox" checked={userDraft.active} onChange={(e) => setUserDraft({ ...userDraft, active: e.target.checked })} />Activo</label>
              </div>
            </fieldset>
            {userDraft.role !== 'superadmin' && (
              <fieldset className="admin-fs">
                <legend>Permisos</legend>
                <div className="admin-perms-grid">
                  {ALL_PERMISSIONS.map((p) => (
                    <label key={p} className="admin-check-label">
                      <input type="checkbox" checked={userDraft.permissions.includes(p)} onChange={(e) => {
                        const next = e.target.checked ? [...userDraft.permissions, p] : userDraft.permissions.filter((x) => x !== p)
                        setUserDraft({ ...userDraft, permissions: next })
                      }} />
                      {permLabels[p] || p}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </form>
        ) : adminTab === 'consoles' ? (
          <>
            <div className="admin-toolbar">
              <button type="button" className="admin-btn-primary" onClick={startNewConsole}>+ Nueva consola</button>
            </div>
            <ul className="admin-list">
              {allConsoles.map((c) => {
                const gameCount = games.filter((g) => g.console === c.id).length
                return (
                  <li key={c.id} className="admin-row">
                    <div className="admin-row-info">
                      <span className="admin-tag" style={{ background: c.color }}>{c.icon ? <img src={c.icon} alt="" style={{ width: 14, height: 14, objectFit: 'contain', marginRight: 4, verticalAlign: 'middle' }} /> : null}{c.name}</span>
                      <div><strong>{c.fullName || c.name}</strong><span className="admin-row-id">{c.id} · {gameCount} juego{gameCount !== 1 ? 's' : ''}</span></div>
                    </div>
                    <div className="admin-row-actions">
                      <button type="button" className={c.active !== false ? 'admin-btn-toggle-on' : 'admin-btn-toggle-off'} onClick={() => onToggleConsole(c)}>{c.active !== false ? 'Activa' : 'Inactiva'}</button>
                      <button type="button" onClick={() => startEditConsole(c)}>{t.admin.edit}</button>
                      <button type="button" className="admin-btn-danger" onClick={() => onDeleteConsole(c)}>{t.admin.delete}</button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        ) : adminTab === 'header' ? (
          <HeaderEditor token={token} />
        ) : adminTab === 'users' ? (
          <>
            <div className="admin-toolbar">
              <button type="button" className="admin-btn-primary" onClick={() => setUserDraft({ ...blankUser(), _isNew: true })}>+ Nuevo usuario</button>
            </div>
            {loadingUsers ? <p className="admin-empty">Cargando…</p> : (
              <ul className="admin-list">
                {users.map((u) => (
                  <li key={u.email} className="admin-row">
                    <div className="admin-row-info">
                      <div className="admin-user-avatar">
                        {u.avatar ? <img src={u.avatar} alt="" /> : <div className="admin-avatar-empty-small">{(u.name || u.email)[0].toUpperCase()}</div>}
                      </div>
                      <div>
                        <strong>{u.name || u.email}</strong>
                        <span className="admin-row-id">{u.email} · <span className={`admin-role-badge admin-role-${u.role}`}>{u.role}</span>{u.active === false ? ' · <span class="admin-inactive-badge">Inactivo</span>' : ''}</span>
                      </div>
                    </div>
                    <div className="admin-row-actions">
                      <button type="button" className={u.active !== false ? 'admin-btn-toggle-on' : 'admin-btn-toggle-off'} onClick={() => toggleUserActive(u)}>{u.active !== false ? 'Activo' : 'Inactivo'}</button>
                      <button type="button" onClick={() => setUserDraft({ ...u, password: '', _isNew: false })}>{t.admin.edit}</button>
                      {u.email !== user?.email && <button type="button" className="admin-btn-danger" onClick={() => deleteUser(u)}>{t.admin.delete}</button>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : adminTab === 'backup' ? (
          <div className="admin-backup">
            <h2>📦 Backup de KV</h2>
            <p className="admin-empty">Respaldar el contenido actual de KV en el repositorio de GitHub.</p>
            <button type="button" className="admin-btn-primary" onClick={handleBackupKV} disabled={backupRunning}>
              {backupRunning ? '⏳ Procesando...' : '📦 RESPALDAR KV EN GITHUB'}
            </button>
            {backupStatus && (
              <pre className="admin-backup-status">{backupStatus}</pre>
            )}
          </div>
        ) : (
          <>
            <div className="admin-toolbar">
              <input className="admin-search" type="search" placeholder={t.admin.search} value={query} onChange={(e) => setQuery(e.target.value)} />
              <button type="button" className="admin-btn-primary" onClick={startNew}>{t.admin.newGame}</button>
            </div>
            {filtered.length === 0 ? <p className="admin-empty">{t.admin.emptyList}</p> : (
              <ul className="admin-list">
                {filtered.map((g) => {
                  const c = getConsole(g.console)
                  return (
                    <li key={g.id} className="admin-row">
                      <div className="admin-row-info">
                        <span className="admin-tag" style={{ background: c?.color || '#666' }}>{c?.icon ? <img src={c.icon} alt="" style={{ width: 14, height: 14, objectFit: 'contain', marginRight: 4, verticalAlign: 'middle' }} /> : null}{g.console}</span>
                        <div><strong>{g.title}</strong><span className="admin-row-id">{g.id}</span></div>
                      </div>
                      <div className="admin-row-actions">
                        <button type="button" onClick={() => startEdit(g)}>{t.admin.edit}</button>
                        <button type="button" className="admin-btn-danger" onClick={() => onDelete(g)}>{t.admin.delete}</button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </main>
  )
}
