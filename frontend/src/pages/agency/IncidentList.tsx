import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../context/auth'

type Incident = {
  id: number
  description: string
  category: string | null
  status: string
  created_at: string
}

export default function IncidentList() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIncidents = async () => {
      if (!token) return
      try {
        const res = await api.get<{ incidents: Incident[] }>('/agency/incidents', token)
        setIncidents(res.incidents)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load incidents')
      }
    }
    fetchIncidents()
  }, [token])

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">GEORISE</p>
        <h1 className="text-2xl font-bold">Agency Incidents</h1>
      </div>
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      <div className="space-y-3">
        {incidents.map((incident) => (
          <button
            key={incident.id}
            onClick={() => navigate(`/agency/incidents/${incident.id}`)}
            className="w-full text-left rounded border border-slate-800 bg-slate-800/60 p-4 hover:border-blue-500 transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{incident.category || 'Uncategorized'}</p>
                <p className="text-sm text-slate-300 line-clamp-2">{incident.description}</p>
              </div>
              <span className="text-xs uppercase px-2 py-1 rounded bg-slate-700 text-slate-200">
                {incident.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {new Date(incident.created_at).toLocaleString()}
            </p>
          </button>
        ))}
        {incidents.length === 0 && !error && (
          <p className="text-sm text-slate-400">No incidents assigned to your agency yet.</p>
        )}
      </div>
    </div>
  )
}
