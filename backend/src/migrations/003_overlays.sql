-- Generic overlays table for hospitals, police/fire stations, traffic closures, flood zones, etc.
CREATE TABLE IF NOT EXISTS overlays (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,       -- e.g., hospital, police, fire, traffic, flood, water
  subtype TEXT,             -- optional refinement
  metadata JSONB,
  geom geometry(GEOMETRY, 4326) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS overlays_name_type_uk ON overlays(name, type);
CREATE INDEX IF NOT EXISTS overlays_geom_gix ON overlays USING GIST (geom);
CREATE INDEX IF NOT EXISTS overlays_type_idx ON overlays(type);
