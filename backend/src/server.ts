import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './modules/auth/routes'
import { ensureSchema } from './db/init'
import citizenRoutes from './modules/citizen/routes'
import incidentRoutes from './modules/incidents/routes'
import agencyIncidentRoutes from './modules/incidents/agencyRoutes'
import adminRoutes from './modules/admin/routes'
import gisRoutes from './modules/gis/routes'
import notificationRoutes from './modules/notifications/routes'
import { startNotificationWorker } from './modules/notifications/service'
import rateLimit from 'express-rate-limit'
import { requestLogger, withCorrelationId } from './middleware/logger'

const app = express()
const port = process.env.PORT || 8000
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean)
const jsonLimit = process.env.BODY_LIMIT || '1mb'
const isProd = process.env.NODE_ENV === 'production'
if (isProd && (!allowedOrigins || allowedOrigins.length === 0)) {
  throw new Error('ALLOWED_ORIGINS is required in production')
}

app.use(
  cors({
    origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : '*',
    credentials: true,
  })
)
app.use(withCorrelationId)
app.use(requestLogger)
app.use(express.json({ limit: jsonLimit }))
app.use(express.urlencoded({ limit: jsonLimit, extended: true }))

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 20,
})

const verifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
})

const incidentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 15,
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'georise-backend' })
})

app.use('/auth', authLimiter, authRoutes)
app.use('/citizen', verifyLimiter, citizenRoutes)
app.use('/citizen', incidentLimiter, incidentRoutes)
app.use('/agency', agencyIncidentRoutes)
app.use('/admin', adminRoutes)
app.use('/gis', gisRoutes)
app.use('/notifications', notificationRoutes)

ensureSchema()
  .then(() => {
    startNotificationWorker()
    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.error('Failed to initialize database', err)
    process.exit(1)
  })
