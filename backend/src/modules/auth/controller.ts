import { Request, Response } from 'express'
import { login, register } from './service'
import type { LoginInput, RegisterInput } from './types'

export async function registerHandler(req: Request, res: Response) {
  try {
    const body = req.body as RegisterInput
    if (!body.fullName || !body.password) {
      return res.status(400).json({ error: 'fullName and password are required' })
    }
    const result = await register(body)
    return res.status(201).json({ token: result.token, user: result.user })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed'
    return res.status(400).json({ error: message })
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const body = req.body as LoginInput
    if (!body.identifier || !body.password) {
      return res.status(400).json({ error: 'identifier and password are required' })
    }
    const result = await login(body)
    return res.json({ token: result.token, user: result.user })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed'
    return res.status(401).json({ error: message })
  }
}
