import { Request, Response } from 'express'
import { query } from '../../config/db'
import { emitEvent } from '../../utils/realtime'
const MODEL_NAME = process.env.AI_MODEL_NAME || 'stub-logreg'
const MODEL_CHOICES = ['stub-logreg', 'minilm-logreg', MODEL_NAME]
import type { UserRecord } from '../auth/types'

type FlagRow = { key: string; enabled: boolean; description: string | null; meta: unknown; updated_at: Date }
type AnnouncementRow = { id: number; message: string; level: string; is_active: boolean; created_at: Date; updated_at: Date }
type ApprovalRow = {
  id: number
  action: string
  status: string
  payload: unknown
  requested_by: number | null
  approved_by: number | null
  created_at: Date
  updated_at: Date
}

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

// Feature flags
export async function listFlags(_req: Request, res: Response) {
  const rows = await query<FlagRow>(`SELECT * FROM feature_flags ORDER BY key`)
  return res.json({ flags: rows })
}

export async function upsertFlag(req: Request, res: Response) {
  const { key, enabled, description, meta } = req.body as Partial<FlagRow>
  if (!key) return res.status(400).json({ error: 'key is required' })
  const rows = await query<FlagRow>(
    `INSERT INTO feature_flags (key, enabled, description, meta)
     VALUES ($1, COALESCE($2, false), $3, COALESCE($4, '{}'::jsonb))
     ON CONFLICT (key) DO UPDATE SET
       enabled = COALESCE(EXCLUDED.enabled, feature_flags.enabled),
       description = COALESCE(EXCLUDED.description, feature_flags.description),
       meta = COALESCE(EXCLUDED.meta, feature_flags.meta),
       updated_at = NOW()
     RETURNING *`,
    [key, enabled ?? null, description ?? null, meta ?? null]
  )
  return res.json({ flag: rows[0] })
}

// Announcements
export async function listAnnouncements(_req: Request, res: Response) {
  const rows = await query<AnnouncementRow>(`SELECT * FROM announcements WHERE is_active = true ORDER BY created_at DESC`)
  return res.json({ announcements: rows })
}

export async function upsertAnnouncement(req: Request, res: Response) {
  const { id, message, level, is_active } = req.body as Partial<AnnouncementRow>
  if (!message && !id) return res.status(400).json({ error: 'message is required when creating' })

  if (id) {
    const rows = await query<AnnouncementRow>(
      `UPDATE announcements SET
         message = COALESCE($1, message),
         level = COALESCE($2, level),
         is_active = COALESCE($3, is_active),
         updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [message ?? null, level ?? null, is_active ?? null, id]
    )
    await logAdminAction(req.user?.id ?? null, 'update_announcement', 'announcements', id, { message, level, is_active })
    return res.json({ announcement: rows[0] })
  }

  const rows = await query<AnnouncementRow>(
    `INSERT INTO announcements (message, level, is_active)
     VALUES ($1, COALESCE($2, 'info'), COALESCE($3, true))
     RETURNING *`,
    [message, level ?? 'info', is_active ?? true]
  )
  await logAdminAction(req.user?.id ?? null, 'create_announcement', 'announcements', rows[0].id, { message, level, is_active })
  return res.json({ announcement: rows[0] })
}

// Two-person approval
export async function listApprovals(_req: Request, res: Response) {
  const rows = await query<ApprovalRow>(
    `SELECT * FROM admin_action_approvals
     ORDER BY created_at DESC
     LIMIT 50`
  )
  return res.json({ approvals: rows })
}

export async function requestApproval(req: Request, res: Response) {
  const { action, payload } = req.body as { action?: string; payload?: unknown }
  if (!action) return res.status(400).json({ error: 'action is required' })
  const rows = await query<ApprovalRow>(
    `INSERT INTO admin_action_approvals (action, payload, requested_by, status)
     VALUES ($1, COALESCE($2, '{}'::jsonb), $3, 'pending')
     ON CONFLICT (action, status) WHERE status = 'pending'
     DO UPDATE SET payload = EXCLUDED.payload, requested_by = EXCLUDED.requested_by, updated_at = NOW()
     RETURNING *`,
    [action, payload ?? {}, req.user?.id ?? null]
  )
  await logAdminAction(req.user?.id ?? null, 'request_approval', 'admin_action_approvals', rows[0].id, payload ?? {})
  emitEvent('approval:pending', rows[0])
  return res.json({ approval: rows[0] })
}

export async function approveApproval(req: Request, res: Response) {
  const { id } = req.params
  const { decision } = req.body as { decision?: 'approved' | 'rejected' }
  if (!decision) return res.status(400).json({ error: 'decision is required' })
  const rows = await query<ApprovalRow>(
    `UPDATE admin_action_approvals
     SET status = $1, approved_by = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [decision, req.user?.id ?? null, id]
  )
  if (!rows.length) return res.status(404).json({ error: 'not found' })
  await logAdminAction(req.user?.id ?? null, decision === 'approved' ? 'approve_action' : 'reject_action', 'admin_action_approvals', rows[0].id, rows[0])
  emitEvent('approval:decision', rows[0])
  return res.json({ approval: rows[0] })
}

// Audit trail explorer
export async function auditTrail(_req: Request, res: Response) {
  const rows = await query<{
    id: number
    actor_id: number | null
    action: string
    entity_type: string | null
    entity_id: number | null
    payload: unknown
    created_at: Date
  }>(`SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT 100`)
  return res.json({ audit: rows })
}

export async function logAdminAction(
  actorId: number | null,
  action: string,
  entityType: string | null,
  entityId: number | null,
  payload: unknown
) {
  await query(
    `INSERT INTO admin_audit_log (actor_id, action, entity_type, entity_id, payload)
     VALUES ($1, $2, $3, $4, COALESCE($5, '{}'::jsonb))`,
    [actorId, action, entityType, entityId, payload ?? {}]
  )
}

export async function listAiModels(_req: Request, res: Response) {
  res.json({
    current: MODEL_NAME,
    choices: Array.from(new Set(MODEL_CHOICES)),
  })
}
