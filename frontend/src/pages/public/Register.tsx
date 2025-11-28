import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(fullName, email || undefined, phone || undefined, password)
      navigate('/citizen/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-semibold text-white text-center">Create your account</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="block text-sm text-slate-300">Full Name</label>
            <input
              className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm text-slate-300">Email (optional)</label>
            <input
              className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm text-slate-300">Phone (optional)</label>
            <input
              className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>
        <p className="text-sm text-slate-400 text-center">
          Already have an account?{' '}
          <button className="text-cyan-400 hover:underline" onClick={() => navigate('/login')}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
