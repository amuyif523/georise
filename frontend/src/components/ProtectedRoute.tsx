import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/auth'

type Props = {
  allowedRoles?: string[]
  redirectTo?: string
}

export default function ProtectedRoute({ allowedRoles, redirectTo = '/login' }: Props) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to={redirectTo} replace />
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />
  }
  return <Outlet />
}
