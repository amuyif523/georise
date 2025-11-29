-- Common indexes for filters
CREATE INDEX IF NOT EXISTS incidents_status_idx ON incidents(status);
CREATE INDEX IF NOT EXISTS incidents_assigned_agency_idx ON incidents(assigned_agency_id);
-- GIS index
CREATE INDEX IF NOT EXISTS incidents_geom_gix ON incidents USING GIST (geom);

-- Optional: incident status history by incident/time
CREATE INDEX IF NOT EXISTS incident_history_incident_idx ON incident_status_history(incident_id, changed_at DESC);
