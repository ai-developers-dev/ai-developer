import { useRef, useEffect } from 'react'
import { animate } from 'motion/react'

interface StaggerChildrenProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export function StaggerChildren({
  children,
  className,
  staggerDelay = 0.15,
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Get direct children that are stagger items
    const items = Array.from(el.children) as HTMLElement[]

    // Set hidden state imperatively
    items.forEach((item) => {
      item.style.opacity = '0'
      item.style.transform = 'translateY(30px)'
    })

    const animateItems = () => {
      items.forEach((item, i) => {
        animate(
          item,
          { opacity: 1, transform: 'translateY(0px)' },
          { duration: 0.5, delay: i * staggerDelay, ease: 'easeOut' }
        )
      })
    }

    // Check if already in viewport
    const rect = el.getBoundingClientRect()
    const alreadyVisible = rect.top < window.innerHeight + 80 && rect.bottom > 0

    if (alreadyVisible) {
      animateItems()
      return
    }

    // Below viewport — animate when scrolled into view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animateItems()
          observer.disconnect()
        }
      },
      { rootMargin: '-80px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [staggerDelay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
