import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import { query } from '../../config/db'

const router = Router()

router.get('/incidents', requireAuth, requireRole(['agency_staff', 'admin']), async (req, res) => {
  const bbox = (req.query.bbox as string | undefined)?.split(',').map(Number)
  const status = req.query.status as string | undefined
  const category = req.query.category as string | undefined
  const from = req.query.from as string | undefined
  const to = req.query.to as string | undefined
  const page = Number(req.query.page ?? 1)
  const pageSize = Number(req.query.pageSize ?? 200)
  const limit = Math.min(Math.max(pageSize, 1), 500)
  const offset = (Math.max(page, 1) - 1) * limit

  const filters: string[] = ['geom IS NOT NULL']
  const params: unknown[] = []

  if (bbox && bbox.length === 4 && bbox.every((n) => !Number.isNaN(n))) {
    params.push(...bbox)
    filters.push(
      `ST_Intersects(geom, ST_MakeEnvelope($${params.length - 3}, $${params.length - 2}, $${params.length - 1}, $${params.length}, 4326))`
    )
  }
  if (status) {
    params.push(status)
    filters.push(`status = $${params.length}`)
  }
  if (category) {
    params.push(category)
    filters.push(`category = $${params.length}`)
  }
  if (from) {
    params.push(from)
    filters.push(`created_at >= $${params.length}`)
  }
  if (to) {
    params.push(to)
    filters.push(`created_at <= $${params.length}`)
  }

  if (req.user?.role === 'agency_staff') {
    const hasGeom = await query<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT 1 FROM agencies a
        JOIN agency_staff s ON s.agency_id = a.id
        WHERE s.user_id = $1 AND a.jurisdiction_geom IS NOT NULL
      ) as exists`,
      [req.user.id]
    )
    if (hasGeom[0]?.exists) {
      filters.push(
        `ST_Intersects(geom, (
          SELECT jurisdiction_geom
          FROM agencies a
          JOIN agency_staff s ON s.agency_id = a.id
          WHERE s.user_id = $${params.length + 1}
          LIMIT 1
        ))`
      )
      params.push(req.user.id)
    }
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

  const rows = await query<{
    id: number
    status: string
    category: string | null
    created_at: Date
    geojson: string | null
  }>(
    `SELECT id, status, category, created_at, ST_AsGeoJSON(geom) as geojson
     FROM incidents
     ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
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
