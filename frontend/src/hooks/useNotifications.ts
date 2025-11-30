import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/auth'

export type NotificationItem = {
  id: number
  title: string
  body: string
  read: boolean
  time: string
}

export function useNotifications() {
  const { token } = useAuth()
  const [items, setItems] = useState<NotificationItem[]>([])

  useEffect(() => {
    const load = async () => {
      if (!token) return
      try {
        const res = await api.get<{ notifications: NotificationItem[] }>('/notifications', token)
        setItems(res.notifications || [])
      } catch {
        // fallback to empty or keep previous; avoid crashing if endpoint not ready
      }
    }
    void load()
  }, [token])

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })))

  return { items, setItems, markAllRead }
}
