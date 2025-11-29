import { Request, Response } from 'express'
import { query } from '../../config/db'
import type { IncidentRecord } from './types'
import type { UserRecord } from '../auth/types'
import { classifyIncident } from './aiClient'
import { recordStatusChange, getHistory } from './history'

const MIN_CONFIDENCE = parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || '0.5')

async function ensureVerified(userId: number) {
  const users = await query<UserRecord>('SELECT * FROM users WHERE id = $1', [userId])
  const user = users[0]
  if (!user) throw new Error('User not found')
  if (user.verification_status !== 'verified') {
    throw new NotVerifiedError()
  }
}

class NotVerifiedError extends Error {
  code: 'NOT_VERIFIED'
  constructor() {
    super('User not verified')
    this.code = 'NOT_VERIFIED'
  }
}

export async function createIncident(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { description, category, lat, lng } = req.body as {
    description?: string
    category?: string
    lat?: number
    lng?: number
  }
  if (!description) return res.status(400).json({ error: 'description is required' })

  try {
    await ensureVerified(req.user.id)
  } catch (err) {
    if (err instanceof NotVerifiedError) {
      return res.status(403).json({ error: 'Verification required' })
    }
    const message = err instanceof Error ? err.message : 'Cannot create incident'
    return res.status(400).json({ error: message })
  }

  const rows = await query<IncidentRecord>(
    `INSERT INTO incidents (reporter_id, description, category, status, lat, lng, geom)
     VALUES ($1, $2, $3, 'submitted', $4, $5, CASE WHEN $4 IS NOT NULL AND $5 IS NOT NULL THEN ST_SetSRID(ST_MakePoint($5, $4), 4326) ELSE NULL END)
     RETURNING *`,
    [req.user.id, description, category ?? null, lat ?? null, lng ?? null]
  )
  const incident = rows[0]
  await recordStatusChange(incident.id, null, 'submitted', req.user.id)

  // Call AI stub, but do not fail if it is unavailable
  const ai = await classifyIncident(description)
  if (ai) {
    await query(
      `INSERT INTO incident_ai_outputs
       (incident_id, category_pred, severity_score, severity_label, confidence, summary, model_version)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (incident_id) DO UPDATE SET
         category_pred = EXCLUDED.category_pred,
         severity_score = EXCLUDED.severity_score,
         severity_label = EXCLUDED.severity_label,
         confidence = EXCLUDED.confidence,
         summary = EXCLUDED.summary,
         model_version = EXCLUDED.model_version
      `,
      [
        incident.id,
        ai.category,
        ai.severity_score,
        ai.severity_label,
        ai.confidence,
        ai.summary,
        ai.model_version,
      ]
    )
    await query(
      `INSERT INTO incident_ai_reclass (incident_id, model_version, category_pred, severity_score, severity_label, confidence)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [incident.id, ai.model_version, ai.category, ai.severity_score, ai.severity_label, ai.confidence]
    )
  }

  const aiMeta = ai
    ? {
        ...ai,
        lowConfidence: ai.confidence < MIN_CONFIDENCE,
      }
    : null

  return res.status(201).json({ incident, ai: aiMeta })
}

export async function listIncidents(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const page = Number(req.query.page ?? 1)
  const pageSize = Number(req.query.pageSize ?? 10)
  const limit = Math.min(pageSize, 50)
  const offset = (Math.max(page, 1) - 1) * limit

  const rows = await query<IncidentRecord>(
    `SELECT * FROM incidents WHERE reporter_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [req.user.id, limit, offset]
  )
  return res.json({ incidents: rows, page, pageSize: limit })
}

export async function getIncident(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { id } = req.params
  const rows = await query<
    IncidentRecord & {
      category_pred: string | null
      severity_score: number | null
      severity_label: number | null
      confidence: number | null
      ai_summary: string | null
      model_version: string | null
    }
  >(
    `SELECT i.*, a.category_pred, a.severity_score, a.severity_label, a.confidence, a.summary as ai_summary, a.model_version
     FROM incidents i
     LEFT JOIN incident_ai_outputs a ON a.incident_id = i.id
     WHERE i.id = $1 AND i.reporter_id = $2`,
    [id, req.user.id]
  )
  const incident = rows[0]
  if (!incident) return res.status(404).json({ error: 'Not found' })
  const history = await getHistory(incident.id)
  return res.json({
    incident: {
      id: incident.id,
      description: incident.description,
      category: incident.category,
      status: incident.status,
      created_at: incident.created_at,
    },
    history,
    ai: incident.category_pred
      ? {
          category: incident.category_pred,
          severity_score: incident.severity_score,
          severity_label: incident.severity_label,
          confidence: incident.confidence,
          summary: incident.ai_summary,
          model_version: incident.model_version,
        }
      : null,
  })
}
