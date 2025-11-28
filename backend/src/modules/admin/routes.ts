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
} from './service'

const router = Router()
const guard = [requireAuth, requireRole(['admin'])] as const

router.get('/users', ...guard, listUsers)
router.patch('/users/:id/status', ...guard, updateUserStatus)

router.get('/agencies', ...guard, listAgencies)
router.patch('/agencies/:id', ...guard, updateAgency)

router.get('/verification/pending', ...guard, listPendingVerifications)
router.patch('/verification/:id', ...guard, reviewVerification)

export default router
