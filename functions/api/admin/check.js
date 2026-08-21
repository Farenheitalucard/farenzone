import { getSessionAdmin, ensureMainAdminRole, sanitizeAdminForClient, json } from './_lib'

export async function onRequestGet(context) {
  const token = (context.request.headers.get('x-admin-token') || '').trim()
  const admin = await getSessionAdmin(context.env, token)
  if (!admin || admin.active === false) return json({ ok: false }, 401)
  await ensureMainAdminRole(context.env, admin.email)
  const freshAdmin = (await getSessionAdmin(context.env, token)) || admin
  return json({ ok: true, user: sanitizeAdminForClient(freshAdmin) })
}
