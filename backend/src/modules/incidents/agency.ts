import { Request, Response } from 'express'
import { query } from '../../config/db'
import type { IncidentRecord } from './types'
import { recordStatusChange } from './history'
import { getHistory } from './history'
import { classifyIncident } from './aiClient'
import { isWithinGeoFence } from '../../utils/geofence'
import { emitEvent } from '../../utils/realtime'
const MIN_CONFIDENCE = parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || '0.5')

type AgencyContext = {
  agencyId: number
}

async function getStaffAgency(userId: number): Promise<AgencyContext> {
  const rows = await query<{ agency_id: number }>(
    `SELECT agency_id FROM agency_staff WHERE user_id = $1 LIMIT 1`,
    [userId]
  )
  const agencyId = rows[0]?.agency_id
  if (!agencyId) {
    throw new Error('Agency staff not found')
  }
  return { agencyId }
}

export async function listAgencyIncidents(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const { agencyId } = await getStaffAgency(req.user.id)
    const page = Number(req.query.page ?? 1)
    const pageSize = Number(req.query.pageSize ?? 10)
    const limit = Math.min(pageSize, 50)
    const offset = (Math.max(page, 1) - 1) * limit
    const status = req.query.status as string | undefined
    const category = req.query.category as string | undefined

    const filters: string[] = ['assigned_agency_id = $1']
    const params: unknown[] = [agencyId]
    if (status) {
      params.push(status)
      filters.push(`status = $${params.length}`)
    }
    if (category) {
      params.push(category)
      filters.push(`category = $${params.length}`)
    }
    const where = `WHERE ${filters.join(' AND ')}`

    const rows = await query<IncidentRecord>(
      `SELECT * FROM incidents ${where} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${
        params.length + 2
      }`,
      [...params, limit, offset]
    )
    return res.json({ incidents: rows, page, pageSize: limit })
  } catch (err) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to fetch incidents' })
  }
}

export async function getAgencyIncident(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { id } = req.params
  try {
    const { agencyId } = await getStaffAgency(req.user.id)
    const rows = await query<
      IncidentRecord & {
        category_pred: string | null
        severity_score: number | null
        severity_label: number | null
        confidence: number | null
        summary: string | null
        model_version: string | null
      }
    >(
      `SELECT i.*, a.category_pred, a.severity_score, a.severity_label, a.confidence, a.summary, a.model_version
       FROM incidents i
       LEFT JOIN incident_ai_outputs a ON a.incident_id = i.id
       WHERE i.id = $1 AND (i.assigned_agency_id = $2 OR i.assigned_agency_id IS NULL)`,
      [id, agencyId]
    )
    const incident = rows[0]
    if (!incident) return res.status(404).json({ error: 'Not found' })
    const history = await getHistory(incident.id)
    const ai =
      incident.category_pred || incident.summary
        ? {
            category: incident.category_pred,
            severity_score: incident.severity_score,
            severity_label: incident.severity_label,
            confidence: incident.confidence,
            summary: incident.summary,
            model_version: incident.model_version,
            lowConfidence: incident.confidence !== null && incident.confidence < MIN_CONFIDENCE,
            configured_model: process.env.AI_MODEL_NAME || 'stub-logreg',
          }
        : null
    return res.json({ incident, history, ai })
  } catch (err) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to fetch incident' })
  }
}

export async function verifyIncident(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { id } = req.params
  try {
    const { agencyId } = await getStaffAgency(req.user.id)
    const rows = await query<IncidentRecord>(
      `SELECT * FROM incidents WHERE id = $1 AND (assigned_agency_id = $2 OR assigned_agency_id IS NULL)`,
      [id, agencyId]
    )
    const incident = rows[0]
    if (!incident) return res.status(404).json({ error: 'Not found' })

    await query(
      `UPDATE incidents SET status = 'verified', assigned_agency_id = $1 WHERE id = $2`,
      [agencyId, incident.id]
    )
    await recordStatusChange(incident.id, incident.status, 'verified', req.user.id)
    emitEvent('incident:status', { id: incident.id, to: 'verified', agencyId })
    return res.json({ status: 'verified' })
  } catch (err) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to verify incident' })
  }
}

export async function assignIncident(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { id } = req.params
  try {
    const { agencyId } = await getStaffAgency(req.user.id)
    const rows = await query<IncidentRecord>(`SELECT * FROM incidents WHERE id = $1`, [id])
    const incident = rows[0]
    if (!incident) return res.status(404).json({ error: 'Not found' })

    await query(
      `UPDATE incidents SET assigned_agency_id = $1, status = 'assigned' WHERE id = $2`,
      [agencyId, incident.id]
    )
    await recordStatusChange(incident.id, incident.status, 'assigned', req.user.id)
    emitEvent('incident:status', { id: incident.id, to: 'assigned', agencyId })
    return res.json({ status: 'assigned' })
  } catch (err) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to assign incident' })
  }
}

