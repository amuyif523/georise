import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { enqueueNotification, listNotifications, markAllRead } from './service'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const rows = await listNotifications(req.user!.id)
    res.json({ notifications: rows })
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to load notifications' })
  }
})

router.post('/read-all', requireAuth, async (req, res) => {
  try {
    await markAllRead(req.user!.id)
    res.json({ status: 'ok' })
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to mark read' })
  }
})

// Simple enqueue for testing/demo
router.post('/demo', requireAuth, async (req, res) => {
  const { title, body } = req.body as { title?: string; body?: string }
  if (!title || !body) return res.status(400).json({ error: 'title and body are required' })
  try {
    await enqueueNotification(req.user!.id, title, body)
    res.json({ status: 'queued' })
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to enqueue' })
  }
})

export default router
