import { Request, Response } from 'express'
import { query } from '../../config/db'
import type { IncidentRecord } from './types'
import type { UserRecord } from '../auth/types'

async function ensureVerified(userId: number) {
  const users = await query<UserRecord>('SELECT * FROM users WHERE id = $1', [userId])
  const user = users[0]
  if (!user) throw new Error('User not found')
  if (user.verification_status !== 'verified') {
    const err: Error & { code?: string } = new Error('User not verified')
    err.code = 'NOT_VERIFIED'
    throw err
  }
}

export async function createIncident(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { description, category } = req.body as { description?: string; category?: string }
  if (!description) return res.status(400).json({ error: 'description is required' })

  try {
    await ensureVerified(req.user.id)
  } catch (err) {
    if (err instanceof Error && (err as any).code === 'NOT_VERIFIED') {
      return res.status(403).json({ error: 'Verification required' })
    }
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Cannot create incident' })
  }

  const rows = await query<IncidentRecord>(
    `INSERT INTO incidents (reporter_id, description, category, status)
     VALUES ($1, $2, $3, 'submitted')
     RETURNING *`,
    [req.user.id, description, category ?? null]
  )
  return res.status(201).json({ incident: rows[0] })
}

export async function listIncidents(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const rows = await query<IncidentRecord>(
    `SELECT * FROM incidents WHERE reporter_id = $1 ORDER BY created_at DESC`,
    [req.user.id]
  )
  return res.json({ incidents: rows })
}

export async function getIncident(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { id } = req.params
  const rows = await query<IncidentRecord>(
    `SELECT * FROM incidents WHERE id = $1 AND reporter_id = $2`,
    [id, req.user.id]
  )
  const incident = rows[0]
  if (!incident) return res.status(404).json({ error: 'Not found' })
  return res.json({ incident })
}
