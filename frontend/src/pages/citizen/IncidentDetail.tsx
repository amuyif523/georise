import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../context/auth'

type Incident = {
  id: number
  description: string
  category: string | null
  status: string
  created_at: string
}

type AIInfo = {
  category: string
  severity_score: number
  severity_label: number
  confidence: number
  summary: string
  model_version: string
  lowConfidence?: boolean
} | null

type HistoryItem = {
  id: number
  from_status: string | null
  to_status: string
  changed_by: number | null
  notes: string | null
  changed_at: string
}

export default function IncidentDetail() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [ai, setAi] = useState<AIInfo>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIncident = async () => {
      if (!token || !id) return
      try {
        const res = await api.get<{ incident: Incident; ai: AIInfo; history: HistoryItem[] }>(
          `/citizen/incidents/${id}`,
          token
        )
        setIncident(res.incident)
        setAi(res.ai)
        setHistory(res.history || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load incident')
      }
    }
    fetchIncident()
  }, [token, id])

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-red-400">{error}</p>
          <button
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded"
            onClick={() => navigate('/citizen/incidents')}
          >
            Back to My Reports
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
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <button
        className="text-slate-300 hover:text-white mb-4"
        onClick={() => navigate('/citizen/incidents')}
      >
        ← Back to My Reports
      </button>
      <div className="rounded border border-slate-800 bg-slate-800/60 p-4 space-y-3">
        <p className="text-xs text-slate-500">{new Date(incident.created_at).toLocaleString()}</p>
        <h1 className="text-2xl font-bold">{incident.category || 'Uncategorized'}</h1>
        <span className="inline-block text-xs uppercase px-2 py-1 rounded bg-slate-700 text-slate-200">
          {incident.status}
        </span>
        <p className="text-slate-200 whitespace-pre-wrap">{incident.description}</p>

        {ai && (
          <div className="rounded border border-blue-500/40 bg-blue-500/10 p-3 space-y-1">
            <p className="text-sm font-semibold text-blue-200">
              AI Classification: {ai.category} (Severity {ai.severity_label})
            </p>
            <p className="text-xs text-slate-200">
              Confidence: {ai.confidence} {ai.lowConfidence ? '(low)' : ''}
            </p>
            <p className="text-xs text-slate-300">Summary: {ai.summary}</p>
          </div>
        )}

        {history.length > 0 && (
          <div className="rounded border border-slate-800 bg-slate-900/50 p-3 space-y-2">
            <p className="font-semibold text-slate-200">Status History</p>
            {history.map((h) => (
              <div key={h.id} className="text-sm text-slate-300 border-t border-slate-800 pt-2 first:border-t-0 first:pt-0">
                <p>
                  {h.from_status ?? '—'} → {h.to_status}
                </p>
                <p className="text-xs text-slate-500">{new Date(h.changed_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
