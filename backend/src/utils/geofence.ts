export function isWithinGeoFence(lat?: number | null, lng?: number | null): boolean {
  const bbox = process.env.GEO_BBOX?.split(',').map(Number)
  if (!bbox || bbox.length !== 4 || bbox.some((n) => Number.isNaN(n))) return true
  if (lat === undefined || lng === undefined || lat === null || lng === null) return true
  const [minX, minY, maxX, maxY] = bbox
  return lng >= minX && lng <= maxX && lat >= minY && lat <= maxY
}
