import { getAdmins, verifyPassword, createSession, sanitizeAdminForClient, ensureMainAdminRole, json } from './_lib'

export async function onRequestPost(context) {
  let body
  try {
    body = await context.request.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  if (!email || !password) return json({ error: 'missing fields' }, 400)

  const admins = await getAdmins(context.env)
  const admin = admins.find((a) => a.email === email)
  if (!admin || !(await verifyPassword(password, admin))) {
    return json({ error: 'invalid credentials' }, 401)
  }

  if (admin.active === false) {
    return json({ error: 'account deactivated' }, 403)
  }

  await ensureMainAdminRole(context.env, admin.email)

  const freshAdmin = (await getAdmins(context.env)).find((a) => a.email === email) || admin

  const token = await createSession(context.env, admin.email)
  return json({ ok: true, token, user: sanitizeAdminForClient(freshAdmin) })
}
