import { Request, Response, NextFunction, Router } from 'express'

type Counter = { count: number; totalMs: number }
const counters: Record<string, Counter> = {}

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint()
  res.on('finish', () => {
    const end = process.hrtime.bigint()
    const ms = Number(end - start) / 1_000_000
    const key = `${req.method} ${req.path}`
    const bucket = (counters[key] = counters[key] || { count: 0, totalMs: 0 })
    bucket.count += 1
    bucket.totalMs += ms
  })
  next()
}

export const metricsRouter = Router()
metricsRouter.get('/', (_req, res) => {
  res.json({ status: 'ok', metrics: counters })
})
