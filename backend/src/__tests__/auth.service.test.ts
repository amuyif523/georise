import { describe, it, expect, beforeEach, beforeAll, jest } from '@jest/globals'
import * as db from '../config/db'

jest.mock('../config/db', () => ({
  query: jest.fn(),
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashed_pw')),
  compare: jest.fn((pw: string) => Promise.resolve(pw === 'correct')),
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn(() => ({ sub: '1', role: 'citizen' })),
}))

const mockQuery = db.query as jest.MockedFunction<typeof db.query>
let register: typeof import('../modules/auth/service').register
let login: typeof import('../modules/auth/service').login

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret'
  const svc = await import('../modules/auth/service')
  register = svc.register
  login = svc.login
})

describe('auth.service register/login', () => {
  beforeEach(() => {
    mockQuery.mockReset()
  })

  it('registers with default citizen role and returns token + user', async () => {
    mockQuery
      .mockResolvedValueOnce([{ id: 1, name: 'citizen' }]) // getRoleByName
      .mockResolvedValueOnce([
        {
          id: 10,
          full_name: 'Test User',
          email: 'test@example.com',
          phone: null,
          password_hash: 'hashed_pw',
          role_id: 1,
          verification_status: 'pending',
          created_at: new Date(),
        },
      ])

    const result = await register({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'correct',
      phone: undefined,
    })

    expect(result.token).toBe('signed-token')
    expect(result.user.role).toBe('citizen')
    expect(mockQuery).toHaveBeenCalledTimes(2)
  })

  it('fails register when role is invalid', async () => {
    mockQuery.mockResolvedValueOnce([]) // getRoleByName
    await expect(
      register({ fullName: 'No Role', email: 'x@y.com', password: 'pw', phone: undefined, role: 'ghost' })
    ).rejects.toThrow('Invalid role')
  })

  it('denies login with wrong password', async () => {
    mockQuery.mockResolvedValueOnce([
      {
        id: 11,
        full_name: 'Test User',
        email: 'user@example.com',
        phone: null,
        password_hash: 'hashed_pw',
        role_id: 1,
        role_name: 'citizen',
        verification_status: 'pending',
        created_at: new Date(),
      },
    ])

    await expect(login({ identifier: 'user@example.com', password: 'wrong' })).rejects.toThrow(
      'Invalid credentials'
    )
  })

  it('logs in with correct password', async () => {
    mockQuery.mockResolvedValueOnce([
      {
        id: 11,
        full_name: 'Test User',
        email: 'user@example.com',
        phone: null,
        password_hash: 'hashed_pw',
        role_id: 1,
        role_name: 'citizen',
        verification_status: 'pending',
        created_at: new Date(),
      },
    ])

    const result = await login({ identifier: 'user@example.com', password: 'correct' })
    expect(result.token).toBe('signed-token')
    expect(result.user.role).toBe('citizen')
  })
})
