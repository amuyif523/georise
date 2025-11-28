import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './modules/auth/routes'
import { ensureSchema } from './db/init'
import citizenRoutes from './modules/citizen/routes'
import incidentRoutes from './modules/incidents/routes'
import agencyIncidentRoutes from './modules/incidents/agencyRoutes'
import adminRoutes from './modules/admin/routes'

dotenv.config()

const app = express()
const port = process.env.PORT || 8000

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'georise-backend' })
})

app.use('/auth', authRoutes)
app.use('/citizen', citizenRoutes)
app.use('/citizen', incidentRoutes)
app.use('/agency', agencyIncidentRoutes)
app.use('/admin', adminRoutes)

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
