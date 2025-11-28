export type UserRecord = {
  id: number
  full_name: string
  email: string | null
  phone: string | null
  password_hash: string
  role_id: number
  created_at: Date
}

export type RoleRecord = {
  id: number
  name: string
}

export type AuthUser = {
  id: number
  fullName: string
  email: string | null
  phone: string | null
  role: string
}

export type RegisterInput = {
  fullName: string
  email?: string
  phone?: string
  password: string
  role?: string
}

export type LoginInput = {
  identifier: string
  password: string
}