export async function updateIncidentStatus(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { id } = req.params
  const { status } = req.body as { status?: string }
  if (!status) return res.status(400).json({ error: 'status is required' })
  const allowed = ['responding', 'resolved']
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' })
  try {
    const { agencyId } = await getStaffAgency(req.user.id)
    const rows = await query<IncidentRecord>(
      `SELECT * FROM incidents WHERE id = $1 AND assigned_agency_id = $2`,
      [id, agencyId]
    )
    const incident = rows[0]
    if (!incident) return res.status(404).json({ error: 'Not found' })

    await query(`UPDATE incidents SET status = $1 WHERE id = $2`, [status, incident.id])
    await recordStatusChange(incident.id, incident.status, status, req.user.id)
    emitEvent('incident:status', { id: incident.id, to: status })
    return res.json({ status })
  } catch (err) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to update status' })
  }
}

export async function createIncidentByAgency(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { description, category, lat, lng } = req.body as {
    description?: string
    category?: string
    lat?: number
    lng?: number
  }
  if (!description) return res.status(400).json({ error: 'description is required' })
  if (!isWithinGeoFence(lat, lng)) {
    return res.status(400).json({ error: 'Incident location outside allowed area' })
  }
  try {
    const { agencyId } = await getStaffAgency(req.user.id)
    const rows = await query<IncidentRecord>(
      `INSERT INTO incidents (reporter_id, description, category, status, assigned_agency_id, lat, lng, geom)
       VALUES ($1, $2, $3, 'submitted', $4, $5, $6, CASE WHEN $5 IS NOT NULL AND $6 IS NOT NULL THEN ST_SetSRID(ST_MakePoint($6, $5),4326) ELSE NULL END)
       RETURNING *`,
      [req.user.id, description, category ?? null, agencyId, lat ?? null, lng ?? null]
    )
    const incident = rows[0]
    await recordStatusChange(incident.id, null, 'submitted', req.user.id)

    // Optional AI classification; do not fail if unavailable
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
           model_version = EXCLUDED.model_version`,
        [incident.id, ai.category, ai.severity_score, ai.severity_label, ai.confidence, ai.summary, ai.model_version]
      )
    }

    emitEvent('incident:new', {
      id: incident.id,
      status: incident.status,
      category: incident.category,
      created_at: incident.created_at,
      agencyId,
    })

    res.status(201).json({ incident })
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to create incident' })
  }
}

export async function assignIncidentTo(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { id } = req.params
  const { agencyId } = req.body as { agencyId?: number }
  if (!agencyId) return res.status(400).json({ error: 'agencyId is required' })
  try {
    const agencyExists = await query<{ id: number }>('SELECT id FROM agencies WHERE id = $1', [agencyId])
    if (!agencyExists[0]) return res.status(404).json({ error: 'Target agency not found' })

    const rows = await query<IncidentRecord>(`SELECT * FROM incidents WHERE id = $1`, [id])
    const incident = rows[0]
    if (!incident) return res.status(404).json({ error: 'Not found' })

    await query(`UPDATE incidents SET assigned_agency_id = $1, status = 'assigned' WHERE id = $2`, [
      agencyId,
      incident.id,
    ])
    await recordStatusChange(incident.id, incident.status, 'assigned', req.user.id)
    emitEvent('incident:status', { id: incident.id, to: 'assigned', agencyId })
    res.json({ status: 'assigned', assigned_agency_id: agencyId })
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to assign incident' })
  }
}

export async function agencyStats(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const { agencyId } = await getStaffAgency(req.user.id)
    const agency = await query<{ id: number; name: string; type: string | null; city: string | null }>(
      `SELECT id, name, type, city FROM agencies WHERE id = $1`,
      [agencyId]
    )
    const counts = await query<{ status: string; count: string }>(
      `SELECT status, COUNT(*)::int as count
       FROM incidents
       WHERE assigned_agency_id = $1
       GROUP BY status`,
      [agencyId]
    )
    const total = counts.reduce((sum, c) => sum + Number(c.count), 0)
    res.json({
      agency: agency[0] ?? null,
      total,
      byStatus: counts.reduce<Record<string, number>>((acc, c) => {
        acc[c.status] = Number(c.count)
        return acc
      }, {}),
    })
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to load stats' })
  }
}

type AgencySuggestion = {
  id: number
  name: string
  type: string | null
  city: string | null
  distance_km: number | null
}

function mapCategoryToAgencyType(category?: string | null): string | null {
  if (!category) return null
  const c = category.toLowerCase()
  if (c.includes('fire') || c.includes('hazard')) return 'fire'
  if (c.includes('accident') || c.includes('crime') || c.includes('police')) return 'police'
  if (c.includes('medical') || c.includes('injur') || c.includes('ambulance')) return 'medical'
  return null
}

export async function listLowConfidence(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const limit = 50
  const rows = await query<
    IncidentRecord & {
      category_pred: string | null
      severity_score: number | null
      severity_label: number | null
      confidence: number | null
      summary: string | null
      model_version: string | null
    }
  >(
    `SELECT i.*, a.category_pred, a.severity_score, a.severity_label, a.confidence, a.summary, a.model_version
     FROM incidents i
     LEFT JOIN incident_ai_outputs a ON a.incident_id = i.id
     WHERE (a.confidence IS NULL OR a.confidence < $1)
     ORDER BY i.created_at DESC
     LIMIT $2`,
    [MIN_CONFIDENCE, limit]
  )
  res.json({ incidents: rows, threshold: MIN_CONFIDENCE })
}

export async function submitAiFeedback(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { id } = req.params
  const { category, severity_score, severity_label, confidence, summary, model_version } = req.body as {
    category?: string | null
    severity_score?: number | null
    severity_label?: number | null
    confidence?: number | null
    summary?: string | null
    model_version?: string | null
  }
  try {
    const incident = await query<IncidentRecord>('SELECT * FROM incidents WHERE id = $1', [id])
    if (!incident[0]) return res.status(404).json({ error: 'Not found' })

    await query(
      `INSERT INTO incident_ai_reclass (incident_id, model_version, category_pred, severity_score, severity_label, confidence)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [incident[0].id, model_version ?? 'human_feedback', category ?? null, severity_score ?? null, severity_label ?? null, confidence ?? null]
    )

    await query(
      `INSERT INTO incident_ai_outputs (incident_id, category_pred, severity_score, severity_label, confidence, summary, model_version)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (incident_id) DO UPDATE SET
         category_pred = EXCLUDED.category_pred,
         severity_score = EXCLUDED.severity_score,
         severity_label = EXCLUDED.severity_label,
         confidence = EXCLUDED.confidence,
         summary = EXCLUDED.summary,
         model_version = EXCLUDED.model_version`,
      [incident[0].id, category ?? null, severity_score ?? null, severity_label ?? null, confidence ?? null, summary ?? null, model_version ?? 'human_feedback']
    )

    if (category) {
      await query(`UPDATE incidents SET category = $1 WHERE id = $2`, [category, incident[0].id])
    }

    res.json({ status: 'ok' })
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to submit feedback' })
  }
}

