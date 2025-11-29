/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Router } from 'express'
import { requireAuth } from '../../middleware/auth'
import { requireRole } from '../../middleware/rbac'
import { query } from '../../config/db'
import type { Geometry } from 'geojson'

const router = Router()

router.get('/incidents', requireAuth, requireRole(['agency_staff', 'admin']), async (req, res) => {
  const bbox = (req.query.bbox as string | undefined)?.split(',').map(Number)
  const status = req.query.status as string | undefined
  const category = req.query.category as string | undefined
  const from = req.query.from as string | undefined
  const to = req.query.to as string | undefined
  const trendingHours = req.query.trendingHours ? Number(req.query.trendingHours) : undefined
  const polygon = req.query.polygon as string | undefined
  const lat = req.query.lat ? Number(req.query.lat) : undefined
  const lng = req.query.lng ? Number(req.query.lng) : undefined
  const withinKm = req.query.withinKm ? Number(req.query.withinKm) : undefined
  const page = Number(req.query.page ?? 1)
  const pageSize = Number(req.query.pageSize ?? 200)
  const limit = Math.min(Math.max(pageSize, 1), 300)
  const offset = (Math.max(page, 1) - 1) * limit

  const filters: string[] = ['geom IS NOT NULL']
  const params: unknown[] = []

  if (!bbox || bbox.length !== 4 || bbox.some((n) => Number.isNaN(n))) {
    return res.status(400).json({ error: 'bbox is required (minX,minY,maxX,maxY)' })
  }

  params.push(...bbox)
  filters.push(
    `ST_Intersects(geom, ST_MakeEnvelope($${params.length - 3}, $${params.length - 2}, $${params.length - 1}, $${params.length}, 4326))`
  )

  if (polygon) {
    try {
      params.push(polygon)
      filters.push(`ST_Intersects(geom, ST_GeomFromGeoJSON($${params.length}))`)
    } catch {
      return res.status(400).json({ error: 'Invalid polygon GeoJSON' })
    }
  }

  if (lat !== undefined && lng !== undefined && withinKm !== undefined && !Number.isNaN(lat) && !Number.isNaN(lng) && !Number.isNaN(withinKm)) {
    params.push(lng, lat, withinKm * 1000)
    filters.push(`ST_DWithin(geom, ST_SetSRID(ST_MakePoint($${params.length - 2}, $${params.length - 1}), 4326), $${params.length})`)
  }

  if (trendingHours && !Number.isNaN(trendingHours)) {
    params.push(trendingHours)
    filters.push(`created_at >= NOW() - ($${params.length} || ' hours')::interval`)
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
      const geometry = JSON.parse(r.geojson as string) as unknown as Geometry
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

router.get('/incidents/nearby', requireAuth, requireRole(['agency_staff', 'admin']), async (req, res) => {
  const lat = Number(req.query.lat)
  const lng = Number(req.query.lng)
  const radiusKm = req.query.radiusKm ? Number(req.query.radiusKm) : 2
  if ([lat, lng].some((n) => Number.isNaN(n))) return res.status(400).json({ error: 'lat and lng required' })
  const radiusMeters = Math.min(Math.max(radiusKm, 0.1), 50) * 1000

  const rows = await query<{
    id: number
    status: string
    category: string | null
    created_at: Date
    geojson: string | null
  }>(
    `SELECT id, status, category, created_at, ST_AsGeoJSON(geom) as geojson
     FROM incidents
     WHERE geom IS NOT NULL
     AND ST_DWithin(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326), $3)
     ORDER BY created_at DESC
     LIMIT 300`,
    [lng, lat, radiusMeters]
  )

  const features = rows
    .filter((r) => r.geojson)
    .map((r) => {
      const geometry = JSON.parse(r.geojson as string) as unknown as Geometry
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

  res.json({ type: 'FeatureCollection', features })
})

router.get('/overlays', requireAuth, requireRole(['agency_staff', 'admin']), async (req, res) => {
  const typesParam = (req.query.types as string | undefined)?.split(',').filter(Boolean)
  const filters: string[] = []
  const params: unknown[] = []
  if (typesParam && typesParam.length) {
    filters.push(`type = ANY($1::text[])`)
    params.push(typesParam)
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

  const rows = await query<{ id: number; name: string; type: string; subtype: string | null; metadata: unknown; geojson: string }>(
    `SELECT id, name, type, subtype, metadata, ST_AsGeoJSON(geom) as geojson
     FROM overlays
     ${where}
     LIMIT 500`,
    params
  )

  const features = rows.map((r) => ({
    type: 'Feature' as const,
    geometry: JSON.parse(r.geojson) as unknown as Geometry,
    properties: {
      id: r.id,
      name: r.name,
      type: r.type,
      subtype: r.subtype,
      metadata: r.metadata,
    },
  }))

  res.json({ type: 'FeatureCollection', features })
})

export default router
