import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
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
}

export default function AgencyMap({ features }: Props) {
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
