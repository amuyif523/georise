import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../context/auth'

const DRAFT_KEY = 'georise:incident-draft'

export default function ReportIncident() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)

  // Load draft and wire online/offline listeners
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const draft = JSON.parse(raw)
        setDescription(draft.description || '')
        setCategory(draft.category || '')
        setLat(draft.lat || '')
        setLng(draft.lng || '')
      }
    } catch {
      /* ignore */
    }
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  const persistDraft = (next: { description?: string; category?: string; lat?: string; lng?: string }) => {
    try {
      const draft = {
        description: next.description ?? description,
        category: next.category ?? category,
        lat: next.lat ?? lat,
        lng: next.lng ?? lng,
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {
      /* ignore */
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !isOnline) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await api.post<{ incident: { id: number } }>(
        '/citizen/incidents',
        {
          description,
          category: category || undefined,
          lat: lat ? Number(lat) : undefined,
          lng: lng ? Number(lng) : undefined,
        },
        token
      )
      localStorage.removeItem(DRAFT_KEY)
      navigate(`/citizen/incidents/${res.incident.id}`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to submit incident')
    } finally {
      setLoading(false)
    }
  }

  const isVerified = user?.verificationStatus === 'verified'

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-semibold">Report Incident</h1>
        {!isOnline && (
          <div className="rounded border border-yellow-500/40 bg-yellow-500/10 p-3 text-yellow-200 text-sm">
            You are offline. Draft is saved locally; submit when back online.
          </div>
        )}
        {!isVerified && (
          <div className="rounded border border-yellow-500/40 bg-yellow-500/10 p-3 text-yellow-200 text-sm">
            You must be verified to submit incidents.
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm text-slate-300">Category (optional)</label>
            <input
              className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                persistDraft({ category: e.target.value })
              }}
              placeholder="e.g., fire, accident"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-slate-300">Description</label>
            <textarea
              className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 min-h-[120px]"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                persistDraft({ description: e.target.value })
              }}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-sm text-slate-300">Latitude (optional)</label>
              <input
                className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
                value={lat}
                onChange={(e) => {
                  setLat(e.target.value)
                  persistDraft({ lat: e.target.value })
                }}
                placeholder="e.g., 9.010"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-slate-300">Longitude (optional)</label>
              <input
                className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
                value={lng}
                onChange={(e) => {
                  setLng(e.target.value)
                  persistDraft({ lng: e.target.value })
                }}
                placeholder="e.g., 38.761"
              />
            </div>
          </div>
          {message && <p className="text-sm text-red-400">{message}</p>}
          <button
            type="submit"
            disabled={loading || !isVerified || !isOnline}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Incident'}
          </button>
        </form>
      </div>
    </div>
  )
}
