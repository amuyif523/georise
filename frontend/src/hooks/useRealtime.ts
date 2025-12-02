import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/auth'

type RealtimeEvent = { type: string; data: unknown }

export function useRealtime(onEvent: (evt: RealtimeEvent) => void) {
  const { token } = useAuth()
  const [connected, setConnected] = useState(false)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!token) return
    const src = new EventSource(`${import.meta.env.VITE_API_URL || ''}/realtime/stream?token=${token}`)
    esRef.current = src
    src.onopen = () => setConnected(true)
    src.onerror = () => {
      setConnected(false)
    }
    src.onmessage = (evt) => {
      try {
        const payload = JSON.parse(evt.data)
        onEvent(payload)
      } catch {
        /* ignore */
      }
    }
    return () => {
      setConnected(false)
      src.close()
      esRef.current = null
    }
  }, [token, onEvent])

  return { connected }
}
