import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { query, pool } from '../config/db'

dotenv.config()

async function seed() {
  // seed roles ensured by init
  const adminEmail = 'admin@example.com'
  const adminPassword = 'admin123'
  const adminName = 'Demo Admin'

  const adminRole = await query<{ id: number }>('SELECT id FROM roles WHERE name = $1', ['admin'])
  const adminRoleId = adminRole[0]?.id
  if (!adminRoleId) {
    throw new Error('Admin role missing')
  }

  const userRows = await query<{ id: number }>('SELECT id FROM users WHERE email = $1', [adminEmail])
  if (!userRows[0]) {
    await query(
      `INSERT INTO users (full_name, email, password_hash, role_id, verification_status)
       VALUES ($1, $2, $3, $4, 'verified')`,
      [adminName, adminEmail, await bcrypt.hash(adminPassword, 10), adminRoleId]
    )
    console.log('Seeded admin user:', adminEmail, 'pwd:', adminPassword)
  } else {
    console.log('Admin user already exists:', adminEmail)
  }

  // seed a few incidents for demo agency
  const agencyRows = await query<{ id: number }>('SELECT id FROM agencies LIMIT 1')
  const agencyId = agencyRows[0]?.id
  const citizen = await query<{ id: number }>(
    `SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'citizen') LIMIT 1`
  )
  const citizenId = citizen[0]?.id
  if (agencyId && citizenId) {
    await query(
      `INSERT INTO incidents (reporter_id, description, category, status, assigned_agency_id)
       VALUES ($1, 'Demo fire near stadium', 'fire', 'assigned', $2)
       ON CONFLICT DO NOTHING`,
      [citizenId, agencyId]
    )
  }
}

seed()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
  })
