import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-center px-6">
      <div className="space-y-4 max-w-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">GEORISE</p>
        <h1 className="text-4xl font-bold text-white">Geospatial Emergency Platform</h1>
        <p className="text-slate-400">
          Citizens report incidents, agencies coordinate response, admins govern. Sign in to continue.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-semibold"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            className="bg-transparent border border-cyan-400 text-cyan-300 px-4 py-2 rounded font-semibold hover:bg-white/5"
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  )
}
