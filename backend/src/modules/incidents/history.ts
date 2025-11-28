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
