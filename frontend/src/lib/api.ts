const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

type HttpMethod = 'GET' | 'POST'

async function request<T>(path: string, method: HttpMethod, body?: unknown, token?: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = data?.error || 'Request failed'
    throw new Error(msg)
  }
  return data as T
}

export const api = {
  post: <T>(path: string, body: unknown, token?: string) => request<T>(path, 'POST', body, token),
  get:  <T>(path: string, token?: string) => request<T>(path, 'GET', undefined, token),
}
