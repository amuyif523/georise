import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(identifier, password)
      routeByRole()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const routeByRole = () => {
    const role = user?.role
    if (role === 'admin') navigate('/admin/dashboard')
    else if (role === 'agency_staff') navigate('/agency/dashboard')
    else navigate('/citizen/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-semibold text-white text-center">Sign in to GEORISE</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="block text-sm text-slate-300">Email or Phone</label>
            <input
              className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm text-slate-300">Password</label>
            <input
              className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded transition disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p className="text-sm text-slate-400 text-center">
          New here?{' '}
          <button className="text-cyan-400 hover:underline" onClick={() => navigate('/register')}>
            Create an account
          </button>
        </p>
      </div>
    </div>
  )
}
