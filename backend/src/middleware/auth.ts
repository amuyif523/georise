import { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../modules/auth/service'

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: number
      role: string
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const token = header.slice(7)
  try {
    const { userId, role } = verifyToken(token)
    req.user = { id: userId, role }
    return next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
