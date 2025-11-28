import { query } from '../../config/db'

export async function recordStatusChange(
  incidentId: number,
  fromStatus: string | null,
  toStatus: string,
  changedBy: number | null,
  notes?: string
) {
  await query(
    `INSERT INTO incident_status_history (incident_id, from_status, to_status, changed_by, notes)
     VALUES ($1, $2, $3, $4, $5)`,
    [incidentId, fromStatus, toStatus, changedBy, notes ?? null]
  )
}

export async function getHistory(incidentId: number) {
  return query<{
    id: number
    from_status: string | null
    to_status: string
    changed_by: number | null
    notes: string | null
    changed_at: Date
  }>(
    `SELECT id, from_status, to_status, changed_by, notes, changed_at
     FROM incident_status_history
     WHERE incident_id = $1
     ORDER BY changed_at ASC`,
    [incidentId]
  )
}
