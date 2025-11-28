import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import { citizenRegisterHandler, startVerificationHandler, confirmVerificationHandler } from './verification'

const router = Router()

// Wrapper around auth register to force citizen role
router.post('/register', citizenRegisterHandler)

router.post(
  '/verification/start',
  requireAuth,
  requireRole(['citizen']),
  startVerificationHandler
)

router.post(
  '/verification/confirm',
  requireAuth,
  requireRole(['citizen']),
  confirmVerificationHandler
)

export default router
