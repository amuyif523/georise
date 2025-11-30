import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { sign, verify, type JwtPayload, type Secret, type SignOptions } from 'jsonwebtoken'
import { query } from '../../config/db'
import type { AuthUser, LoginInput, RegisterInput, RoleRecord, UserRecord } from './types'

const DEFAULT_ROLE = 'citizen'
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10)
const JWT_SECRET: Secret = process.env.JWT_SECRET || ''
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

const revokedJtis = new Set<string>()

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required')
}

async function getRoleByName(name: string): Promise<RoleRecord | null> {
  const rows = await query<RoleRecord>('SELECT * FROM roles WHERE name = $1', [name])
  return rows[0] ?? null
}

function toAuthUser(user: UserRecord, roleName: string): AuthUser {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    role: roleName,
    verificationStatus: user.verification_status,
  }
}

export async function register(input: RegisterInput): Promise<{ token: string; user: AuthUser }> {
  const roleName = input.role || DEFAULT_ROLE
  if (!input.email && !input.phone) {
    throw new Error('Email or phone is required')
  }
  const role = await getRoleByName(roleName)
  if (!role) {
    throw new Error('Invalid role')
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS)

  const rows = await query<UserRecord>(
    `INSERT INTO users (full_name, email, phone, password_hash, role_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [input.fullName, input.email ?? null, input.phone ?? null, passwordHash, role.id]
  )

  const user = rows[0]
  const token = signToken(user.id, role.name)
  return { token, user: toAuthUser(user, role.name) }
}

export async function login(input: LoginInput): Promise<{ token: string; user: AuthUser }> {
  const rows = await query<UserRecord & { role_name: string }>(
    `SELECT u.*, r.name as role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE (u.email = $1 OR u.phone = $1)
     LIMIT 1`,
    [input.identifier]
  )

  const user = rows[0]
  if (!user) {
    throw new Error('Invalid credentials')
  }

  const ok = await bcrypt.compare(input.password, user.password_hash)
  if (!ok) {
    throw new Error('Invalid credentials')
  }

  const token = signToken(user.id, user.role_name)
  return { token, user: toAuthUser(user, user.role_name) }
}

export async function getUserById(userId: number): Promise<AuthUser | null> {
  const rows = await query<UserRecord & { role_name: string }>(
    `SELECT u.*, r.name as role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1`,
    [userId]
  )
  const user = rows[0]
  if (!user) return null
  return toAuthUser(user, user.role_name)
}

export function signToken(userId: number, role: string): string {
  const jti = randomUUID()
  return sign({ sub: userId, role, jti }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] })
}

export function signRefreshToken(userId: number, role: string): string {
  const jti = randomUUID()
  return sign({ sub: userId, role, jti }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] })
}

export function revokeTokenJti(jti: string | undefined) {
  if (jti) revokedJtis.add(jti)
}

export function verifyToken(token: string): { userId: number; role: string; jti?: string } {
  const payload = verify(token, JWT_SECRET) as JwtPayload & { role?: string }
  if (payload.jti && revokedJtis.has(payload.jti)) throw new Error('Revoked token')
  return { userId: Number(payload.sub), role: String(payload.role) }
}

export function rotateToken(token: string): { token: string; refresh: string } | null {
  try {
    const payload = verify(token, JWT_SECRET) as JwtPayload & { role?: string }
    if (payload.jti && revokedJtis.has(payload.jti)) return null
    const userId = Number(payload.sub)
    const role = String(payload.role)
    const newAccess = signToken(userId, role)
    const newRefresh = signRefreshToken(userId, role)
    if (payload.jti) revokedJtis.add(payload.jti)
    return { token: newAccess, refresh: newRefresh }
  } catch {
    return null
  }
}
