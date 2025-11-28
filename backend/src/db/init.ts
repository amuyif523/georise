import { query } from '../config/db'

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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    `
  )

  for (const name of roleNames) {
    await query('INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING;', [name])
  }
}
