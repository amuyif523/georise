import { randomUUID } from 'crypto'
import { type NextFunction, type Request, type Response } from 'express'

export function withCorrelationId(req: Request, res: Response, next: NextFunction) {
  const headerId = req.header('x-request-id')
  const correlationId: string = headerId && headerId.trim().length > 0 ? headerId.trim() : randomUUID()
  ;(res.locals as { correlationId: string }).correlationId = correlationId
  res.setHeader('x-request-id', correlationId)
  next()
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const started = Date.now()
  const method = req.method
  const url = req.originalUrl
  res.on('finish', () => {
    const duration = Date.now() - started
    const cid = (res.locals as { correlationId?: string }).correlationId
    const status = res.statusCode
    // Keep logging minimal; avoids leaking sensitive data
    console.log(`[${cid}] ${method} ${url} -> ${status} (${duration}ms)`)
  })
  next()
}
