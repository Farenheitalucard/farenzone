import { deleteSession, json } from './_lib'

export async function onRequestPost(context) {
  const token = (context.request.headers.get('x-admin-token') || '').trim()
  await deleteSession(context.env, token)
  return json({ ok: true })
}
