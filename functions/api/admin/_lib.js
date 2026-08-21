const ADMIN_KEY = 'admins'

function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function newSalt() {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return bytesToHex(arr)
}

export function newSessionToken() {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return bytesToHex(arr)
}

export async function hashPassword(password, salt) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
  return bytesToHex(bits)
}

export async function getAdmins(env) {
  const raw = await env.GAMES_KV.get(ADMIN_KEY)
  if (!raw) return []
  try {
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export async function saveAdmins(env, admins) {
  await env.GAMES_KV.put(ADMIN_KEY, JSON.stringify(admins))
}

export async function verifyPassword(password, admin) {
  const hash = await hashPassword(password, admin.salt)
  return hash === admin.pass
}

export async function createSession(env, email) {
  const token = newSessionToken()
  await env.GAMES_KV.put(`session:${token}`, email, { expirationTtl: 604800 })
  return token
}

export async function getSessionEmail(env, token) {
  if (!token) return null
  return (await env.GAMES_KV.get(`session:${token}`)) || null
}

export async function deleteSession(env, token) {
  if (!token) return
  await env.GAMES_KV.delete(`session:${token}`)
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function isValidEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
}

export const PERMISSIONS = {
  games: 'games',
  consoles: 'consoles',
  header: 'header',
  settings: 'settings',
  users: 'users',
}

const ALL_PERMS = Object.values(PERMISSIONS)

export function normalizeAdmin(a) {
  return {
    email: a.email || '',
    name: a.name || '',
    salt: a.salt || '',
    pass: a.pass || '',
    role: a.role || 'editor',
    permissions: Array.isArray(a.permissions) ? a.permissions : [],
    active: a.active !== false,
    avatar: a.avatar || '',
  }
}

export function isAdminSuperadmin(admin) {
  return admin && admin.role === 'superadmin'
}

export function hasPermission(admin, perm) {
  if (!admin || admin.active === false) return false
  if (admin.role === 'superadmin') return true
  return Array.isArray(admin.permissions) && admin.permissions.includes(perm)
}

export async function getAdminByEmail(env, email) {
  const admins = await getAdmins(env)
  return admins.find((a) => a.email === email) || null
}

export async function ensureMainAdminRole(env, email) {
  const admins = await getAdmins(env)
  const idx = admins.findIndex((a) => a.email === email)
  if (idx === -1) return
  const a = admins[idx]
  if (!a.role || a.role === 'editor') {
    const hasOtherSuperadmin = admins.some((x) => x.email !== email && x.role === 'superadmin')
    if (!hasOtherSuperadmin) {
      a.role = 'superadmin'
      a.permissions = []
      await saveAdmins(env, admins)
    }
  }
}

export async function getSessionAdmin(env, token) {
  const email = await getSessionEmail(env, token)
  if (!email) return null
  return await getAdminByEmail(env, email)
}

export function sanitizeAdminForClient(a) {
  return {
    email: a.email,
    name: a.name || '',
    role: a.role || 'editor',
    permissions: a.permissions || [],
    active: a.active !== false,
    avatar: a.avatar || '',
  }
}
