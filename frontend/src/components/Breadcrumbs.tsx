import { Link, useLocation } from 'react-router-dom'

const LABELS: Record<string, string> = {
  citizen: 'Citizen',
  agency: 'Agency',
  admin: 'Admin',
  dashboard: 'Dashboard',
  incidents: 'Incidents',
  'ai-review': 'AI Review',
  report: 'Report',
  users: 'Users',
  agencies: 'Agencies',
  verification: 'Verification',
}

export default function Breadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  if (!segments.length) return null

  const items = segments.map((seg, idx) => {
    const path = '/' + segments.slice(0, idx + 1).join('/')
    return { label: LABELS[seg] || seg.replace(/-/g, ' '), path, isLast: idx === segments.length - 1 }
  })

  return (
    <nav className="text-xs text-slate-400 flex items-center gap-2" aria-label="Breadcrumb">
      {items.map((item, idx) => (
        <span key={item.path} className="flex items-center gap-2">
          {item.isLast ? (
            <span className="text-slate-200 font-semibold">{item.label}</span>
          ) : (
            <Link to={item.path} className="hover:text-cyan-300">
              {item.label}
            </Link>
          )}
          {idx < items.length - 1 && <span className="text-slate-600">/</span>}
        </span>
      ))}
    </nav>
  )
}
