import { useEffect, useState } from 'react'
import { AdminContext } from './admin-context'

const TOKEN_KEY = 'farenzone-admin-token'

export function AdminProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    if (!token) return
    let cancelled = false
    fetch('/api/admin/check', { headers: { 'x-admin-token': token } })
      .then((r) => {
        if (cancelled) return
        if (r.ok) {
          setIsAdmin(true)
        } else {
          localStorage.removeItem(TOKEN_KEY)
          setIsAdmin(false)
        }
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false)
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  function login(sessionToken) {
    localStorage.setItem(TOKEN_KEY, sessionToken)
    setToken(sessionToken)
    setIsAdmin(true)
    setChecking(false)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
    setIsAdmin(false)
  }

  return (
    <AdminContext.Provider value={{ token, isAdmin, checking, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}
