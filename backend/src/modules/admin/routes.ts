import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import {
  listUsers,
  updateUserStatus,
  listAgencies,
  updateAgency,
  listPendingVerifications,
  reviewVerification,
  reviewVerificationBulk,
  verificationHistory,
  adminSummary,
  recentStatusChanges,
  recentAiReclass,
} from './service'

const router = Router()
const guard = [requireAuth, requireRole(['admin'])] as const

router.get('/users', ...guard, listUsers)
router.patch('/users/:id/status', ...guard, updateUserStatus)

router.get('/agencies', ...guard, listAgencies)
router.patch('/agencies/:id', ...guard, updateAgency)

router.get('/verification/pending', ...guard, listPendingVerifications)
router.patch('/verification/:id', ...guard, reviewVerification)
router.post('/verification/bulk', ...guard, reviewVerificationBulk)
router.get('/verification/history', ...guard, verificationHistory)
router.get('/summary', ...guard, adminSummary)
router.get('/incidents/history', ...guard, recentStatusChanges)
router.get('/incidents/ai-log', ...guard, recentAiReclass)

export default router
