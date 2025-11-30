const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

type HttpMethod = 'GET' | 'POST'

type StoredAuth = { token: string; user: unknown }
const STORAGE_KEY = 'georise_auth'

function getStored(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredAuth) : null
  } catch {
    return null
  }
}

function setStored(auth: StoredAuth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
}

async function doFetch<T>(path: string, method: HttpMethod, body?: unknown, token?: string): Promise<{ res: Response; data: any }> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  return { res, data }
}

async function request<T>(path: string, method: HttpMethod, body?: unknown, token?: string): Promise<T> {
  const { res, data } = await doFetch<T>(path, method, body, token)
  if (res.status === 401 && !path.startsWith('/auth')) {
    const stored = getStored()
    if (stored?.token) {
      const refresh = await doFetch<{ token: string; refresh: string }>('/auth/refresh', 'POST', {}, stored.token)
      if (refresh.res.ok && refresh.data?.token) {
        setStored({ token: refresh.data.token, user: stored.user })
        const retry = await doFetch<T>(path, method, body, refresh.data.token)
        if (retry.res.ok) {
          return retry.data as T
        }
      }
    }
  }
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
