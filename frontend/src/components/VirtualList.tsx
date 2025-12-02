import { useMemo, useRef, useState, useEffect, type ReactNode } from 'react'

type Props<T> = {
  items: T[]
  itemHeight: number
  height: number
  renderItem: (item: T, index: number) => ReactNode
}

export function VirtualList<T>({ items, itemHeight, height, renderItem }: Props<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => setScrollTop(el.scrollTop)
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const { start, end, offset } = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const visibleCount = Math.ceil(height / itemHeight) + 2
    const endIndex = Math.min(items.length, startIndex + visibleCount)
    const topOffset = startIndex * itemHeight
    return { start: startIndex, end: endIndex, offset: topOffset }
  }, [scrollTop, itemHeight, height, items.length])

  const slice = items.slice(start, end)

  return (
    <div
      ref={containerRef}
      style={{ height, overflowY: 'auto', position: 'relative' }}
      className="w-full border border-slate-800 rounded bg-slate-900/50"
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offset}px)` }}>
          {slice.map((item, idx) => (
            <div key={start + idx} style={{ height: itemHeight }}>
              {renderItem(item, start + idx)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
