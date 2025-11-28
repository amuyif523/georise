import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import { query } from '../../config/db'

const router = Router()

router.get('/incidents', requireAuth, requireRole(['agency_staff', 'admin']), async (_req, res) => {
  const rows = await query<{
    id: number
    status: string
    category: string | null
    created_at: Date
    geojson: string | null
  }>(
    `SELECT id, status, category, created_at, ST_AsGeoJSON(geom) as geojson
     FROM incidents
     WHERE geom IS NOT NULL`
  )

  const features = rows
    .filter((r) => r.geojson)
    .map((r) => {
      const geometry = JSON.parse(r.geojson as string) as unknown
      return {
        type: 'Feature' as const,
        geometry,
        properties: {
          id: r.id,
          status: r.status,
          category: r.category,
          created_at: r.created_at,
        },
      }
    })

  res.json({
    type: 'FeatureCollection',
    features,
  })
})

export default router
