import { query } from '../../config/db'

const NOTIF_BATCH = Number(process.env.NOTIF_BATCH_SIZE || 20)
const NOTIF_INTERVAL = Number(process.env.NOTIF_WORKER_INTERVAL_MS || 5000)
const NOTIF_MAX_ATTEMPTS = Number(process.env.NOTIF_MAX_ATTEMPTS || 3)

export async function enqueueNotification(userId: number, title: string, body: string) {
  await query(
    `INSERT INTO notifications (user_id, title, body, status, attempts, max_attempts)
     VALUES ($1, $2, $3, 'pending', 0, $4)`,
    [userId, title, body, NOTIF_MAX_ATTEMPTS]
  )
}

export async function listNotifications(userId: number) {
  return query<{
    id: number
    title: string
    body: string
    status: string
    read: boolean
    created_at: Date
  }>(
    `SELECT id, title, body, status, read, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 100`,
    [userId]
  )
}

export async function markAllRead(userId: number) {
  await query(`UPDATE notifications SET read = true WHERE user_id = $1`, [userId])
}

export async function processPendingBatch() {
  const pending = await query<{
    id: number
    user_id: number
    title: string
    body: string
    attempts: number
    max_attempts: number
  }>(
    `SELECT id, user_id, title, body, attempts, max_attempts
     FROM notifications
     WHERE status = 'pending' AND attempts < max_attempts
     ORDER BY created_at ASC
     LIMIT $1`,
    [NOTIF_BATCH]
  )

  for (const n of pending) {
    try {
      // Simulate send success; in real life integrate email/SMS/push provider
      await query(`UPDATE notifications SET status = 'sent', attempts = attempts + 1, updated_at = NOW() WHERE id = $1`, [
        n.id,
      ])
    } catch (err) {
      const attempts = n.attempts + 1
      const isDead = attempts >= n.max_attempts
      await query(
        `UPDATE notifications
         SET attempts = $1, status = $2, error = $3, updated_at = NOW()
         WHERE id = $4`,
        [attempts, isDead ? 'dead' : 'pending', err instanceof Error ? err.message : 'send failed', n.id]
      )
    }
  }
}

export function startNotificationWorker() {
  setInterval(() => {
    void processPendingBatch()
  }, NOTIF_INTERVAL)
}
