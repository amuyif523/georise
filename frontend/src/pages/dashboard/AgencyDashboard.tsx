import { useEffect, useMemo, useState, useCallback } from 'react'
import type { Geometry } from 'geojson'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../context/auth'
import AgencyMap from '../../components/AgencyMap'
import Breadcrumbs from '../../components/Breadcrumbs'
import CommandPalette from '../../components/CommandPalette'
import NotificationPanel from '../../components/NotificationPanel'
import TopNav from '../../components/TopNav'
import BottomNav from '../../components/BottomNav'
import { useRealtime } from '../../hooks/useRealtime'

type FeatureCollection = {
  type: 'FeatureCollection'
  features: {
    type: 'Feature'
    geometry: { type: string; coordinates: [number, number] }
    properties: { id?: number; status?: string; category?: string | null; created_at?: string; count?: number }
  }[]
}

type OverlayFeature = {
  type: 'Feature'
  geometry: Geometry
  properties: { id: number; name: string; type: string; subtype?: string | null; metadata?: unknown }
}

export default function AgencyDashboard() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [list, setList] = useState<
    { id: number; description: string; status: string; category: string | null; created_at: string }[]
  >([])
  const [features, setFeatures] = useState<FeatureCollection['features']>([])
  const [overlays, setOverlays] = useState<OverlayFeature[]>([])
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{ total: number; byStatus: Record<string, number>; agency?: { name?: string; type?: string | null; city?: string | null } }>({
    total: 0,
    byStatus: {},
    agency: undefined,
  })
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap' | 'cluster'>('markers')
  const [overlayTypes, setOverlayTypes] = useState<string[]>(['hospital', 'police', 'fire'])
  const [timeWindow, setTimeWindow] = useState<string>('24')
  const [bbox, setBbox] = useState<string>('38.6,8.9,39.1,9.1') // Addis Ababa area; avoids loading entire globe
  const [mapPage, setMapPage] = useState(1)
  const [mapHasMore, setMapHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [polyJson, setPolyJson] = useState<string>('')
  const [nearLat, setNearLat] = useState('')
  const [nearLng, setNearLng] = useState('')
  const [nearKm, setNearKm] = useState('1')
  const [criticalTypes, setCriticalTypes] = useState<string[]>([])

  const timeFrom = useMemo(() => {
    if (timeWindow === 'all') return undefined
    const hours = Number(timeWindow)
    if (Number.isNaN(hours)) return undefined
    const d = new Date()
    d.setHours(d.getHours() - hours)
    return d.toISOString()
  }, [timeWindow])

  const loadData = useCallback(
    async ({ resetPage = true, page }: { resetPage?: boolean; page?: number } = {}) => {
      if (!token) return
      setIsLoading(true)
      try {
        const nextPage = resetPage ? 1 : page ?? mapPage
        const mapParams = new URLSearchParams()
        mapParams.append('bbox', bbox)
        if (status) mapParams.append('status', status)
        if (category) mapParams.append('category', category)
        if (timeFrom) mapParams.append('from', timeFrom)
        mapParams.append('pageSize', '200')
      mapParams.append('page', String(nextPage))
      if (viewMode === 'cluster') {
        mapParams.append('cluster', '1')
        mapParams.append('clusterGrid', '0.02')
      }
      if (polyJson.trim()) mapParams.append('polygon', polyJson.trim())
      if (nearLat && nearLng && nearKm) {
        mapParams.append('lat', nearLat)
        mapParams.append('lng', nearLng)
        mapParams.append('withinKm', nearKm)
      }
      if (criticalTypes.length) mapParams.append('criticalTypes', criticalTypes.join(','))

      const listParams = new URLSearchParams()
      if (status) listParams.append('status', status)
      if (category) listParams.append('category', category)
      listParams.append('pageSize', '20')

        const overlayParams = new URLSearchParams()
        if (overlayTypes.length) overlayParams.append('types', overlayTypes.join(','))

        const [mapRes, listRes, statsRes] = await Promise.all([
          api.get<FeatureCollection>(`/gis/incidents?${mapParams.toString()}`, token),
          api.get<{ incidents: { id: number; description: string; status: string; category: string | null; created_at: string }[] }>(
            `/agency/incidents?${listParams.toString()}`,
            token
          ),
          api.get<{ total: number; byStatus: Record<string, number> }>(`/agency/stats`, token),
        ])

        const incoming = mapRes.features
        const dedup = new Map<string, FeatureCollection['features'][number]>()
        if (!resetPage) {
          features.forEach((f) => dedup.set(String(f.properties.id ?? `x-${f.properties.count ?? 0}`), f))
        } else {
          setMapPage(1)
        }
        incoming.forEach((f, idx) => {
          const key = String(f.properties.id ?? `new-${idx}-${f.properties.count ?? 0}`)
          dedup.set(key, f)
        })
        setFeatures(Array.from(dedup.values()))
        setMapHasMore(incoming.length >= 200)
        setList(listRes.incidents)
        setStats(statsRes)

        if (overlayTypes.length) {
          const overlayRes = await api.get<{ type: 'FeatureCollection'; features: OverlayFeature[] }>(
            `/gis/overlays?${overlayParams.toString()}`,
            token
          )
          setOverlays(overlayRes.features)
        } else {
          setOverlays([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load map data')
      } finally {
        setIsLoading(false)
      }
    },
    [bbox, category, features, overlayTypes, status, timeFrom, token, viewMode, mapPage]
  )
  useEffect(() => {
    loadData({ resetPage: true })
  }, [loadData, token, status, category, bbox, overlayTypes, timeFrom])

  // Realtime updates: on incident events, refresh current data slice
  useRealtime((evt) => {
    if (evt.type?.startsWith('incident:')) {
      loadData({ resetPage: true })
    }
  })

  return (
    <div className="min-h-screen bg-slate-900 text-white p-0">
      <TopNav />
      <CommandPalette />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Breadcrumbs />
            <h1 className="text-2xl font-bold">Agency Dashboard</h1>
            <p className="text-slate-400 text-sm">
              {stats.agency?.name ? `${stats.agency.name} (${stats.agency.type ?? 'agency'})` : 'Queue, map, and quick stats for your agency.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationPanel />
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="text-sm text-slate-200 px-3 py-2 rounded border border-slate-700 hover:border-red-400 hover:text-red-200 transition"
            >
              Logout
            </button>
          </div>
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
          <select
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value)}
          >
            <option value="24">Last 24h</option>
            <option value="72">Last 72h</option>
            <option value="168">Last 7 days</option>
            <option value="all">All time</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Total" value={stats.total} />
          <KpiCard label="Submitted" value={stats.byStatus['submitted'] || 0} />
          <KpiCard label="Verified" value={stats.byStatus['verified'] || 0} />
          <KpiCard label="Responding" value={stats.byStatus['responding'] || 0} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded border border-slate-800 bg-slate-800/60 h-72 flex flex-col text-slate-400">
            <div className="flex items-center justify-between px-3 py-2 text-xs">
              <span>{isLoading ? 'Loading…' : 'Viewport incidents'}</span>
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 rounded bg-slate-700 text-white hover:bg-slate-600"
                  onClick={() => loadData({ resetPage: true })}
                >
                  Refresh
                </button>
                {mapHasMore && (
                  <button
                    className="px-2 py-1 rounded bg-cyan-600 text-white hover:bg-cyan-500"
                    onClick={() => {
                      const next = mapPage + 1
                      setMapPage(next)
                      loadData({ resetPage: false, page: next })
                    }}
                  >
                    Load more
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1">
              {error ? (
                <p className="text-sm text-red-400 px-3">{error}</p>
              ) : (
                <AgencyMap
                  features={features}
                  overlays={overlays}
                  mode={viewMode}
                  onBoundsChange={(b) => {
                    setBbox(b.join(','))
                    setMapPage(1)
                    setMapHasMore(false)
                  }}
                />
              )}
            </div>
          </div>
          <div className="rounded border border-slate-800 bg-slate-800/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Incident Queue</h3>
              <div className="flex gap-3 text-xs text-slate-400">
                <button className="underline hover:text-cyan-300" onClick={() => navigate('/agency/ai-review')}>
                  AI Review Queue
                </button>
                <button className="underline hover:text-cyan-300" onClick={() => navigate('/agency/report')}>
                  Field Reporting
                </button>
              </div>
            </div>
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

        <div className="rounded border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <h3 className="font-semibold">Map Layers</h3>
          <p className="text-xs text-slate-400">Toggle overlays to show on the map.</p>
          <div className="flex flex-wrap gap-3 text-sm">
            {['hospital', 'police', 'fire', 'traffic', 'flood', 'water'].map((t) => (
              <label key={t} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-cyan-400"
                  checked={overlayTypes.includes(t)}
                  onChange={(e) => {
                    setOverlayTypes((prev) => (e.target.checked ? [...prev, t] : prev.filter((p) => p !== t)))
                  }}
                />
                <span className="capitalize">{t}</span>
              </label>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-200 pt-3">
            <div className="space-y-1">
              <p className="text-slate-400">Polygon (GeoJSON)</p>
              <textarea
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-2"
                rows={3}
                placeholder='{"type":"Polygon","coordinates":[[[...]]]}'
                value={polyJson}
                onChange={(e) => setPolyJson(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <p className="text-slate-400">Near (lat,lng,km)</p>
              <div className="flex gap-2">
                <input
                  className="w-1/3 bg-slate-900 border border-slate-700 rounded px-2 py-1"
                  placeholder="lat"
                  value={nearLat}
                  onChange={(e) => setNearLat(e.target.value)}
                />
                <input
                  className="w-1/3 bg-slate-900 border border-slate-700 rounded px-2 py-1"
                  placeholder="lng"
                  value={nearLng}
                  onChange={(e) => setNearLng(e.target.value)}
                />
                <input
                  className="w-1/3 bg-slate-900 border border-slate-700 rounded px-2 py-1"
                  placeholder="km"
                  value={nearKm}
                  onChange={(e) => setNearKm(e.target.value)}
                />
              </div>
              <div className="space-y-1 pt-2">
                <p className="text-slate-400">Critical overlays</p>
                <div className="flex flex-wrap gap-2">
                  {['hospital', 'police', 'fire', 'traffic', 'flood'].map((t) => (
                    <label key={`crit-${t}`} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-cyan-400"
                        checked={criticalTypes.includes(t)}
                        onChange={(e) =>
                          setCriticalTypes((prev) => (e.target.checked ? [...prev, t] : prev.filter((p) => p !== t)))
                        }
                      />
                      <span className="capitalize">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-slate-800 bg-slate-800/60 p-3">
      <p className="text-xs text-slate-400 uppercase">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}
