import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/auth'
import Breadcrumbs from '../../components/Breadcrumbs'
import CommandPalette from '../../components/CommandPalette'
import NotificationPanel from '../../components/NotificationPanel'
import TopNav from '../../components/TopNav'
import BottomNav from '../../components/BottomNav'

export default function AdminDashboardPage() {
  const { token } = useAuth()
  const [summary, setSummary] = useState<{ users: number; agencies: number; incidents: number } | null>(null)
  const [history, setHistory] = useState<
    { id: number; incident_id: number; from_status: string | null; to_status: string; changed_at: string; category: string | null }[]
  >([])
  const [aiLog, setAiLog] = useState<
    {
      id: number
      incident_id: number
      model_version: string | null
      category_pred: string | null
      severity_score: number | null
      severity_label: number | null
      confidence: number | null
      created_at: string
    }[]
  >([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) return
      try {
        const [res, hist, ai] = await Promise.all([
          api.get<{ users: number; agencies: number; incidents: number }>('/admin/summary', token),
          api.get<{ history: typeof history }>('/admin/incidents/history', token),
          api.get<{ ai: typeof aiLog }>('/admin/incidents/ai-log', token),
        ])
        setSummary(res)
        setHistory(hist.history || [])
        setAiLog(ai.ai || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load summary')
      }
    }
    load()
  }, [token])

  return (
    <div className="min-h-screen bg-slate-900 text-white p-0">
      <TopNav />
      <CommandPalette />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Breadcrumbs />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-400">Manage users, agencies, and verifications.</p>
          </div>
          <NotificationPanel />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {summary && (
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard title="Users" value={summary.users} />
            <StatCard title="Agencies" value={summary.agencies} />
            <StatCard title="Incidents" value={summary.incidents} />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded border border-slate-800 bg-slate-800/60 p-4 space-y-2">
            <p className="font-semibold">Recent Status Changes</p>
            {history.length === 0 && <p className="text-sm text-slate-400">No history yet.</p>}
            {history.slice(0, 10).map((h) => (
              <div key={h.id} className="text-sm text-slate-200 border-t border-slate-800 pt-2 first:border-t-0 first:pt-0">
                <p>
                  Incident #{h.incident_id} ({h.category || 'uncategorized'}) {h.from_status ?? '—'} → {h.to_status}
                </p>
                <p className="text-xs text-slate-500">{new Date(h.changed_at).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="rounded border border-slate-800 bg-slate-800/60 p-4 space-y-2">
            <p className="font-semibold">Recent AI Reclass Log</p>
            {aiLog.length === 0 && <p className="text-sm text-slate-400">No AI entries yet.</p>}
            {aiLog.slice(0, 10).map((a) => (
              <div key={a.id} className="text-sm text-slate-200 border-t border-slate-800 pt-2 first:border-t-0 first:pt-0">
                <p>
                  Incident #{a.incident_id} → {a.category_pred || 'n/a'} (sev {a.severity_label ?? '-'} / conf {a.confidence ?? '-'})
                </p>
                <p className="text-xs text-slate-500">
                  Model {a.model_version || 'unknown'} @ {new Date(a.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded border border-slate-800 bg-slate-800/60 p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  )
}
