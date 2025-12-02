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
  const [flags, setFlags] = useState<{ key: string; enabled: boolean; description: string | null }[]>([])
  const [announcements, setAnnouncements] = useState<{ id: number; message: string; level: string; is_active: boolean; created_at: string }[]>([])
  const [approvals, setApprovals] = useState<
    { id: number; action: string; status: string; payload: unknown; requested_by: number | null; approved_by: number | null; created_at: string }[]
  >([])
  const [audit, setAudit] = useState<
    { id: number; actor_id: number | null; action: string; entity_type: string | null; entity_id: number | null; created_at: string }[]
  >([])
  const [newAnnouncement, setNewAnnouncement] = useState<{ message: string; level: string }>({ message: '', level: 'info' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) return
      try {
        const [res, hist, ai, flagsRes, annRes, approvalsRes, auditRes] = await Promise.all([
          api.get<{ users: number; agencies: number; incidents: number }>('/admin/summary', token),
          api.get<{ history: typeof history }>('/admin/incidents/history', token),
          api.get<{ ai: typeof aiLog }>('/admin/incidents/ai-log', token),
          api.get<{ flags: typeof flags }>('/admin/flags', token),
          api.get<{ announcements: typeof announcements }>('/admin/announcements', token),
          api.get<{ approvals: typeof approvals }>('/admin/approvals', token),
          api.get<{ audit: typeof audit }>('/admin/audit', token),
        ])
        setSummary(res)
        setHistory(hist.history || [])
        setAiLog(ai.ai || [])
        setFlags(flagsRes.flags || [])
        setAnnouncements(annRes.announcements || [])
        setApprovals(approvalsRes.approvals || [])
        setAudit(auditRes.audit || [])
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

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded border border-slate-800 bg-slate-800/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Feature Flags</p>
              <span className="text-xs text-slate-400">Toggle runtime features</span>
            </div>
            {flags.length === 0 && <p className="text-sm text-slate-400">No flags yet.</p>}
            {flags.map((f) => (
              <div key={f.key} className="flex items-center justify-between border-t border-slate-800 pt-2 first:border-t-0 first:pt-0">
                <div>
                  <p className="font-semibold">{f.key}</p>
                  <p className="text-xs text-slate-400">{f.description || 'No description'}</p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-cyan-400"
                    checked={f.enabled}
                    onChange={async (e) => {
                      try {
                        const res = await api.post<{ flag: typeof flags[number] }>('/admin/flags', { key: f.key, enabled: e.target.checked }, token ?? undefined)
                        setFlags((prev) => prev.map((ff) => (ff.key === f.key ? res.flag : ff)))
                      } catch {
                        // ignore UI error for brevity
                      }
                    }}
                  />
                  <span>{f.enabled ? 'On' : 'Off'}</span>
                </label>
              </div>
            ))}
          </div>

          <div className="rounded border border-slate-800 bg-slate-800/60 p-4 space-y-3">
            <p className="font-semibold">Announcements</p>
            <div className="space-y-2">
              <input
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
                placeholder="Announcement message"
                value={newAnnouncement.message}
                onChange={(e) => setNewAnnouncement((p) => ({ ...p, message: e.target.value }))}
              />
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
                value={newAnnouncement.level}
                onChange={(e) => setNewAnnouncement((p) => ({ ...p, level: e.target.value }))}
              >
                <option value="info">Info</option>
                <option value="warn">Warn</option>
                <option value="alert">Alert</option>
              </select>
              <button
                className="px-3 py-2 rounded bg-cyan-600 text-white text-sm"
                onClick={async () => {
                  if (!newAnnouncement.message.trim()) return
                  const res = await api.post<{ announcement: typeof announcements[number] }>(
                    '/admin/announcements',
                    { message: newAnnouncement.message, level: newAnnouncement.level },
                    token ?? undefined
                  )
                  setAnnouncements((prev) => [res.announcement, ...prev])
                  setNewAnnouncement({ message: '', level: 'info' })
                }}
              >
                Post
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {announcements.map((a) => (
                <div key={a.id} className="border border-slate-700 rounded p-2 text-sm">
                  <p className="font-semibold capitalize">{a.level}</p>
                  <p>{a.message}</p>
                  <p className="text-xs text-slate-500">{new Date(a.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded border border-slate-800 bg-slate-800/60 p-4 space-y-3">
            <p className="font-semibold">Two-Person Approvals</p>
            {approvals.length === 0 && <p className="text-sm text-slate-400">No approvals pending.</p>}
            {approvals.map((a) => (
              <div key={a.id} className="border border-slate-700 rounded p-3 text-sm space-y-1">
                <p className="font-semibold">{a.action}</p>
                <p className="text-xs text-slate-500">Status: {a.status}</p>
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 rounded bg-emerald-600 text-white"
                    onClick={async () => {
                      const res = await api.post<{ approval: typeof approvals[number] }>(
                        `/admin/approvals/${a.id}/decision`,
                        { decision: 'approved' },
                        token ?? undefined
                      )
                      setApprovals((prev) => prev.map((x) => (x.id === a.id ? res.approval : x)))
                    }}
                    disabled={a.status !== 'pending'}
                  >
                    Approve
                  </button>
                  <button
                    className="px-2 py-1 rounded bg-red-600 text-white"
                    onClick={async () => {
                      const res = await api.post<{ approval: typeof approvals[number] }>(
                        `/admin/approvals/${a.id}/decision`,
                        { decision: 'rejected' },
                        token ?? undefined
                      )
                      setApprovals((prev) => prev.map((x) => (x.id === a.id ? res.approval : x)))
                    }}
                    disabled={a.status !== 'pending'}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded border border-slate-800 bg-slate-800/60 p-4 space-y-3">
            <p className="font-semibold">Audit Trail</p>
            <div className="space-y-2 max-h-64 overflow-y-auto text-sm">
              {audit.length === 0 && <p className="text-slate-400">No audit records.</p>}
              {audit.map((a) => (
                <div key={a.id} className="border border-slate-700 rounded p-2">
                  <p className="font-semibold">{a.action}</p>
                  <p className="text-xs text-slate-500">
                    Actor: {a.actor_id ?? 'n/a'} • {a.entity_type || 'entity'} #{a.entity_id ?? '-'}
                  </p>
                  <p className="text-xs text-slate-500">{new Date(a.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
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
