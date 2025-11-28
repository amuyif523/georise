import { query } from '../config/db'
import bcrypt from 'bcryptjs'

const roleNames = ['citizen', 'agency_staff', 'admin'] as const

export async function ensureSchema() {
  await query(
    `
    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    );

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

    ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'unverified';

    CREATE TABLE IF NOT EXISTS citizen_verifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      national_id TEXT NOT NULL,
      phone TEXT,
      otp_code TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      confirmed_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id SERIAL PRIMARY KEY,
      reporter_id INTEGER NOT NULL REFERENCES users(id),
      description TEXT NOT NULL,
      category TEXT,
      status TEXT NOT NULL DEFAULT 'submitted',
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
    `
  )

  for (const name of roleNames) {
    await query('INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING;', [name])
  }

  await seedAgencyAndStaff()
}

async function seedAgencyAndStaff() {
  const agencyName = 'Demo Agency'
  const agencyType = 'police'
  const agencyCity = 'Addis Ababa'
  const staffEmail = 'agency.staff@example.com'
  const staffPassword = 'password123'
  const staffFullName = 'Demo Staff'

  const agencyRows = await query<{ id: number }>('SELECT id FROM agencies WHERE name = $1', [agencyName])
  const agencyId =
    agencyRows[0]?.id ??
    (await query<{ id: number }>(
      'INSERT INTO agencies (name, type, city) VALUES ($1, $2, $3) RETURNING id',
      [agencyName, agencyType, agencyCity]
    ))[0].id

  const roleRows = await query<{ id: number }>('SELECT id FROM roles WHERE name = $1', ['agency_staff'])
  const roleId = roleRows[0]?.id
  if (!roleId) {
    throw new Error('Role agency_staff missing')
  }

  const userRows = await query<{ id: number }>('SELECT id FROM users WHERE email = $1', [staffEmail])
  const userId =
    userRows[0]?.id ??
    (await query<{ id: number }>(
      `INSERT INTO users (full_name, email, password_hash, role_id, verification_status)
       VALUES ($1, $2, $3, $4, 'verified')
       RETURNING id`,
      [staffFullName, staffEmail, await bcrypt.hash(staffPassword, 10), roleId]
    ))[0].id

  await query(
    `INSERT INTO agency_staff (user_id, agency_id, role_in_agency)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId, agencyId, 'staff']
  )
}
