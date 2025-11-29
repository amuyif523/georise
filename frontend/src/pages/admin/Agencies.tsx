import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/auth'

type Agency = {
  id: number
  name: string
  type: string | null
  city: string | null
}

export default function AdminAgencies() {
  const { token } = useAuth()
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Agency | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!token) return
      try {
        const res = await api.get<{ agencies: Agency[] }>('/admin/agencies', token)
        setAgencies(res.agencies)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agencies')
      }
    }
    load()
  }, [token])

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-3">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">GEORISE</p>
        <h1 className="text-2xl font-bold">Agencies</h1>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="rounded border border-slate-800 bg-slate-800/60 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">City</th>
            </tr>
          </thead>
          <tbody>
            {agencies.map((a) => (
              <tr key={a.id} className="border-t border-slate-800">
                <td className="px-3 py-2">{a.name}</td>
                <td className="px-3 py-2 capitalize">{a.type || '-'}</td>
                <td className="px-3 py-2">{a.city || '-'}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={() => setEditing(a)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {agencies.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-slate-400" colSpan={3}>
                  No agencies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="rounded border border-slate-800 bg-slate-800/80 p-4 space-y-3">
          <h4 className="font-semibold">Edit Agency</h4>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <label className="space-y-1">
              <span className="text-slate-300">Name</span>
              <input
                className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white w-full"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </label>
            <label className="space-y-1">
              <span className="text-slate-300">Type</span>
              <input
                className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white w-full"
                value={editing.type || ''}
                onChange={(e) => setEditing({ ...editing, type: e.target.value })}
              />
            </label>
            <label className="space-y-1">
              <span className="text-slate-300">City</span>
              <input
                className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white w-full"
                value={editing.city || ''}
                onChange={(e) => setEditing({ ...editing, city: e.target.value })}
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded text-sm"
              onClick={async () => {
                if (!token || !editing) return
                await api.post(`/admin/agencies/${editing.id}`, {
                  name: editing.name,
                  type: editing.type,
                  city: editing.city,
                }, token)
                setEditing(null)
                const res = await api.get<{ agencies: Agency[] }>('/admin/agencies', token)
                setAgencies(res.agencies)
              }}
            >
              Save
            </button>
            <button
              className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded text-sm"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
