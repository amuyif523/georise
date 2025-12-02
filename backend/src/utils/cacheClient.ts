import Redis from 'ioredis'
import { SimpleCache } from './cache'

const DEFAULT_TTL = Number(process.env.CACHE_TTL_MS || 30_000)
const memCache = new SimpleCache<unknown>(DEFAULT_TTL)
let redisClient: Redis | null | undefined

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient
  const url = process.env.REDIS_URL
  if (!url) {
    redisClient = null
    return redisClient
  }
  try {
    redisClient = new Redis(url)
    redisClient.on('error', (err) => {
      console.warn('Redis cache error, falling back to memory:', err.message)
    })
    return redisClient
  } catch (err) {
    console.warn('Failed to init Redis, using memory cache:', err instanceof Error ? err.message : err)
    redisClient = null
    return redisClient
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis()
  if (redis) {
    try {
      const raw = await redis.get(key)
      if (!raw) return null
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }
  return (memCache.get(key) as T | null) ?? null
}

export async function cacheSet<T>(key: string, value: T, ttlMs = DEFAULT_TTL): Promise<void> {
  const redis = getRedis()
  if (redis) {
    try {
      const payload = JSON.stringify(value)
      if (ttlMs > 0) {
        await redis.set(key, payload, 'PX', ttlMs)
      } else {
        await redis.set(key, payload)
      }
      return
    } catch {
      // fall through to memory
    }
  }
  memCache.set(key, value, ttlMs)
}
