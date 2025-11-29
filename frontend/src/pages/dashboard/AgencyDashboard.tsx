import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/auth'
import AgencyMap from '../../components/AgencyMap'

type FeatureCollection = {
  type: 'FeatureCollection'
  features: {
    type: 'Feature'
    geometry: { type: string; coordinates: [number, number] }
    properties: { id: number; status: string; category: string | null; created_at: string }
  }[]
}

const mockIncidents = [
  { id: 1, category: 'fire', status: 'pending_verification', severity: 3, location: 'Bole' },
  { id: 2, category: 'accident', status: 'submitted', severity: 2, location: 'CMC' },
]

export default function AgencyDashboard() {
  const { token } = useAuth()
  const [list, setList] = useState<
    { id: number; description: string; status: string; category: string | null; created_at: string }[]
  >([])
  const [features, setFeatures] = useState<FeatureCollection['features']>([])
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap' | 'cluster'>('markers')
  const defaultBbox = '38.6,8.9,39.1,9.1' // Addis Ababa area; avoids loading entire globe

  useEffect(() => {
    const load = async () => {
      if (!token) return
      try {
        const mapParams = new URLSearchParams()
        mapParams.append('bbox', defaultBbox)
        if (status) mapParams.append('status', status)
        if (category) mapParams.append('category', category)
        mapParams.append('pageSize', '300')

        const listParams = new URLSearchParams()
        if (status) listParams.append('status', status)
        if (category) listParams.append('category', category)
        listParams.append('pageSize', '20')

        const [mapRes, listRes] = await Promise.all([
          api.get<FeatureCollection>(`/gis/incidents?${mapParams.toString()}`, token),
          api.get<{ incidents: { id: number; description: string; status: string; category: string | null; created_at: string }[] }>(
            `/agency/incidents?${listParams.toString()}`,
            token
          ),
        ])

        setFeatures(mapRes.features)
        setList(listRes.incidents)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load map data')
      }
    }
    load()
    const interval = setInterval(load, 8000)
    return () => clearInterval(interval)
  }, [token, status, category, defaultBbox])

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">GEORISE</p>
        <h1 className="text-2xl font-bold">Agency Dashboard</h1>
        <p className="text-slate-400 text-sm">Map placeholder + incident list.</p>
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-slate-200">
        <select
          className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Status: All</option>
          <option value="submitted">Submitted</option>
          <option value="verified">Verified</option>
          <option value="assigned">Assigned</option>
          <option value="responding">Responding</option>
          <option value="resolved">Resolved</option>
        </select>
        <input
          className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
          placeholder="Category filter"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <select
          className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as typeof viewMode)}
        >
          <option value="markers">Markers</option>
          <option value="heatmap">Heatmap</option>
          <option value="cluster">Cluster</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded border border-slate-800 bg-slate-800/60 h-72 flex items-center justify-center text-slate-400">
          {error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : (
            <AgencyMap features={features} mode={viewMode} />
          )}
        </div>
        <div className="rounded border border-slate-800 bg-slate-800/60 p-4 space-y-3">
          <h3 className="font-semibold">Incident Queue</h3>
          <div className="space-y-2">
            {list.length === 0 ? (
              <p className="text-sm text-slate-400">No incidents found.</p>
            ) : (
              list.map((inc) => (
                <div
                  key={inc.id}
                  className="rounded border border-slate-700 bg-slate-900/50 p-3 flex justify-between"
                >
                  <div>
                    <p className="font-semibold capitalize">{inc.category || 'Uncategorized'}</p>
                    <p className="text-xs text-slate-400">
                      Created: {new Date(inc.created_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-1">{inc.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase px-2 py-1 rounded bg-slate-700 text-slate-200">
                      {inc.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
