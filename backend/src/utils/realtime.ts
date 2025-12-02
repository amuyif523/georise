import { Response, Request, Router } from 'express'
import { EventEmitter } from 'events'
import { verifyToken } from '../modules/auth/service'

type EventPayload = { type: string; data: unknown }

const bus = new EventEmitter()
bus.setMaxListeners(0)

export function emitEvent(type: string, data: unknown) {
  bus.emit('event', { type, data })
}

const clients = new Set<Response>()

function send(res: Response, payload: EventPayload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`)
}

export const realtimeRouter = Router()

realtimeRouter.get('/stream', (req: Request, res: Response) => {
  // allow Bearer header or ?token=... for EventSource (no custom headers)
  const header = req.headers.authorization
  const token = header?.toLowerCase().startsWith('bearer ') ? header.slice(7) : (req.query.token as string | undefined)
  if (!token) return res.status(401).end()
  try {
    verifyToken(token)
  } catch {
    return res.status(401).end()
  }
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const onEvent = (payload: EventPayload) => send(res, payload)
  bus.on('event', onEvent)
  clients.add(res)

  // heartbeat every 20s
  const heartbeat = setInterval(() => {
    res.write(':heartbeat\n\n')
  }, 20_000)

  req.on('close', () => {
    clearInterval(heartbeat)
    bus.off('event', onEvent)
    clients.delete(res)
  })
})
