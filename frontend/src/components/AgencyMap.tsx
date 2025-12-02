import { MapContainer, TileLayer, Marker, Popup, Circle, GeoJSON, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useMemo } from "react"
import type { Geometry, Feature as GeoJsonFeature } from "geojson"

type Feature = {
  type: "Feature"
  geometry: { type: string; coordinates: [number, number] }
  properties: { id?: number; status?: string; category?: string | null; created_at?: string; count?: number }
}

type OverlayFeature = {
  type: "Feature"
  geometry: Geometry
  properties: { id: number; name: string; type: string; subtype?: string | null; metadata?: unknown }
}

type Props = {
  features: Feature[]
  overlays?: OverlayFeature[]
  mode?: "markers" | "heatmap" | "cluster"
  onBoundsChange?: (bbox: [number, number, number, number]) => void
}

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const overlayColors: Record<string, string> = {
  hospital: "#f97316",
  police: "#38bdf8",
  fire: "#ef4444",
  traffic: "#f59e0b",
  flood: "#6366f1",
  water: "#10b981",
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
    className: "",
    iconSize: [34, 34],
  })
}

function BoundWatcher({ onChange }: { onChange?: (bbox: [number, number, number, number]) => void }) {
  useMapEvents({
    moveend(e) {
      const b = e.target.getBounds()
      onChange?.([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()])
    },
  })
  return null
}

export default function AgencyMap({ features, overlays = [], mode = "markers", onBoundsChange }: Props) {
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined
  const tileUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  const attribution = mapboxToken
    ? "© <a href=\"https://www.mapbox.com/about/maps/\">Mapbox</a> © <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
    : "© <a href=\"https://www.openstreetmap.org/copyright\">OSM</a>"

  const clusters = useMemo(() => {
    // If server already aggregated clusters (properties.count), use them directly
    const serverClusters = features
      .map((f) => {
        if (f.geometry.type !== "Point") return null
        if (f.properties.count && f.properties.count > 1) {
          const [lng, lat] = f.geometry.coordinates
          return { lat, lng, count: f.properties.count, sample: f.properties }
        }
        return null
      })
      .filter(Boolean) as { lat: number; lng: number; count: number; sample: Feature["properties"] }[]

    if (serverClusters.length) return serverClusters

    // Fallback: simple client-side bucketing
    const bucket = new Map<
      string,
      { lat: number; lng: number; count: number; sample: Feature["properties"] }
    >()
    features.forEach((f) => {
      if (f.geometry.type !== "Point") return
      const [lng, lat] = f.geometry.coordinates
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
        style={{ height: "100%", width: "100%" }}
      >
        <BoundWatcher onChange={onBoundsChange} />
        <TileLayer
          attribution={attribution}
          url={tileUrl}
          tileSize={mapboxToken ? 512 : 256}
          zoomOffset={mapboxToken ? -1 : 0}
        />
        {mode === "cluster"
          ? clusters.map((c, idx) => (
              <Marker key={idx} position={[c.lat, c.lng]} icon={makeClusterIcon(c.count)}>
                <Popup>
                  <div className="text-sm">
                    <p>Approx. cluster</p>
                    <p>Count: {c.count}</p>
                    <p>Status: {c.sample.status ?? "unknown"}</p>
                    <p>Category: {c.sample.category || "Uncategorized"}</p>
                  </div>
                </Popup>
              </Marker>
            ))
          : features.map((f) => {
              if (f.geometry.type !== "Point") return null
              const [lng, lat] = f.geometry.coordinates
              if (mode === "heatmap") {
                return (
                  <Circle
                    key={f.properties.id ?? `${lat}-${lng}`}
                    center={[lat, lng]}
                    radius={200}
                    pathOptions={{ color: "#22d3ee", fillColor: "#22d3ee", fillOpacity: 0.25 }}
                  />
                )
              }
              return (
                <Marker key={f.properties.id ?? `${lat}-${lng}`} position={[lat, lng]} icon={markerIcon}>
                  <Popup>
                    <div className="text-sm">
                      <p>ID: {f.properties.id ?? "n/a"}</p>
                      <p>Status: {f.properties.status ?? "unknown"}</p>
                      <p>Category: {f.properties.category || "Uncategorized"}</p>
                    </div>
                  </Popup>
                </Marker>
              )
            })}

        {overlays.map((f) => {
          const color = overlayColors[f.properties.type] ?? "#22d3ee"
          return (
            <GeoJSON
              key={`ov-${f.properties.id}`}
              data={f as GeoJsonFeature}
              style={() => ({ color, weight: 2, fillColor: color, fillOpacity: 0.25 })}
              pointToLayer={(_, latlng) => new L.CircleMarker(latlng, { radius: 8, color, fillColor: color, fillOpacity: 0.8 })}
            >
              <Popup>
                <div className="text-sm">
                  <p>{f.properties.name}</p>
                  <p className="text-xs text-slate-500">Type: {f.properties.type}</p>
                  {f.properties.subtype && <p className="text-xs text-slate-500">Subtype: {f.properties.subtype}</p>}
                </div>
              </Popup>
            </GeoJSON>
          )
        })}
      </MapContainer>
    </div>
  )
}
