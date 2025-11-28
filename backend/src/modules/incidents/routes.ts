import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import { createIncident, getIncident, listIncidents } from './citizen'

const router = Router()

router.post('/incidents', requireAuth, requireRole(['citizen']), createIncident)
router.get('/incidents', requireAuth, requireRole(['citizen']), listIncidents)
router.get('/incidents/:id', requireAuth, requireRole(['citizen']), getIncident)

export default router
