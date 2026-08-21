import {
  getSessionAdmin,
  getAdmins,
  saveAdmins,
  hashPassword,
  newSalt,
  isAdminSuperadmin,
  hasPermission,
  PERMISSIONS,
  sanitizeAdminForClient,
  isValidEmail,
  json,
} from './_lib'

export async function onRequestGet(context) {
  const token = (context.request.headers.get('x-admin-token') || '').trim()
  const admin = await getSessionAdmin(context.env, token)
  if (!admin) return json({ error: 'unauthorized' }, 401)

  if (!hasPermission(admin, PERMISSIONS.users) && !isAdminSuperadmin(admin)) {
    return json({ error: 'forbidden' }, 403)
  }

  const admins = await getAdmins(context.env)
  return json({ users: admins.map(sanitizeAdminForClient) })
}

export async function onRequestPut(context) {
  const token = (context.request.headers.get('x-admin-token') || '').trim()
  const admin = await getSessionAdmin(context.env, token)
  if (!admin) return json({ error: 'unauthorized' }, 401)

  if (!isAdminSuperadmin(admin)) {
    return json({ error: 'only superadmin can manage users' }, 403)
  }

  let body
  try {
    body = await context.request.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }

  const action = body.action

  if (action === 'create') {
    const email = String(body.email || '').trim().toLowerCase()
    const name = String(body.name || '').trim()
    const role = body.role === 'superadmin' ? 'superadmin' : body.role === 'admin' ? 'admin' : 'editor'
    const permissions = Array.isArray(body.permissions) ? body.permissions.filter((p) => Object.values(PERMISSIONS).includes(p)) : []

    if (!email || !isValidEmail(email)) return json({ error: 'invalid email' }, 400)

    const admins = await getAdmins(context.env)
    if (admins.some((a) => a.email === email)) return json({ error: 'email already exists' }, 409)

    const password = String(body.password || '')
    if (!password || password.length < 8) return json({ error: 'password must be at least 8 characters' }, 400)

    const salt = newSalt()
    const pass = await hashPassword(password, salt)

    admins.push({
      email,
      name,
      salt,
      pass,
      role,
      permissions: role === 'superadmin' ? [] : permissions,
      active: true,
      avatar: '',
    })

    await saveAdmins(context.env, admins)
    return json({ ok: true, user: sanitizeAdminForClient(admins[admins.length - 1]) })
  }

  if (action === 'update') {
    const email = String(body.email || '').trim().toLowerCase()
    if (!email) return json({ error: 'missing email' }, 400)

    const admins = await getAdmins(context.env)
    const idx = admins.findIndex((a) => a.email === email)
    if (idx === -1) return json({ error: 'user not found' }, 404)

    const target = admins[idx]

    if (target.email === admin.email) return json({ error: 'cannot modify your own account here' }, 403)

    if (body.name !== undefined) target.name = String(body.name).trim()
    if (body.role !== undefined && body.role !== 'superadmin') {
      target.role = body.role === 'admin' ? 'admin' : 'editor'
    }
    if (body.permissions !== undefined && target.role !== 'superadmin') {
      target.permissions = Array.isArray(body.permissions) ? body.permissions.filter((p) => Object.values(PERMISSIONS).includes(p)) : []
    }
    if (body.active !== undefined) {
      target.active = Boolean(body.active)
    }
    if (body.password && body.password.length >= 8) {
      target.salt = newSalt()
      target.pass = await hashPassword(body.password, target.salt)
    }

    admins[idx] = target
    await saveAdmins(context.env, admins)
    return json({ ok: true, user: sanitizeAdminForClient(target) })
  }

  if (action === 'delete') {
    const email = String(body.email || '').trim().toLowerCase()
    if (!email) return json({ error: 'missing email' }, 400)

    const admins = await getAdmins(context.env)
    const target = admins.find((a) => a.email === email)
    if (!target) return json({ error: 'user not found' }, 404)

    if (target.email === admin.email) return json({ error: 'cannot delete yourself' }, 403)
    if (target.role === 'superadmin') return json({ error: 'cannot delete superadmin' }, 403)

    const next = admins.filter((a) => a.email !== email)
    await saveAdmins(context.env, next)
    return json({ ok: true })
  }

  return json({ error: 'invalid action' }, 400)
}
