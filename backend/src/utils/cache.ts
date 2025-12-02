type CacheEntry<T> = { value: T; expires: number }

export class SimpleCache<T = unknown> {
  private store = new Map<string, CacheEntry<T>>()

  constructor(private ttlMs: number) {}

  get(key: string): T | null {
    const hit = this.store.get(key)
    if (!hit) return null
    if (Date.now() > hit.expires) {
      this.store.delete(key)
      return null
    }
    return hit.value
  }

  set(key: string, value: T, ttlOverrideMs?: number) {
    const ttl = ttlOverrideMs ?? this.ttlMs
    this.store.set(key, { value, expires: Date.now() + ttl })
  }
}
