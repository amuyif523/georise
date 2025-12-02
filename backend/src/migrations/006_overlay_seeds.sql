-- Seed overlay data for hospitals, police, fire, traffic, flood
INSERT INTO overlays (name, type, subtype, metadata, geom)
VALUES
  ('Central Hospital', 'hospital', 'general', '{"city":"Addis"}', ST_SetSRID(ST_MakePoint(38.763, 9.02), 4326)),
  ('Bole Clinic', 'hospital', 'clinic', '{"city":"Addis"}', ST_SetSRID(ST_MakePoint(38.78, 9.01), 4326)),
  ('Police HQ', 'police', 'hq', '{"city":"Addis"}', ST_SetSRID(ST_MakePoint(38.75, 9.03), 4326)),
  ('Fire Station 1', 'fire', 'station', '{"city":"Addis"}', ST_SetSRID(ST_MakePoint(38.77, 9.015), 4326)),
  ('Traffic Control', 'traffic', 'control', '{"city":"Addis"}', ST_SetSRID(ST_MakePoint(38.74, 9.0), 4326)),
  ('Flood Zone A', 'flood', 'zone', '{"risk":"high"}', ST_GeomFromText('POLYGON((38.73 9.0, 38.74 9.0, 38.74 9.01, 38.73 9.01, 38.73 9.0))', 4326))
ON CONFLICT DO NOTHING;
