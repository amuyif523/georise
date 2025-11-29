import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useMemo } from 'react'

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

type Feature = {
  type: 'Feature'
  geometry: { type: string; coordinates: [number, number] }
  properties: { id: number; status: string; category: string | null; created_at: string }
}

type Props = {
  features: Feature[]
  mode?: 'markers' | 'heatmap' | 'cluster'
}

function makeClusterIcon(count: number) {
  return L.divIcon({
    html: `<div style="
      background:#22d3ee;
      color:#0f172a;
      border:2px solid #0ea5e9;
      border-radius:9999px;
      width:34px;
      height:34px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight:700;
      box-shadow:0 4px 10px rgba(14,165,233,0.4);
    ">${count}</div>`,
    className: '',
    iconSize: [34, 34],
  })
}

export default function AgencyMap({ features, mode = 'markers' }: Props) {
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined
  const tileUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const attribution = mapboxToken
    ? '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    : '© <a href="https://www.openstreetmap.org/copyright">OSM</a>'

  const clusters = useMemo(() => {
    const bucket = new Map<
      string,
      { lat: number; lng: number; count: number; sample: Feature['properties'] }
    >()
    features.forEach((f) => {
      if (f.geometry.type !== 'Point') return
      const [lng, lat] = f.geometry.coordinates
      // coarse grid to cluster nearby points
      const key = `${lat.toFixed(2)}|${lng.toFixed(2)}`
      const existing = bucket.get(key)
      if (existing) {
        existing.count += 1
      } else {
        bucket.set(key, { lat, lng, count: 1, sample: f.properties })
      }
    })
    return Array.from(bucket.values())
  }, [features])

  return (
    <div className="w-full h-72 rounded border border-slate-800 overflow-hidden">
      <MapContainer
        center={[9.0108, 38.7613]}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution={attribution}
          url={tileUrl}
          tileSize={mapboxToken ? 512 : 256}
          zoomOffset={mapboxToken ? -1 : 0}
        />
        {mode === 'cluster'
          ? clusters.map((c, idx) => (
              <Marker key={idx} position={[c.lat, c.lng]} icon={makeClusterIcon(c.count)}>
                <Popup>
                  <div className="text-sm">
                    <p>Approx. cluster</p>
                    <p>Count: {c.count}</p>
                    <p>Status: {c.sample.status}</p>
                    <p>Category: {c.sample.category || 'Uncategorized'}</p>
                  </div>
                </Popup>
              </Marker>
            ))
          : features.map((f) => {
              if (f.geometry.type !== 'Point') return null
              const [lng, lat] = f.geometry.coordinates
              if (mode === 'heatmap') {
                return (
                  <Circle
                    key={f.properties.id}
                    center={[lat, lng]}
                    radius={200}
                    pathOptions={{ color: '#22d3ee', fillColor: '#22d3ee', fillOpacity: 0.25 }}
                  />
                )
              }
              return (
                <Marker key={f.properties.id} position={[lat, lng]} icon={markerIcon}>
                  <Popup>
                    <div className="text-sm">
                      <p>ID: {f.properties.id}</p>
                      <p>Status: {f.properties.status}</p>
                      <p>Category: {f.properties.category || 'Uncategorized'}</p>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
      </MapContainer>
    </div>
  )
}
