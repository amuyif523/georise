import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './modules/auth/routes'
import { ensureSchema } from './db/init'
import citizenRoutes from './modules/citizen/routes'
import incidentRoutes from './modules/incidents/routes'
import agencyIncidentRoutes from './modules/incidents/agencyRoutes'
import adminRoutes from './modules/admin/routes'
import gisRoutes from './modules/gis/routes'
import rateLimit from 'express-rate-limit'

dotenv.config()

const app = express()
const port = process.env.PORT || 8000
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean)

app.use(
  cors({
    origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : '*',
  })
)
app.use(express.json())

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

ensureSchema()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.error('Failed to initialize database', err)
    process.exit(1)
  })
