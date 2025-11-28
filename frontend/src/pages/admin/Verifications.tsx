import { useEffect, useState } from 'react'
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

export default function AdminVerifications() {
  const { token } = useAuth()
  const [items, setItems] = useState<Verification[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const load = async () => {
    if (!token) return
    try {
      const res = await api.get<{ verifications: Verification[] }>('/admin/verification/pending', token)
      setItems(res.verifications)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load verifications')
    }
  }

  useEffect(() => {
    load()
  }, [token])

  const act = async (id: number, action: 'approve' | 'reject') => {
    if (!token) return
    setLoadingId(id)
    setError(null)
    try {
      await api.post(`/admin/verification/${id}`, { action }, token)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
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
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="space-y-3">
        {items.map((v) => (
          <div
            key={v.id}
            className="rounded border border-slate-800 bg-slate-800/60 p-4 flex justify-between items-center"
          >
            <div>
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
      </div>
    </div>
  )
}
