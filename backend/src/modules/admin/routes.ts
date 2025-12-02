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
  listFlags,
  upsertFlag,
  listAnnouncements,
  upsertAnnouncement,
  listApprovals,
  requestApproval,
  approveApproval,
  auditTrail,
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
router.get('/flags', ...guard, listFlags)
router.post('/flags', ...guard, upsertFlag)
router.get('/announcements', ...guard, listAnnouncements)
router.post('/announcements', ...guard, upsertAnnouncement)
router.get('/approvals', ...guard, listApprovals)
router.post('/approvals', ...guard, requestApproval)
router.post('/approvals/:id/decision', ...guard, approveApproval)
router.get('/audit', ...guard, auditTrail)

export default router
