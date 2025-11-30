import { useState } from 'react'

type Notification = {
  id: number
  title: string
  body: string
  read: boolean
  time: string
}

const demoNotifications: Notification[] = [
  { id: 1, title: 'New incident assigned', body: 'Incident #12 assigned to your agency.', read: false, time: 'Now' },
  { id: 2, title: 'AI review needed', body: 'Low-confidence classification for incident #10.', read: false, time: '5m ago' },
  { id: 3, title: 'Status updated', body: 'Incident #5 marked resolved.', read: true, time: '1h ago' },
]

export default function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>(demoNotifications)

  const unread = items.filter((n) => !n.read).length

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })))

  return (
    <div className="relative">
      <button
        className="relative text-slate-200 hover:text-cyan-300"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] px-1 rounded-full">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded shadow-xl z-40">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
            <p className="text-sm text-slate-200">Notifications</p>
            <button className="text-xs text-cyan-300 hover:text-cyan-200" onClick={markAllRead}>
              Mark all read
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {items.length === 0 && <p className="text-sm text-slate-400 px-3 py-2">No notifications</p>}
            {items.map((n) => (
              <div
                key={n.id}
                className={`px-3 py-2 border-b border-slate-800 ${n.read ? 'text-slate-400' : 'text-slate-100 bg-slate-800/50'}`}
              >
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="text-xs">{n.body}</p>
                <p className="text-[11px] text-slate-500">{n.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
