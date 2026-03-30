import { useRef, useEffect } from 'react'
import { animate } from 'motion/react'

type Direction = 'up' | 'down' | 'left' | 'right'

interface FadeInViewProps {
  children: React.ReactNode
  direction?: Direction
  delay?: number
  duration?: number
  className?: string
}

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
}

export function FadeInView({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className,
}: FadeInViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const offset = offsets[direction]

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Set hidden state imperatively (no inline styles in SSR)
    el.style.opacity = '0'
    el.style.transform = `translateX(${offset.x}px) translateY(${offset.y}px)`

    // Check if already in viewport — if so, animate immediately
    const rect = el.getBoundingClientRect()
    const alreadyVisible = rect.top < window.innerHeight + 80 && rect.bottom > 0

    if (alreadyVisible) {
      animate(
        el,
        { opacity: 1, transform: 'translateX(0px) translateY(0px)' },
        { duration, delay, ease: 'easeOut' }
      )
      return
    }

    // Below viewport — animate when scrolled into view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate(
            el,
            { opacity: 1, transform: 'translateX(0px) translateY(0px)' },
            { duration, delay, ease: 'easeOut' }
          )
          observer.disconnect()
        }
      },
      { rootMargin: '-80px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [offset.x, offset.y, duration, delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
