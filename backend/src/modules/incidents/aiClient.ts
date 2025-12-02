import axios from 'axios'
import { cacheGet, cacheSet } from '../../utils/cacheClient'

const AI_URL = process.env.AI_SERVICE_URL || 'http://ai-service:9000'
const AI_MODEL = process.env.AI_MODEL_NAME || 'stub-logreg'
const AI_CACHE_MS = Number(process.env.AI_CACHE_MS || 60_000)

type AIResponse = {
  category: string
  severity_score: number
  severity_label: number
  confidence: number
  summary: string
  model_version: string
}

export async function classifyIncident(text: string): Promise<AIResponse | null> {
  const cacheKey = `ai:${AI_MODEL}:${text}`
  const cached = await cacheGet<AIResponse>(cacheKey)
  if (cached) return cached

  try {
    const res = await axios.post<AIResponse>(`${AI_URL}/classify`, { text, model: AI_MODEL })
    await cacheSet(cacheKey, res.data, AI_CACHE_MS)
    return res.data
  } catch {
    return null
  }
}
