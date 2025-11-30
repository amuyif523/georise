import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth'

type Item = { to: string; label: string }

export default function BottomNav() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  if (!user) return null

  let items: Item[] = []
  if (user.role === 'citizen') {
    items = [
      { to: '/citizen/dashboard', label: 'Home' },
      { to: '/citizen/report', label: 'Report' },
      { to: '/citizen/incidents', label: 'My Reports' },
    ]
  } else if (user.role === 'agency_staff') {
    items = [
      { to: '/agency/dashboard', label: 'Home' },
      { to: '/agency/incidents', label: 'Queue' },
      { to: '/agency/ai-review', label: 'AI Review' },
      { to: '/agency/report', label: 'Report' },
    ]
  } else if (user.role === 'admin') {
    items = [
      { to: '/admin/dashboard', label: 'Home' },
      { to: '/admin/users', label: 'Users' },
      { to: '/admin/agencies', label: 'Agencies' },
      { to: '/admin/verification', label: 'Verify' },
    ]
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 text-slate-200 flex justify-around py-2 md:hidden z-40">
      {items.map((item) => {
        const active = pathname.startsWith(item.to)
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center text-xs ${active ? 'text-cyan-300 font-semibold' : 'text-slate-300'}`}
          >
            <span>{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
