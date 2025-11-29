import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import Landing from './pages/Landing'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import CitizenDashboard from './pages/dashboard/CitizenDashboard'
import AgencyDashboard from './pages/dashboard/AgencyDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/auth'
import Verification from './pages/citizen/Verification'
import ReportIncident from './pages/citizen/ReportIncident'
import MyReports from './pages/citizen/MyReports'
import IncidentDetail from './pages/citizen/IncidentDetail'
import AgencyIncidentList from './pages/agency/IncidentList'
import AgencyIncidentDetail from './pages/agency/IncidentDetail'
import AgencyReportIncident from './pages/agency/ReportIncident'

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (user.role === 'agency_staff') return <Navigate to="/agency/dashboard" replace />
  return <Navigate to="/citizen/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute allowedRoles={['citizen', 'agency_staff', 'admin']} />}>
          <Route path="/me" element={<RoleRedirect />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
          <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
          <Route path="/citizen/verify" element={<Verification />} />
          <Route path="/citizen/report" element={<ReportIncident />} />
          <Route path="/citizen/incidents" element={<MyReports />} />
          <Route path="/citizen/incidents/:id" element={<IncidentDetail />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['agency_staff', 'admin']} />}>
          <Route path="/agency/dashboard" element={<AgencyDashboard />} />
          <Route path="/agency/incidents" element={<AgencyIncidentList />} />
          <Route path="/agency/incidents/:id" element={<AgencyIncidentDetail />} />
          <Route path="/agency/report" element={<AgencyReportIncident />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/home" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/agencies" element={<AdminAgencies />} />
          <Route path="/admin/verification" element={<AdminVerifications />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
import AdminDashboardPage from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/Users'
import AdminAgencies from './pages/admin/Agencies'
import AdminVerifications from './pages/admin/Verifications'
