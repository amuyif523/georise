import axios from 'axios'

const AI_URL = process.env.AI_SERVICE_URL || 'http://ai-service:9000'
const AI_MODEL = process.env.AI_MODEL_NAME || 'stub-logreg'

type AIResponse = {
  category: string
  severity_score: number
  severity_label: number
  confidence: number
  summary: string
  model_version: string
}

export async function classifyIncident(text: string): Promise<AIResponse | null> {
  try {
    const res = await axios.post<AIResponse>(`${AI_URL}/classify`, { text, model: AI_MODEL })
    return res.data
  } catch {
    return null
  }
}
