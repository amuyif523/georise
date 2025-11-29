import fs from 'fs'
import path from 'path'
import { pool, query } from '../config/db'

type MigrationRow = { name: string }

export async function runMigrations() {
  await query(
    `CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY,
      run_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`
  )

  const dir = path.join(process.cwd(), 'migrations')
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()
  const appliedRows = await query<MigrationRow>('SELECT name FROM migrations')
  const applied = new Set(appliedRows.map((r: MigrationRow) => r.name))

  for (const file of files) {
    if (applied.has(file)) continue
    const sql = fs.readFileSync(path.join(dir, file), 'utf-8')
    console.log(`Running migration: ${file}`)
    await pool.query(sql)
    await query('INSERT INTO migrations (name) VALUES ($1)', [file])
  }
}
