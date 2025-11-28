import { Router } from 'express'
import { loginHandler, registerHandler } from './controller'

const router = Router()

router.post('/register', registerHandler)
router.post('/login', loginHandler)

export default router
