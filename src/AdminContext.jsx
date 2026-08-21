import { useCallback, useEffect, useState } from 'react'
import { AdminContext } from './admin-context'

const TOKEN_KEY = 'farenzone-admin-token'
const USER_KEY = 'farenzone-admin-user'

export function AdminProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) || null } catch { return null }
  })
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    if (!token) return
    let cancelled = false
    fetch('/api/admin/check', { headers: { 'x-admin-token': token } })
      .then(async (r) => {
        if (cancelled) return
        if (r.ok) {
          const data = await r.json()
          setIsAdmin(true)
          if (data.user) {
            setUser(data.user)
            localStorage.setItem(USER_KEY, JSON.stringify(data.user))
          }
        } else {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          setIsAdmin(false)
          setUser(null)
        }
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false)
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })
    return () => { cancelled = true }
  }, [token])

  function login(sessionToken, userData) {
    localStorage.setItem(TOKEN_KEY, sessionToken)
    setToken(sessionToken)
    setIsAdmin(true)
    setChecking(false)
    if (userData) {
      setUser(userData)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken('')
    setUser(null)
    setIsAdmin(false)
  }

  function updateUser(data) {
    setUser(data)
    localStorage.setItem(USER_KEY, JSON.stringify(data))
  }

  function hasPerm(perm) {
    if (!user) return false
    if (user.role === 'superadmin') return true
    return Array.isArray(user.permissions) && user.permissions.includes(perm)
  }

  const isSuperadmin = user?.role === 'superadmin'

  return (
    <AdminContext.Provider value={{ token, user, isAdmin, checking, login, logout, updateUser, hasPerm, isSuperadmin }}>
      {children}
    </AdminContext.Provider>
  )
}
