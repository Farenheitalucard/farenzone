export function isValidApiKey(request, env) {
  const key = (request.headers.get('x-api-key') || '').trim()
  if (!key || !env.API_KEY) return false
  return key === env.API_KEY
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
