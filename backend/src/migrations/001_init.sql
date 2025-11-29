CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES ('citizen') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('agency_staff') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('admin') ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  verification_status TEXT NOT NULL DEFAULT 'unverified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agencies (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  type TEXT,
  city TEXT,
  jurisdiction_geom geometry(MultiPolygon, 4326),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agency_staff (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  agency_id INTEGER NOT NULL REFERENCES agencies(id),
  role_in_agency TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS citizen_verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  national_id TEXT NOT NULL,
  phone TEXT,
  otp_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  reviewed_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER NOT NULL REFERENCES users(id),
  description TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  assigned_agency_id INTEGER REFERENCES agencies(id),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  geom geometry(Point, 4326),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_ai_outputs (
  incident_id INTEGER PRIMARY KEY REFERENCES incidents(id),
  category_pred TEXT,
  severity_score NUMERIC,
  severity_label INTEGER,
  confidence NUMERIC,
  summary TEXT,
  model_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_status_history (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER NOT NULL REFERENCES incidents(id),
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by INTEGER REFERENCES users(id),
  notes TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_ai_reclass (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER NOT NULL REFERENCES incidents(id),
  model_version TEXT,
  category_pred TEXT,
  severity_score NUMERIC,
  severity_label INTEGER,
  confidence NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
