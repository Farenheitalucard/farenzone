import {
  getSessionAdmin,
  getAdmins,
  saveAdmins,
  hashPassword,
  newSalt,
  verifyPassword,
  sanitizeAdminForClient,
  json,
} from './_lib'

export async function onRequestGet(context) {
  const token = (context.request.headers.get('x-admin-token') || '').trim()
  const admin = await getSessionAdmin(context.env, token)
  if (!admin) return json({ error: 'unauthorized' }, 401)
  return json({ user: sanitizeAdminForClient(admin) })
}

export async function onRequestPut(context) {
  const token = (context.request.headers.get('x-admin-token') || '').trim()
  const admin = await getSessionAdmin(context.env, token)
  if (!admin) return json({ error: 'unauthorized' }, 401)

  let body
  try {
    body = await context.request.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }

  const admins = await getAdmins(context.env)
  const idx = admins.findIndex((a) => a.email === admin.email)
  if (idx === -1) return json({ error: 'user not found' }, 404)

  if (body.currentPassword && body.newPassword) {
    const valid = await verifyPassword(body.currentPassword, admins[idx])
    if (!valid) return json({ error: 'current password is incorrect' }, 400)
    if (body.newPassword.length < 8) return json({ error: 'new password must be at least 8 characters' }, 400)
    admins[idx].salt = newSalt()
    admins[idx].pass = await hashPassword(body.newPassword, admins[idx].salt)
  }

  if (body.name !== undefined) {
    admins[idx].name = String(body.name).trim().slice(0, 60)
  }

  if (body.avatar !== undefined) {
    admins[idx].avatar = String(body.avatar || '').slice(0, 100000)
  }

  await saveAdmins(context.env, admins)
  return json({ ok: true, user: sanitizeAdminForClient(admins[idx]) })
}
