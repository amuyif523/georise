import { Request, Response } from 'express'
import { query } from '../../config/db'
import type { IncidentRecord } from './types'
import { recordStatusChange } from './history'
import { getHistory } from './history'

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

    const rows = await query<IncidentRecord>(
      `SELECT * FROM incidents WHERE assigned_agency_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [agencyId, limit, offset]
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
    const rows = await query<IncidentRecord>(
      `SELECT * FROM incidents WHERE id = $1 AND (assigned_agency_id = $2 OR assigned_agency_id IS NULL)`,
      [id, agencyId]
    )
    const incident = rows[0]
    if (!incident) return res.status(404).json({ error: 'Not found' })
    const history = await getHistory(incident.id)
    return res.json({ incident, history })
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
    return res.json({ status })
  } catch (err) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to update status' })
  }
}
