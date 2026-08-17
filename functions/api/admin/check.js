import { getSessionEmail, json } from './_lib'

export async function onRequestGet(context) {
  const token = (context.request.headers.get('x-admin-token') || '').trim()
  const email = await getSessionEmail(context.env, token)
  return json({ ok: Boolean(email) }, email ? 200 : 401)
}
