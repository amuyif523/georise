import { useEffect, useCallback, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/auth'

type Verification = {
  id: number
  user_id: number
  national_id: string
  phone: string | null
  status: string
  created_at: string
}

type HistoryItem = {
  id: number
  user_id: number
  national_id: string
  status: string
  created_at: string
  reviewed_by: number | null
}

export default function AdminVerifications() {
  const { token } = useAuth()
  const [items, setItems] = useState<Verification[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [selected, setSelected] = useState<number[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])

  const load = useCallback(async () => {
    if (!token) return
    try {
      const res = await api.get<{ verifications: Verification[] }>('/admin/verification/pending', token)
      setItems(res.verifications)
      const hist = await api.get<{ history: HistoryItem[] }>('/admin/verification/history', token)
      setHistory(hist.history)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load verifications')
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  const act = async (id: number, action: 'approve' | 'reject') => {
    if (!token) return
    setLoadingId(id)
    setError(null)
    try {
      await api.post(`/admin/verification/${id}`, { action }, token)
      await load()
      setSelected((prev) => prev.filter((pid) => pid !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setLoadingId(null)
    }
  }

  const bulkAct = async (action: 'approve' | 'reject') => {
    if (!token || selected.length === 0) return
    setError(null)
    setLoadingId(-1)
    try {
      await api.post(`/admin/verification/bulk`, { ids: selected, action }, token)
      setSelected([])
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk action failed')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-3">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">GEORISE</p>
        <h1 className="text-2xl font-bold">Pending Verifications</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className="bg-green-600 hover:bg-green-500 text-white font-semibold px-3 py-2 rounded disabled:opacity-50"
          disabled={selected.length === 0 || loadingId === -1}
          onClick={() => bulkAct('approve')}
        >
          Approve Selected ({selected.length})
        </button>
        <button
          className="bg-red-600 hover:bg-red-500 text-white font-semibold px-3 py-2 rounded disabled:opacity-50"
          disabled={selected.length === 0 || loadingId === -1}
          onClick={() => bulkAct('reject')}
        >
          Reject Selected ({selected.length})
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="space-y-3">
        {items.map((v) => (
          <div
            key={v.id}
            className="rounded border border-slate-800 bg-slate-800/60 p-4 flex justify-between items-center"
          >
            <div>
              <label className="inline-flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={selected.includes(v.id)}
                  onChange={(e) =>
                    setSelected((prev) =>
                      e.target.checked ? [...prev, v.id] : prev.filter((pid) => pid !== v.id)
                    )
                  }
                />
                Select
              </label>
              <p className="font-semibold">User #{v.user_id}</p>
              <p className="text-sm text-slate-300">National ID: {v.national_id}</p>
              <p className="text-sm text-slate-300">Phone: {v.phone || '-'}</p>
              <p className="text-xs text-slate-500">
                Requested: {new Date(v.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="bg-green-600 hover:bg-green-500 text-white font-semibold px-3 py-2 rounded disabled:opacity-50"
                disabled={loadingId === v.id}
                onClick={() => act(v.id, 'approve')}
              >
                Approve
              </button>
              <button
                className="bg-red-600 hover:bg-red-500 text-white font-semibold px-3 py-2 rounded disabled:opacity-50"
                disabled={loadingId === v.id}
                onClick={() => act(v.id, 'reject')}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && !error && (
          <p className="text-sm text-slate-400">No pending verifications.</p>
        )}
        {history.length > 0 && (
          <div className="rounded border border-slate-800 bg-slate-900/50 p-3 space-y-2">
            <p className="font-semibold">Recent Decisions</p>
            {history.map((h) => (
              <div key={h.id} className="text-sm text-slate-300 border-t border-slate-800 pt-2 first:border-t-0 first:pt-0">
                <p>
                  User #{h.user_id} ID {h.national_id} → {h.status}
                </p>
                <p className="text-xs text-slate-500">{new Date(h.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
