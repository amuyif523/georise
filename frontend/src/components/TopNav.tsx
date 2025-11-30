import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth'

type NavItem = { label: string; to: string; roles: string[] }

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/agency/dashboard', roles: ['agency_staff'] },
  { label: 'Incidents', to: '/agency/incidents', roles: ['agency_staff'] },
  { label: 'AI Review', to: '/agency/ai-review', roles: ['agency_staff'] },
  { label: 'Report', to: '/agency/report', roles: ['agency_staff'] },
  { label: 'Dashboard', to: '/admin/dashboard', roles: ['admin'] },
  { label: 'Users', to: '/admin/users', roles: ['admin'] },
  { label: 'Agencies', to: '/admin/agencies', roles: ['admin'] },
  { label: 'Verification', to: '/admin/verification', roles: ['admin'] },
]

export default function TopNav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const toggleTheme = () => {
    const root = document.documentElement
    const current = root.getAttribute('data-theme')
    root.setAttribute('data-theme', current === 'light' ? 'dark' : 'light')
  }
  if (!user) return null
  const items = NAV_ITEMS.filter((i) => i.roles.includes(user.role))
  return (
    <div className="w-full flex items-center justify-between bg-slate-900/80 border-b border-slate-800 px-4 py-3">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400">GEORISE</p>
        <p className="text-sm text-slate-200">{user.role === 'admin' ? 'Admin' : 'Agency'} Workspace</p>
      </div>
      <div className="flex items-center gap-4 text-sm">
        {items.map((item) => (
          <Link key={item.to} to={item.to} className="text-slate-300 hover:text-cyan-300">
            {item.label}
          </Link>
        ))}
        <button
          className="text-slate-200 px-2 py-1 rounded border border-slate-700 hover:border-cyan-400 hover:text-cyan-200 transition"
          onClick={toggleTheme}
        >
          Theme
        </button>
        <button
          className="text-slate-200 px-3 py-1 rounded border border-slate-700 hover:border-red-400 hover:text-red-200 transition"
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}
