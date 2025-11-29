import { useEffect, useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../context/auth'

type Incident = {
  id: number
  description: string
  category: string | null
  status: string
  created_at: string
}

type HistoryItem = {
  id: number
  from_status: string | null
  to_status: string
  changed_by: number | null
  notes: string | null
  changed_at: string
}

type Recommendation = {
  id: number
  name: string
  type: string | null
  city: string | null
  distance_km: number | null
}

export default function IncidentDetail() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [preferredType, setPreferredType] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token || !id) return
    try {
      const res = await api.get<{ incident: Incident; history: HistoryItem[] }>(`/agency/incidents/${id}`, token)
      setIncident(res.incident)
      setHistory(res.history || [])

      const rec = await api.get<{ preferredType: string | null; suggestions: Recommendation[] }>(
        `/agency/incidents/${id}/recommendations`,
        token
      )
      setPreferredType(rec.preferredType)
      setRecommendations(rec.suggestions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load incident')
    }
  }, [token, id])

  useEffect(() => {
    void load()
  }, [load])

  const act = async (path: string, body?: unknown) => {
    if (!token || !id) return
    setLoading(true)
    setError(null)
    try {
      await api.post(`/agency/incidents/${id}${path}`, body ?? {}, token)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-red-400">{error}</p>
          <button
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded"
            onClick={() => navigate('/agency/incidents')}
          >
            Back to Incidents
          </button>
        </div>
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-4">
      <button className="text-slate-300 hover:text-white" onClick={() => navigate('/agency/incidents')}>
        {'<-'} Back to Incidents
      </button>
      <div className="rounded border border-slate-800 bg-slate-800/60 p-4 space-y-3">
        <p className="text-xs text-slate-500">{new Date(incident.created_at).toLocaleString()}</p>
        <h1 className="text-2xl font-bold">{incident.category || 'Uncategorized'}</h1>
        <span className="inline-block text-xs uppercase px-2 py-1 rounded bg-slate-700 text-slate-200">
          {incident.status}
        </span>
        <p className="text-slate-200 whitespace-pre-wrap">{incident.description}</p>
      </div>

      {history.length > 0 && (
        <div className="rounded border border-slate-800 bg-slate-900/50 p-3 space-y-2">
          <p className="font-semibold text-slate-200">Status History</p>
          {history.map((h) => (
            <div key={h.id} className="text-sm text-slate-300 border-t border-slate-800 pt-2 first:border-t-0 first:pt-0">
              <p>
              <p>{`${h.from_status ?? "-"} -> ${h.to_status}`}</p>
              </p>
              <p className="text-xs text-slate-500">{new Date(h.changed_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded border border-slate-800 bg-slate-800/60 p-4 space-y-2">
        <h3 className="font-semibold">Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className="bg-green-600 hover:bg-green-500 text-white font-semibold px-3 py-2 rounded disabled:opacity-50"
            disabled={loading}
            onClick={() => act('/verify')}
          >
            Verify
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-2 rounded disabled:opacity-50"
            disabled={loading}
            onClick={() => act('/assign')}
          >
            Assign to my agency
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold px-3 py-2 rounded disabled:opacity-50"
            disabled={loading}
            onClick={() => act('/status', { status: 'responding' })}
          >
            Mark Responding
          </button>
          <button
            className="bg-slate-200 hover:bg-white text-slate-900 font-semibold px-3 py-2 rounded disabled:opacity-50"
            disabled={loading}
            onClick={() => act('/status', { status: 'resolved' })}
          >
            Mark Resolved
          </button>
        </div>
      </div>

      <div className="rounded border border-slate-800 bg-slate-900/50 p-4 space-y-2">
        <h3 className="font-semibold">Assignment Suggestions</h3>
        <p className="text-xs text-slate-400">
          Preferred type: {preferredType ?? 'none'} (based on incident category). Showing nearest agencies.
        </p>
        {recommendations.length === 0 && <p className="text-sm text-slate-300">No suggestions available.</p>}
        {recommendations.map((rec) => (
          <div key={rec.id} className="border border-slate-800 rounded p-3 flex justify-between items-center">
            <div>
              <p className="font-semibold">{rec.name}</p>
              <p className="text-xs text-slate-400">
                Type: {rec.type || 'n/a'} · City: {rec.city || 'n/a'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Distance: {rec.distance_km ?? 'n/a'} km</p>
              <button
                className="mt-2 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-2 py-1 rounded disabled:opacity-50"
                disabled={loading}
                onClick={() => act('/assign-to', { agencyId: rec.id })}
              >
                Assign here
              </button>
              <button
                className="mt-2 ml-2 text-xs border border-amber-400/60 text-amber-200 px-2 py-1 rounded hover:border-amber-300 disabled:opacity-50"
                disabled={loading}
                onClick={() => act('/assign-to', { agencyId: rec.id })}
              >
                Escalate to this agency
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
