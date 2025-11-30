import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/auth'

type ReviewIncident = {
  id: number
  description: string
  category: string | null
  status: string
  created_at: string
  category_pred: string | null
  severity_score: number | null
  severity_label: number | null
  confidence: number | null
  summary: string | null
  model_version: string | null
}

export default function AiReview() {
  const { token } = useAuth()
  const [incidents, setIncidents] = useState<ReviewIncident[]>([])
  const [threshold, setThreshold] = useState<number>(0.5)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) return
      try {
        const res = await api.get<{ incidents: ReviewIncident[]; threshold: number }>('/agency/ai-review', token)
        setIncidents(res.incidents)
        setThreshold(res.threshold)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load AI review queue')
      }
    }
    load()
  }, [token])

  const submitFeedback = async (id: number, payload: Partial<ReviewIncident>) => {
    if (!token) return
    setSubmitting(id)
    setError(null)
    try {
      await api.post(`/agency/incidents/${id}/ai-feedback`, {
        category: payload.category_pred,
        severity_label: payload.severity_label,
        severity_score: payload.severity_score,
        confidence: payload.confidence,
        summary: payload.summary,
        model_version: payload.model_version ?? 'human_feedback',
      }, token)
      const res = await api.get<{ incidents: ReviewIncident[]; threshold: number }>('/agency/ai-review', token)
      setIncidents(res.incidents)
      setThreshold(res.threshold)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback')
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-400">AI Review Queue</p>
        <h1 className="text-2xl font-bold">Low-confidence incidents</h1>
        <p className="text-slate-400 text-sm">Threshold: {threshold}</p>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="space-y-3">
        {incidents.length === 0 && <p className="text-sm text-slate-400">No low-confidence incidents right now.</p>}
        {incidents.map((inc) => (
          <div key={inc.id} className="rounded border border-slate-800 bg-slate-800/60 p-4 space-y-2">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{inc.category || 'Uncategorized'}</p>
                <p className="text-xs text-slate-400">{new Date(inc.created_at).toLocaleString()}</p>
              </div>
              <span className="text-xs uppercase px-2 py-1 rounded bg-slate-700 text-slate-200">{inc.status}</span>
            </div>
            <p className="text-sm text-slate-200">{inc.description}</p>
            <div className="text-xs text-slate-300">
              <p>AI: {inc.category_pred ?? 'n/a'} · Severity: {inc.severity_label ?? 'n/a'} ({inc.severity_score ?? 'n/a'})</p>
              <p>Confidence: {inc.confidence ?? 'n/a'} · Model: {inc.model_version ?? 'n/a'}</p>
              {inc.summary && <p>Why: {inc.summary}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-xs text-slate-300">
                Human category
                <input
                  className="mt-1 w-full bg-slate-900 border border-slate-700 rounded px-2 py-1"
                  defaultValue={inc.category_pred ?? ''}
                  onBlur={(e) => (inc.category_pred = e.target.value || null)}
                />
              </label>
              <label className="block text-xs text-slate-300">
                Human severity (0-5)
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  className="mt-1 w-full bg-slate-900 border border-slate-700 rounded px-2 py-1"
                  defaultValue={inc.severity_score ?? ''}
                  onBlur={(e) => {
                    const v = e.target.value ? Number(e.target.value) : null
                    inc.severity_score = Number.isNaN(v as number) ? null : v
                  }}
                />
              </label>
              <label className="block text-xs text-slate-300">
                Notes / explanation
                <textarea
                  className="mt-1 w-full bg-slate-900 border border-slate-700 rounded px-2 py-1"
                  defaultValue={inc.summary ?? ''}
                  onBlur={(e) => (inc.summary = e.target.value || null)}
                />
              </label>
              <button
                className="text-sm bg-amber-500 text-slate-900 font-semibold px-3 py-2 rounded disabled:opacity-50"
                disabled={submitting === inc.id}
                onClick={() => submitFeedback(inc.id, inc)}
              >
                {submitting === inc.id ? 'Saving...' : 'Save feedback'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
