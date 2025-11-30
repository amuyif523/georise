import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth'

type Command = { label: string; action: () => void; role?: string }

export default function CommandPalette() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const commands: Command[] = useMemo(() => {
    if (!user) return []
    const base: Command[] = [
      { label: 'Logout', action: () => { logout(); navigate('/login') } },
    ]
    if (user.role === 'agency_staff') {
      base.push(
        { label: 'Agency Dashboard', action: () => navigate('/agency/dashboard') },
        { label: 'Agency Incidents', action: () => navigate('/agency/incidents') },
        { label: 'AI Review', action: () => navigate('/agency/ai-review') },
        { label: 'Report Incident', action: () => navigate('/agency/report') },
      )
    }
    if (user.role === 'admin') {
      base.push(
        { label: 'Admin Dashboard', action: () => navigate('/admin/dashboard') },
        { label: 'Users', action: () => navigate('/admin/users') },
        { label: 'Agencies', action: () => navigate('/admin/agencies') },
        { label: 'Verification', action: () => navigate('/admin/verification') },
      )
    }
    if (user.role === 'citizen') {
      base.push(
        { label: 'Citizen Dashboard', action: () => navigate('/citizen/dashboard') },
        { label: 'Report Incident', action: () => navigate('/citizen/report') },
        { label: 'My Reports', action: () => navigate('/citizen/incidents') },
      )
    }
    return base
  }, [user, navigate, logout])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
        <div className="p-3 border-b border-slate-700">
          <input
            autoFocus
            className="w-full bg-slate-800 text-white px-3 py-2 rounded"
            placeholder="Type to search… (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="text-sm text-slate-400 px-3 py-2">No commands</p>
          )}
          {filtered.map((c) => (
            <button
              key={c.label}
              className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
              onClick={() => {
                c.action()
                setOpen(false)
                setQuery('')
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
