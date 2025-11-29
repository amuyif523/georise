import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { query, pool } from '../config/db'

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
     ON CONFLICT (email) DO UPDATE SET
       full_name = EXCLUDED.full_name,
       password_hash = EXCLUDED.password_hash,
       role_id = EXCLUDED.role_id,
       verification_status = 'verified'`,
    ['Demo Admin', adminEmail, await bcrypt.hash(adminPassword, 10), adminRoleId]
  )

  // Agencies + staff (multiple types)
  const agencies = [
    {
      name: 'Addis Police HQ',
      type: 'police',
      city: 'Addis Ababa',
      poly: 'MULTIPOLYGON(((38.74 9.02, 38.80 9.02, 38.80 9.07, 38.74 9.07, 38.74 9.02)))',
      staff: { fullName: 'Police Operator', email: 'police.staff@example.com', password: 'staff123' },
    },
    {
      name: 'Addis Fire Brigade',
      type: 'fire',
      city: 'Addis Ababa',
      poly: 'MULTIPOLYGON(((38.75 8.98, 38.82 8.98, 38.82 9.03, 38.75 9.03, 38.75 8.98)))',
      staff: { fullName: 'Fire Operator', email: 'fire.staff@example.com', password: 'staff123' },
    },
    {
      name: 'Addis Medical Response',
      type: 'medical',
      city: 'Addis Ababa',
      poly: 'MULTIPOLYGON(((38.70 9.00, 38.78 9.00, 38.78 9.05, 38.70 9.05, 38.70 9.00)))',
      staff: { fullName: 'Medical Operator', email: 'medical.staff@example.com', password: 'staff123' },
    },
    {
      name: 'Addis Defense Command',
      type: 'military',
      city: 'Addis Ababa',
      poly: 'MULTIPOLYGON(((38.68 8.99, 38.76 8.99, 38.76 9.04, 38.68 9.04, 38.68 8.99)))',
      staff: { fullName: 'Defense Operator', email: 'defense.staff@example.com', password: 'staff123' },
    },
  ]

  const agencyIds: number[] = []

  for (const ag of agencies) {
    const [row] = await query<{ id: number }>(
      `INSERT INTO agencies (name, type, city, jurisdiction_geom)
       VALUES ($1, $2, $3, ST_GeomFromText($4, 4326))
       ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, city = EXCLUDED.city, jurisdiction_geom = EXCLUDED.jurisdiction_geom
       RETURNING id`,
      [ag.name, ag.type, ag.city, ag.poly]
    )
    agencyIds.push(row.id)
    const staffUser = await query<{ id: number }>(
      `INSERT INTO users (full_name, email, password_hash, role_id, verification_status)
       VALUES ($1, $2, $3, $4, 'verified')
       ON CONFLICT (email) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         password_hash = EXCLUDED.password_hash,
         role_id = EXCLUDED.role_id,
         verification_status = 'verified'
       RETURNING id`,
      [ag.staff.fullName, ag.staff.email, await bcrypt.hash(ag.staff.password, 10), agencyRoleId]
    )
    await query(
      `INSERT INTO agency_staff (user_id, agency_id, role_in_agency)
       VALUES ($1, $2, 'operator')
       ON CONFLICT (user_id) DO UPDATE SET agency_id = EXCLUDED.agency_id`,
      [staffUser[0].id, row.id]
    )
  }

  // Citizens
  const verifiedEmail = 'citizen.verified@example.com'
  const unverifiedEmail = 'citizen.unverified@example.com'
  const citizenPassword = 'citizen123'
  const verifiedUser = await query<{ id: number }>(
    `INSERT INTO users (full_name, email, password_hash, role_id, verification_status)
     VALUES ($1, $2, $3, $4, 'verified')
     ON CONFLICT (email) DO UPDATE SET
       full_name = EXCLUDED.full_name,
       password_hash = EXCLUDED.password_hash,
       role_id = EXCLUDED.role_id,
       verification_status = 'verified'
     RETURNING id`,
    ['Verified Citizen', verifiedEmail, await bcrypt.hash(citizenPassword, 10), citizenRoleId]
  )
  await query<{ id: number }>(
    `INSERT INTO users (full_name, email, password_hash, role_id, verification_status)
     VALUES ($1, $2, $3, $4, 'pending')
     ON CONFLICT (email) DO UPDATE SET
       full_name = EXCLUDED.full_name,
       password_hash = EXCLUDED.password_hash,
       role_id = EXCLUDED.role_id,
       verification_status = 'pending'
     RETURNING id`,
    ['Unverified Citizen', unverifiedEmail, await bcrypt.hash(citizenPassword, 10), citizenRoleId]
  )

  // Seed incidents for verified citizen with lat/lng assigned to different agencies
  const reporterId = verifiedUser[0].id
  const demoIncidents = [
    { desc: 'Demo fire near stadium', category: 'fire', status: 'assigned', lat: 9.0108, lng: 38.7613, agencyType: 'fire' },
    { desc: 'Road accident at CMC', category: 'accident', status: 'verified', lat: 9.0301, lng: 38.8005, agencyType: 'police' },
    { desc: 'Medical emergency at Bole', category: 'medical', status: 'submitted', lat: 9.008, lng: 38.788, agencyType: 'medical' },
    { desc: 'Fire at Merkato market', category: 'fire', status: 'submitted', lat: 9.041, lng: 38.737, agencyType: 'fire' },
    { desc: 'Armed robbery alert near Mexico', category: 'crime', status: 'submitted', lat: 9.0105, lng: 38.7492, agencyType: 'police' },
    { desc: 'Mass casualty traffic crash on ring road', category: 'accident', status: 'verified', lat: 9.032, lng: 38.82, agencyType: 'medical' },
    { desc: 'Unidentified device reported', category: 'security', status: 'submitted', lat: 9.005, lng: 38.79, agencyType: 'military' },
    { desc: 'Building collapse near stadium', category: 'rescue', status: 'assigned', lat: 9.015, lng: 38.764, agencyType: 'fire' },
    { desc: 'Crowd control needed at Meskel Square', category: 'public order', status: 'submitted', lat: 9.009, lng: 38.761, agencyType: 'police' },
    { desc: 'Critical patient transfer from clinic', category: 'medical transport', status: 'responding', lat: 9.018, lng: 38.78, agencyType: 'medical' },
  ]
  for (const inc of demoIncidents) {
    const targetAgency = agencies.find((a) => a.type === inc.agencyType)
    const targetAgencyId =
      targetAgency && agencyIds[agencies.indexOf(targetAgency)] ? agencyIds[agencies.indexOf(targetAgency)] : null
    await query(
      `INSERT INTO incidents (reporter_id, description, category, status, assigned_agency_id, lat, lng, geom)
       VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($7, $6), 4326))
       ON CONFLICT DO NOTHING`,
      [reporterId, inc.desc, inc.category, inc.status, targetAgencyId, inc.lat, inc.lng]
    )
  }

  // Overlays: hospitals, police/fire stations, traffic closure (line), flood zone (polygon), water point
  await query(
    `INSERT INTO overlays (name, type, subtype, geom)
     VALUES
       ('Black Lion Hospital', 'hospital', 'tertiary', ST_SetSRID(ST_MakePoint(38.757, 9.013),4326)),
       ('Police Station - Mexico', 'police', 'station', ST_SetSRID(ST_MakePoint(38.744, 9.010),4326)),
       ('Fire Station - Stadium', 'fire', 'station', ST_SetSRID(ST_MakePoint(38.761, 9.016),4326)),
       ('Traffic Closure - Bole Rd', 'traffic', 'closure', ST_GeomFromText('LINESTRING(38.77 9.01, 38.775 9.018)',4326)),
       ('Flood Zone - River Patch', 'flood', 'zone', ST_GeomFromText('POLYGON((38.73 9.0,38.74 9.0,38.74 9.02,38.73 9.02,38.73 9.0))',4326)),
       ('Water Point - Ayat', 'water', 'hydrant', ST_SetSRID(ST_MakePoint(38.84, 9.05),4326))
     ON CONFLICT (name, type) DO NOTHING`
  )

  console.log('Seeded demo data:')
  console.log(` admin: ${adminEmail} / ${adminPassword}`)
  agencies.forEach((ag) => console.log(` ${ag.type} staff: ${ag.staff.email} / ${ag.staff.password}`))
  console.log(` citizen (verified): ${verifiedEmail} / ${citizenPassword}`)
  console.log(` citizen (unverified): ${unverifiedEmail} / ${citizenPassword}`)
}

// Allow standalone execution for manual seeding without affecting pool usage in-app
if (require.main === module) {
  seedDemo()
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
    .finally(async () => {
      await pool.end()
    })
}
