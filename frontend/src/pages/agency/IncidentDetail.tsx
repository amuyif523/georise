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

type AiInfo = {
  category: string | null
  severity_score: number | null
  severity_label: string | null
  confidence: number | null
  summary: string | null
  model_version: string | null
  lowConfidence?: boolean
  configured_model?: string | null
}

type IncidentResponse = {
  incident: Incident
  history: HistoryItem[]
  ai: AiInfo | null
  recommendedAgencyType: string | null
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
  const [ai, setAi] = useState<AiInfo | null>(null)
  const [feedback, setFeedback] = useState({
    category: '',
    severity_label: '',
    severity_score: '',
    confidence: '',
    summary: '',
  })

  const load = useCallback(async () => {
    if (!token || !id) return
    try {
      const res = await api.get<IncidentResponse>(`/agency/incidents/${id}`, token)
      setIncident(res.incident)
      setHistory(res.history || [])
      setAi(res.ai || null)
      setPreferredType(res.recommendedAgencyType || null)

      const rec = await api.get<{ preferredType: string | null; suggestions: Recommendation[] }>(
        `/agency/incidents/${id}/recommendations`,
        token
      )
      setPreferredType(rec.preferredType ?? res.recommendedAgencyType ?? null)
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

  const submitFeedback = async () => {
    if (!token || !id) return
    setLoading(true)
    setError(null)
    try {
      await api.post(
        `/agency/incidents/${id}/ai-feedback`,
        {
          category: feedback.category || null,
          severity_label: feedback.severity_label || null,
          severity_score: feedback.severity_score ? Number(feedback.severity_score) : null,
          confidence: feedback.confidence ? Number(feedback.confidence) : null,
          summary: feedback.summary || null,
          model_version: 'human_feedback',
        },
        token
      )
      await load()
      setFeedback({ category: '', severity_label: '', severity_score: '', confidence: '', summary: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback')
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

      {ai && (
        <div className="rounded border border-amber-500/40 bg-amber-500/10 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-amber-200">AI Classification</p>
            {ai.lowConfidence && (
              <span className="text-[10px] uppercase bg-amber-500 text-slate-900 px-2 py-0.5 rounded">
                Low confidence
              </span>
            )}
          </div>
          <p className="text-sm text-amber-100">
            Category: {ai.category ?? 'n/a'} | Severity: {ai.severity_label ?? 'n/a'} ({ai.severity_score ?? 'n/a'})
          </p>
          <p className="text-xs text-amber-200">
            Confidence: {ai.confidence ?? 'n/a'} | Model: {ai.model_version ?? 'n/a'} | Configured: {ai.configured_model ?? 'n/a'}
          </p>
          {ai.summary && <p className="text-xs text-slate-200">Why: {ai.summary}</p>}
          {preferredType && <p className="text-xs text-amber-100">Suggested agency type: {preferredType}</p>}
        </div>
      )}

      {history.length > 0 && (
        <div className="rounded border border-slate-800 bg-slate-900/50 p-3 space-y-2">
          <p className="font-semibold text-slate-200">Status History</p>
          {history.map((h) => (
            <div
              key={h.id}
              className="text-sm text-slate-300 border-t border-slate-800 pt-2 first:border-t-0 first:pt-0"
            >
              <p>{`${h.from_status ?? '-'} -> ${h.to_status}`}</p>
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
          Preferred type: {preferredType ?? 'none'} (based on AI/category). Showing nearest agencies.
        </p>
        {recommendations.length === 0 && <p className="text-sm text-slate-300">No suggestions available.</p>}
        {recommendations.map((rec) => (
          <div key={rec.id} className="border border-slate-800 rounded p-3 flex justify-between items-center">
            <div>
              <p className="font-semibold">{rec.name}</p>
              <p className="text-xs text-slate-400">
                Type: {rec.type || 'n/a'} | City: {rec.city || 'n/a'}
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

      <div className="rounded border border-amber-500/40 bg-amber-500/5 p-4 space-y-3">
        <h3 className="font-semibold text-amber-200">Human Feedback</h3>
        <p className="text-xs text-amber-100">
          Adjust category/severity or confidence when AI is wrong or low confidence. This records in the AI review log.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-900">
          <label className="text-xs text-slate-200 flex flex-col gap-1">
            Category
            <input
              className="rounded px-2 py-1 bg-white/90 text-slate-900"
              value={feedback.category}
              onChange={(e) => setFeedback({ ...feedback, category: e.target.value })}
              placeholder="e.g., fire, accident, medical"
            />
          </label>
          <label className="text-xs text-slate-200 flex flex-col gap-1">
            Severity label
            <input
              className="rounded px-2 py-1 bg-white/90 text-slate-900"
              value={feedback.severity_label}
              onChange={(e) => setFeedback({ ...feedback, severity_label: e.target.value })}
              placeholder="low/med/high"
            />
          </label>
          <label className="text-xs text-slate-200 flex flex-col gap-1">
            Severity score
            <input
              className="rounded px-2 py-1 bg-white/90 text-slate-900"
              value={feedback.severity_score}
              onChange={(e) => setFeedback({ ...feedback, severity_score: e.target.value })}
              placeholder="0-1"
            />
          </label>
          <label className="text-xs text-slate-200 flex flex-col gap-1">
            Confidence
            <input
              className="rounded px-2 py-1 bg-white/90 text-slate-900"
              value={feedback.confidence}
              onChange={(e) => setFeedback({ ...feedback, confidence: e.target.value })}
              placeholder="0-1"
            />
          </label>
        </div>
        <label className="text-xs text-slate-200 flex flex-col gap-1">
          Why / notes
          <textarea
            className="rounded px-2 py-1 bg-white/90 text-slate-900"
            value={feedback.summary}
            onChange={(e) => setFeedback({ ...feedback, summary: e.target.value })}
            placeholder="Add short rationale"
          />
        </label>
        <button
          className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-3 py-2 rounded disabled:opacity-50"
          disabled={loading}
          onClick={submitFeedback}
        >
          Submit feedback
        </button>
      </div>
    </div>
  )
}
