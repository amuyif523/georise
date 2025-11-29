import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { query, pool } from '../config/db'

dotenv.config()

export async function seedDemo() {
  const roles = await query<{ id: number; name: string }>('SELECT id, name FROM roles')
  const roleId = (name: string) => roles.find((r) => r.name === name)?.id
  const adminRoleId = roleId('admin')
  const agencyRoleId = roleId('agency_staff')
  const citizenRoleId = roleId('citizen')
  if (!adminRoleId || !agencyRoleId || !citizenRoleId) throw new Error('Required roles missing')

  // Admin
  const adminEmail = 'admin@example.com'
  const adminPassword = 'admin123'
  await query(
    `INSERT INTO users (full_name, email, password_hash, role_id, verification_status)
     VALUES ($1, $2, $3, $4, 'verified')
     ON CONFLICT (email) DO NOTHING`,
    ['Demo Admin', adminEmail, await bcrypt.hash(adminPassword, 10), adminRoleId]
  )

  // Agency + staff
  const [agency] = await query<{ id: number }>(
    `INSERT INTO agencies (name, type, city)
     VALUES ('Demo Agency', 'fire', 'Addis Ababa')
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`
  )
  const agencyId = agency.id

  const staffEmail = 'staff@example.com'
  const staffPassword = 'staff123'
  const staffUser = await query<{ id: number }>(
    `INSERT INTO users (full_name, email, password_hash, role_id, verification_status)
     VALUES ($1, $2, $3, $4, 'verified')
     ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
     RETURNING id`,
    ['Agency Staff', staffEmail, await bcrypt.hash(staffPassword, 10), agencyRoleId]
  )
  await query(
    `INSERT INTO agency_staff (user_id, agency_id, role_in_agency)
     VALUES ($1, $2, 'operator')
     ON CONFLICT (user_id) DO UPDATE SET agency_id = EXCLUDED.agency_id`,
    [staffUser[0].id, agencyId]
  )

  // Citizens
  const verifiedEmail = 'citizen.verified@example.com'
  const unverifiedEmail = 'citizen.unverified@example.com'
  const citizenPassword = 'citizen123'
  const verifiedUser = await query<{ id: number }>(
    `INSERT INTO users (full_name, email, password_hash, role_id, verification_status)
     VALUES ($1, $2, $3, $4, 'verified')
     ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
     RETURNING id`,
    ['Verified Citizen', verifiedEmail, await bcrypt.hash(citizenPassword, 10), citizenRoleId]
  )
  await query<{ id: number }>(
    `INSERT INTO users (full_name, email, password_hash, role_id, verification_status)
     VALUES ($1, $2, $3, $4, 'pending')
     ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
     RETURNING id`,
    ['Unverified Citizen', unverifiedEmail, await bcrypt.hash(citizenPassword, 10), citizenRoleId]
  )

  // Seed incidents for verified citizen with lat/lng
  const reporterId = verifiedUser[0].id
  const demoIncidents = [
    { desc: 'Demo fire near stadium', category: 'fire', status: 'assigned', lat: 9.0108, lng: 38.7613 },
    { desc: 'Road accident at CMC', category: 'accident', status: 'verified', lat: 9.0301, lng: 38.8005 },
    { desc: 'Medical emergency at Bole', category: 'medical', status: 'submitted', lat: 9.008, lng: 38.788 },
  ]
  for (const inc of demoIncidents) {
    await query(
      `INSERT INTO incidents (reporter_id, description, category, status, assigned_agency_id, lat, lng, geom)
       VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($7, $6), 4326))
       ON CONFLICT DO NOTHING`,
      [reporterId, inc.desc, inc.category, inc.status, agencyId, inc.lat, inc.lng]
    )
  }

  console.log('Seeded demo data:')
  console.log(` admin: ${adminEmail} / ${adminPassword}`)
  console.log(` agency staff: ${staffEmail} / ${staffPassword}`)
  console.log(` citizen (verified): ${verifiedEmail} / ${citizenPassword}`)
  console.log(` citizen (unverified): ${unverifiedEmail} / ${citizenPassword}`)
}

seedDemo()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
  })
