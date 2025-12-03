export function mapCategoryToAgencyType(category?: string | null): string | null {
  if (!category) return null
  const c = category.toLowerCase()
  if (c.includes('fire') || c.includes('hazard')) return 'fire'
  if (c.includes('accident') || c.includes('crime') || c.includes('police')) return 'police'
  if (c.includes('medical') || c.includes('injur') || c.includes('ambulance') || c.includes('health')) return 'medical'
  return null
}
