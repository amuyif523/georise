import { Request, Response } from 'express'
import { login, register } from './service'

export async function registerHandler(req: Request, res: Response) {
  try {
    const result = await register(req.body)
    res.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed'
    res.status(400).json({ error: message })
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const result = await login(req.body)
    res.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed'
    res.status(400).json({ error: message })
  }
}

export async function meHandler(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  res.json({ user: req.user })
}
