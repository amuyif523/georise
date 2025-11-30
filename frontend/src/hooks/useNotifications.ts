import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/auth'

export type NotificationItem = {
  id: number
  title: string
  body: string
  status?: string
  read: boolean
  created_at?: string
}

export function useNotifications() {
  const { token } = useAuth()
  const [items, setItems] = useState<NotificationItem[]>([])

  const load = async () => {
    if (!token) return
    try {
      const res = await api.get<{ notifications: NotificationItem[] }>('/notifications', token)
      setItems(res.notifications || [])
    } catch {
      // fallback to empty or keep previous; avoid crashing if endpoint not ready
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const markAllRead = async () => {
    if (!token) {
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
      return
    }
    try {
      await api.post('/notifications/read-all', {}, token)
      await load()
    } catch {
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    }
  }

  return { items, setItems, markAllRead }
}
