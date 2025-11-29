import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../context/auth'

export default function AgencyReportIncident() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [lat, setLat] = useState<number | ''>('')
  const [lng, setLng] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      await api.post(
        '/agency/incidents',
        { description, category: category || null, lat: lat === '' ? null : lat, lng: lng === '' ? null : lng },
        token
      )
      navigate('/agency/incidents')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">GEORISE</p>
          <h1 className="text-2xl font-bold">Field Report</h1>
          <p className="text-slate-400 text-sm">Submit an incident on behalf of your agency.</p>
        </div>
        <button className="text-sm text-slate-300 hover:text-white" onClick={() => navigate('/agency/incidents')}>
          Back to Incidents
        </button>
      </div>

      <form className="bg-slate-800/60 border border-slate-800 rounded p-4 space-y-3" onSubmit={submit}>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Category</label>
          <input
            className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., fire, accident, medical"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Description</label>
          <textarea
            className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Latitude</label>
            <input
              className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={lat}
              onChange={(e) => setLat(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="9.0108"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Longitude</label>
            <input
              className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              value={lng}
              onChange={(e) => setLng(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="38.7613"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Incident'}
        </button>
      </form>
    </div>
  )
}
