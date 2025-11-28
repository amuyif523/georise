import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../context/auth'

type Stage = 'collect' | 'otp' | 'success'

export default function Verification() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [nationalId, setNationalId] = useState('')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [otp, setOtp] = useState('')
  const [stage, setStage] = useState<Stage>('collect')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const startVerification = async () => {
    if (!token) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await api.post<{ status: string; otp: string; message: string }>(
        '/citizen/verification/start',
        { nationalId, phone },
        token
      )
      setMessage(`OTP sent (mock): ${res.otp}`)
      setStage('otp')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to start verification')
    } finally {
      setLoading(false)
    }
  }

  const confirmVerification = async () => {
    if (!token) return
    setLoading(true)
    setMessage(null)
    try {
      await api.post('/citizen/verification/confirm', { nationalId, otp }, token)
      setStage('success')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to confirm verification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-semibold text-center">Verify your National ID</h1>

        {stage === 'collect' && (
          <>
            <div className="space-y-2">
              <label className="block text-sm text-slate-300">National ID</label>
              <input
                className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-slate-300">Phone</label>
              <input
                className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            {message && <p className="text-sm text-slate-200">{message}</p>}
            <button
              onClick={startVerification}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded transition disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        )}

        {stage === 'otp' && (
          <>
            <div className="space-y-2">
              <label className="block text-sm text-slate-300">Enter OTP</label>
              <input
                className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            {message && <p className="text-sm text-slate-200">{message}</p>}
            <button
              onClick={confirmVerification}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2 rounded transition disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Confirm OTP'}
            </button>
          </>
        )}

        {stage === 'success' && (
          <div className="text-center space-y-3">
            <p className="text-green-400 font-semibold">Verified!</p>
            <button
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded transition"
              onClick={() => navigate('/citizen/dashboard')}
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
