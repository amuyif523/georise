import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth'
import Breadcrumbs from '../../components/Breadcrumbs'
import CommandPalette from '../../components/CommandPalette'
import NotificationPanel from '../../components/NotificationPanel'
import TopNav from '../../components/TopNav'
import BottomNav from '../../components/BottomNav'

export default function CitizenDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isVerified = user?.verificationStatus === 'verified'

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <TopNav />
      <CommandPalette />
      <div className="px-6 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Breadcrumbs />
            <h1 className="text-xl font-bold">Citizen Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationPanel />
            <button className="text-sm text-slate-300 hover:text-white" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        {!isVerified && (
          <div className="m-6 rounded-md border border-yellow-500/40 bg-yellow-500/10 p-4">
            <h2 className="text-lg font-semibold text-yellow-300">Verification required</h2>
            <p className="text-sm text-slate-200">You need to verify your National ID before reporting incidents.</p>
            <div className="mt-3">
              <button
                className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-semibold px-4 py-2 rounded"
                onClick={() => navigate('/citizen/verify')}
              >
                Start Verification
              </button>
            </div>
          </div>
        )}

        {isVerified && (
          <div className="m-6 rounded-md border border-green-500/40 bg-green-500/10 p-4">
            <h2 className="text-lg font-semibold text-green-300">Verified</h2>
            <p className="text-sm text-slate-200">You can now report incidents.</p>
          </div>
        )}

        <div className="m-6 grid gap-4 md:grid-cols-2">
          <div className="rounded border border-slate-800 bg-slate-800/60 p-4">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <div className="flex gap-3 flex-wrap">
              <button
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded disabled:opacity-50"
                disabled={!isVerified}
                onClick={() => navigate('/citizen/report')}
              >
                Report Incident
              </button>
              <button
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded"
                onClick={() => navigate('/citizen/incidents')}
              >
                My Reports
              </button>
            </div>
          </div>
          <div className="rounded border border-slate-800 bg-slate-800/60 p-4">
            <h3 className="font-semibold mb-2">Profile</h3>
            <p className="text-sm text-slate-300">Name: {user?.fullName || 'N/A'}</p>
            <p className="text-sm text-slate-300">Email: {user?.email || 'N/A'}</p>
            <p className="text-sm text-slate-300">Phone: {user?.phone || 'N/A'}</p>
            <p className="text-sm text-slate-300">Status: {user?.verificationStatus || 'unverified'}</p>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
