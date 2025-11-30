import Breadcrumbs from '../../components/Breadcrumbs'
import CommandPalette from '../../components/CommandPalette'
import NotificationPanel from '../../components/NotificationPanel'
import TopNav from '../../components/TopNav'
import BottomNav from '../../components/BottomNav'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-0">
      <TopNav />
      <CommandPalette />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Breadcrumbs />
            <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">Overview of admin functions.</p>
          </div>
          <NotificationPanel />
        </div>
        <div className="rounded border border-slate-800 bg-slate-800/60 p-4 space-y-2">
          <p className="text-sm text-slate-200">
            Use the navigation to manage users, agencies, verification workflows, and monitor AI/incident activity.
          </p>
          <p className="text-xs text-slate-400">
            Tip: Press Ctrl/Cmd + K to open the command palette for quick navigation.
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
