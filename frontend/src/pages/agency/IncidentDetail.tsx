import { useEffect, useState } from 'react'
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

export default function IncidentDetail() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!token || !id) return
    try {
      const res = await api.get<{ incident: Incident }>(`/agency/incidents/${id}`, token)
      setIncident(res.incident)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load incident')
    }
  }

  useEffect(() => {
    load()
  }, [token, id])

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
      <button
        className="text-slate-300 hover:text-white"
        onClick={() => navigate('/agency/incidents')}
      >
        ← Back to Incidents
      </button>
      <div className="rounded border border-slate-800 bg-slate-800/60 p-4 space-y-3">
        <p className="text-xs text-slate-500">{new Date(incident.created_at).toLocaleString()}</p>
        <h1 className="text-2xl font-bold">{incident.category || 'Uncategorized'}</h1>
        <span className="inline-block text-xs uppercase px-2 py-1 rounded bg-slate-700 text-slate-200">
          {incident.status}
        </span>
        <p className="text-slate-200 whitespace-pre-wrap">{incident.description}</p>
      </div>

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
    </div>
  )
}
