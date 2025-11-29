import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

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
  heatmap?: boolean
}

export default function AgencyMap({ features, heatmap = false }: Props) {
  return (
    <div className="w-full h-72 rounded border border-slate-800 overflow-hidden">
      <MapContainer
        center={[9.0108, 38.7613]}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {features.map((f) => {
          if (f.geometry.type !== 'Point') return null
          const [lng, lat] = f.geometry.coordinates
          if (heatmap) {
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
