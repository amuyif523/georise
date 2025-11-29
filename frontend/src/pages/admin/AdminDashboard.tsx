import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/auth'

export default function AdminDashboardPage() {
  const { token } = useAuth()
  const [summary, setSummary] = useState<{ users: number; agencies: number; incidents: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) return
      try {
        const res = await api.get<{ users: number; agencies: number; incidents: number }>('/admin/summary', token)
        setSummary(res)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load summary')
      }
    }
    load()
  }, [token])

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">GEORISE</p>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-400">Manage users, agencies, and verifications.</p>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {summary && (
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard title="Users" value={summary.users} />
          <StatCard title="Agencies" value={summary.agencies} />
          <StatCard title="Incidents" value={summary.incidents} />
        </div>
      )}
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
