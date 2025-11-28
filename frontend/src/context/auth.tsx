/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { api } from '../lib/api'

type Role = 'citizen' | 'agency_staff' | 'admin'

type AuthUser = {
  id: number
  fullName: string
  email: string | null
  phone: string | null
  role: Role
  verificationStatus: string
}

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  login: (identifier: string, password: string) => Promise<void>
  register: (
    fullName: string,
    email: string | undefined,
    phone: string | undefined,
    password: string
  ) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const STORAGE_KEY = 'georise_auth'

type StoredAuth = {
  token: string
  user: AuthUser
}

function bootstrapAuth(): StoredAuth | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

function useAuthProvider() {
  const boot = bootstrapAuth()
  const [token, setToken] = useState<string | null>(boot?.token ?? null)
  const [user, setUser] = useState<AuthUser | null>(boot?.user ?? null)

  const persist = (payload: StoredAuth) => {
    setToken(payload.token)
    setUser(payload.user)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  const login = useCallback(async (identifier: string, password: string) => {
    const data = await api.post<{ token: string; user: AuthUser }>('/auth/login', { identifier, password })
    persist({ token: data.token, user: data.user })
  }, [])

  const register = useCallback(
    async (fullName: string, email: string | undefined, phone: string | undefined, password: string) => {
      const data = await api.post<{ token: string; user: AuthUser }>('/auth/register', {
        fullName,
        email,
        phone,
        password,
      })
      persist({ token: data.token, user: data.user })
    },
    []
  )

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo(
    () => ({ user, token, login, register, logout }),
    [user, token, login, register, logout]
  )

  return value
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = useAuthProvider()
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