export async function incidentRecommendations(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { id } = req.params
  try {
    const incidents = await query<{ id: number; category: string | null; geom: unknown; lat: number | null; lng: number | null }>(
      `SELECT id, category, geom, lat, lng FROM incidents WHERE id = $1`,
      [id]
    )
    const incident = incidents[0]
    if (!incident) return res.status(404).json({ error: 'Not found' })
    if (!incident.geom && (incident.lat === null || incident.lng === null)) {
      return res.status(400).json({ error: 'Incident missing location' })
    }

    const preferredType = mapCategoryToAgencyType(incident.category)
    const suggestions = await query<AgencySuggestion>(
      `
      SELECT a.id, a.name, a.type, a.city,
        CASE
          WHEN $2::geometry IS NOT NULL THEN round(CAST(ST_DistanceSphere(ST_Centroid(COALESCE(a.jurisdiction_geom, ST_SetSRID(ST_MakePoint(a.lng, a.lat),4326))), $2::geometry)/1000 AS numeric), 2)
          ELSE NULL
        END as distance_km
      FROM agencies a
      LEFT JOIN (
        SELECT ST_SetSRID(ST_MakePoint($3, $4), 4326) AS geom
      ) p ON true
      WHERE ($1::text IS NULL OR LOWER(a.type) = LOWER($1))
      ORDER BY
        CASE WHEN $1 IS NOT NULL AND LOWER(a.type) = LOWER($1) THEN 0 ELSE 1 END,
        distance_km NULLS LAST
      LIMIT 5
      `,
      [
        preferredType,
        incident.geom ?? null,
        incident.lng ?? null,
        incident.lat ?? null,
      ]
    )

    res.json({
      preferredType,
      suggestions,
    })
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to load recommendations' })
  }
}
