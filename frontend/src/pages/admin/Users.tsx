import { useCallback, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/auth'

type User = {
  id: number
  fullName: string
  email: string | null
  phone: string | null
  role: string
  verificationStatus: string
  created_at: string
}

export default function AdminUsers() {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) return
    try {
      const res = await api.get<{ users: User[] }>('/admin/users', token)
      setUsers(res.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    }
  }, [token])

  useEffect(() => {
    const run = async () => {
      await load()
    }
    void run()
  }, [load])

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-3">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">GEORISE</p>
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="rounded border border-slate-800 bg-slate-800/60 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Role</th>
              <th className="px-3 py-2 text-left">Verification</th>
              <th className="px-3 py-2 text-left">Actions</th>
              <th className="px-3 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-800">
                <td className="px-3 py-2">{u.fullName}</td>
                <td className="px-3 py-2 text-slate-300">{u.email || '-'}</td>
                <td className="px-3 py-2 capitalize">{u.role}</td>
                <td className="px-3 py-2">{u.verificationStatus}</td>
                <td className="px-3 py-2 space-x-2">
                  <button
                    className="text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded"
                    onClick={async () => {
                      if (!token) return
                      await api.post(`/admin/users/${u.id}/status`, { verificationStatus: 'verified' }, token)
                      await load()
                    }}
                  >
                    Verify
                  </button>
                  <button
                    className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded"
                    onClick={async () => {
                      if (!token) return
                      await api.post(`/admin/users/${u.id}/status`, { verificationStatus: 'rejected' }, token)
                      await load()
                    }}
                  >
                    Reject
                  </button>
                </td>
                <td className="px-3 py-2 text-slate-400 text-xs">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-slate-400" colSpan={5}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
