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
