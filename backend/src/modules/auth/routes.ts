import { Router } from 'express'
import { loginHandler, meHandler, registerHandler } from './controller'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import { rotateToken, revokeTokenJti, verifyToken } from './service'

const router = Router()

router.post('/register', registerHandler)
router.post('/login', loginHandler)
router.post('/logout', requireAuth, (req, res) => {
  const header = req.headers.authorization
  const token = header?.slice(7) || ''
  try {
    const { jti } = verifyToken(token)
    revokeTokenJti(jti)
  } catch {
    // ignore
  }
  res.json({ status: 'logged_out' })
})
router.post('/refresh', (req, res) => {
  const header = req.headers.authorization
  if (!header || !header.toLowerCase().startsWith('bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  const token = header.slice(7)
  const rotated = rotateToken(token)
  if (!rotated) return res.status(401).json({ error: 'Invalid token' })
  res.json(rotated)
})
router.post('/forgot', (_req, res) => {
  res.json({ status: 'ok', message: 'If this user exists, a reset link was sent (stub).' })
})
router.post('/reset', (_req, res) => {
  res.json({ status: 'ok', message: 'Password reset stub; wire real token flow for production.' })
})
router.get('/me', requireAuth, meHandler)
router.get('/admin/ping', requireAuth, requireRole(['admin']), (_req, res) => {
  res.json({ message: 'pong', scope: 'admin' })
})

export default router
