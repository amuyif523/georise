import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import {
  listAgencyIncidents,
  getAgencyIncident,
  verifyIncident,
  assignIncident,
  updateIncidentStatus,
} from './agency'

const router = Router()
const guard = [requireAuth, requireRole(['agency_staff', 'admin'])] as const

router.get('/incidents', ...guard, listAgencyIncidents)
router.get('/incidents/:id', ...guard, getAgencyIncident)
router.patch('/incidents/:id/verify', ...guard, verifyIncident)
router.patch('/incidents/:id/assign', ...guard, assignIncident)
router.patch('/incidents/:id/status', ...guard, updateIncidentStatus)

export default router
