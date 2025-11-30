import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import {
  listAgencyIncidents,
  getAgencyIncident,
  verifyIncident,
  assignIncident,
  updateIncidentStatus,
  agencyStats,
  incidentRecommendations,
  createIncidentByAgency,
  assignIncidentTo,
  listLowConfidence,
  submitAiFeedback,
} from './agency'

const router = Router()
const guard = [requireAuth, requireRole(['agency_staff', 'admin'])] as const

router.get('/incidents', ...guard, listAgencyIncidents)
router.get('/incidents/:id', ...guard, getAgencyIncident)
router.get('/incidents/:id/recommendations', ...guard, incidentRecommendations)
router.patch('/incidents/:id/verify', ...guard, verifyIncident)
router.patch('/incidents/:id/assign', ...guard, assignIncident)
router.patch('/incidents/:id/assign-to', ...guard, assignIncidentTo)
router.patch('/incidents/:id/status', ...guard, updateIncidentStatus)
router.get('/stats', ...guard, agencyStats)
router.post('/incidents', ...guard, createIncidentByAgency)
router.get('/ai-review', ...guard, listLowConfidence)
router.post('/incidents/:id/ai-feedback', ...guard, submitAiFeedback)

export default router
