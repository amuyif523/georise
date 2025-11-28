export type IncidentRecord = {
  id: number
  reporter_id: number
  description: string
  category: string | null
  status: string
  created_at: Date
}
