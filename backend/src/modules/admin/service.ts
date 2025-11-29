import { Request, Response } from 'express'
import { query } from '../../config/db'
import type { UserRecord } from '../auth/types'

export async function listUsers(_req: Request, res: Response) {
  const rows = await query<UserRecord & { role_name: string }>(
    `SELECT u.*, r.name as role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     ORDER BY u.created_at DESC`
  )
  return res.json({
    users: rows.map((u) => ({
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      phone: u.phone,
      role: u.role_name,
      verificationStatus: u.verification_status,
      created_at: u.created_at,
    })),
  })
}

export async function updateUserStatus(req: Request, res: Response) {
  const { id } = req.params
  const { verificationStatus } = req.body as { verificationStatus?: string }
  if (!verificationStatus) return res.status(400).json({ error: 'verificationStatus is required' })
  await query(`UPDATE users SET verification_status = $1 WHERE id = $2`, [verificationStatus, id])
  return res.json({ status: verificationStatus })
}

export async function listAgencies(_req: Request, res: Response) {
  const rows = await query<{ id: number; name: string; type: string | null; city: string | null }>(
    `SELECT id, name, type, city FROM agencies ORDER BY created_at DESC`
  )
  return res.json({ agencies: rows })
}

export async function updateAgency(req: Request, res: Response) {
  const { id } = req.params
  const { name, type, city } = req.body as { name?: string; type?: string; city?: string }
  await query(
    `UPDATE agencies SET
       name = COALESCE($1, name),
       type = COALESCE($2, type),
       city = COALESCE($3, city)
     WHERE id = $4`,
    [name ?? null, type ?? null, city ?? null, id]
  )
  return res.json({ ok: true })
}

export async function listPendingVerifications(_req: Request, res: Response) {
  const rows = await query<{
    id: number
    user_id: number
    national_id: string
    phone: string | null
    status: string
    created_at: Date
  }>(
    `SELECT id, user_id, national_id, phone, status, created_at
     FROM citizen_verifications
     WHERE status = 'pending'
     ORDER BY created_at ASC`
  )
  return res.json({ verifications: rows })
}

export async function reviewVerification(req: Request, res: Response) {
  const { id } = req.params
  const { action } = req.body as { action?: 'approve' | 'reject' }
  if (!action) return res.status(400).json({ error: 'action is required' })

  const rows = await query<{ user_id: number }>(
    `SELECT user_id FROM citizen_verifications WHERE id = $1`,
    [id]
  )
  const verification = rows[0]
  if (!verification) return res.status(404).json({ error: 'Verification not found' })

  const newStatus = action === 'approve' ? 'verified' : 'rejected'
  await query(`UPDATE citizen_verifications SET status = $1, reviewed_by = $2 WHERE id = $3`, [
    newStatus,
    req.user?.id ?? null,
    id,
  ])
  await query(`UPDATE users SET verification_status = $1 WHERE id = $2`, [newStatus, verification.user_id])

  return res.json({ status: newStatus })
}

export async function reviewVerificationBulk(req: Request, res: Response) {
  const { ids, action } = req.body as { ids?: number[]; action?: 'approve' | 'reject' }
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids array is required' })
  }
  if (!action) return res.status(400).json({ error: 'action is required' })

  const verifications = await query<{ id: number; user_id: number }>(
    `SELECT id, user_id FROM citizen_verifications WHERE id = ANY($1::int[])`,
    [ids]
  )
  if (!verifications.length) return res.status(404).json({ error: 'No verifications found' })

  const newStatus = action === 'approve' ? 'verified' : 'rejected'

  for (const v of verifications) {
    await query(
      `UPDATE citizen_verifications SET status = $1, reviewed_by = $2 WHERE id = $3`,
      [newStatus, req.user?.id ?? null, v.id]
    )
    await query(`UPDATE users SET verification_status = $1 WHERE id = $2`, [newStatus, v.user_id])
  }

  return res.json({ status: newStatus, count: verifications.length })
}

export async function verificationHistory(_req: Request, res: Response) {
  const rows = await query<{
    id: number
    user_id: number
    national_id: string
    status: string
    created_at: Date
    reviewed_by: number | null
  }>(
    `SELECT id, user_id, national_id, status, created_at, reviewed_by
     FROM citizen_verifications
     WHERE status != 'pending'
     ORDER BY created_at DESC`
  )
  return res.json({ history: rows })
}

export async function adminSummary(_req: Request, res: Response) {
  const [usersCount] = await query<{ count: string }>('SELECT COUNT(*)::int as count FROM users')
  const [agenciesCount] = await query<{ count: string }>('SELECT COUNT(*)::int as count FROM agencies')
  const [incidentsCount] = await query<{ count: string }>('SELECT COUNT(*)::int as count FROM incidents')
  return res.json({
    users: Number(usersCount?.count ?? 0),
    agencies: Number(agenciesCount?.count ?? 0),
    incidents: Number(incidentsCount?.count ?? 0),
  })
}

export async function recentStatusChanges(_req: Request, res: Response) {
  const rows = await query<{
    id: number
    incident_id: number
    from_status: string | null
    to_status: string
    changed_at: Date
    category: string | null
  }>(
    `SELECT h.id, h.incident_id, h.from_status, h.to_status, h.changed_at, i.category
     FROM incident_status_history h
     JOIN incidents i ON i.id = h.incident_id
     ORDER BY h.changed_at DESC
     LIMIT 25`
  )
  return res.json({ history: rows })
}

export async function recentAiReclass(_req: Request, res: Response) {
  const rows = await query<{
    id: number
    incident_id: number
    model_version: string | null
    category_pred: string | null
    severity_score: number | null
    severity_label: number | null
    confidence: number | null
    created_at: Date
  }>(
    `SELECT id, incident_id, model_version, category_pred, severity_score, severity_label, confidence, created_at
     FROM incident_ai_reclass
     ORDER BY created_at DESC
     LIMIT 25`
  )
  return res.json({ ai: rows })
}
