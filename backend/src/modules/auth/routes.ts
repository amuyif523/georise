import { Router } from 'express'
import { loginHandler, meHandler, registerHandler } from './controller'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'

const router = Router()

router.post('/register', registerHandler)
router.post('/login', loginHandler)
router.get('/me', requireAuth, meHandler)
router.get('/admin/ping', requireAuth, requireRole(['admin']), (_req, res) => {
  res.json({ message: 'pong', scope: 'admin' })
})

export default router
