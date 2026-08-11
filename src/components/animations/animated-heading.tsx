import { useEffect, useRef, useState } from 'react'

/**
 * A heading whose words rise in one after another when it scrolls into view,
 * with a small overshoot at the end of each word's travel. Pixel words start
 * on the accent orange and settle to white, so there's a colour beat as well
 * as movement.
 *
 * Segments let the caller keep the pixel-face words and the line breaks that
 * the copy needs:
 *   segments={["A CRM YOU", { text: 'OWN', pixel: true, after: ',' }, '\n', 'NOT SUBSCRIBE TO']}
 */
export type HeadingSegment =
  | string
  | { text: string; pixel?: boolean; after?: string }

interface AnimatedHeadingProps {
  segments: HeadingSegment[]
  className?: string
  /** ms between each word starting. */
  stagger?: number
}

export function AnimatedHeading({
  segments,
  className,
  stagger = 55,
}: AnimatedHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Already on screen at mount (or no IO support): reveal straight away, so a
    // heading above the fold can never sit there invisible waiting for a scroll.
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setInView(true)
      return
    }
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      // Fire a little before the heading is fully in view so the motion is
      // already underway by the time it's centred.
      { rootMargin: '0px 0px -12% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Flatten segments into individual words so each can carry its own delay.
  let wordIndex = 0
  const nodes: React.ReactNode[] = []

  segments.forEach((segment, si) => {
    if (segment === '\n') {
      nodes.push(<br key={`br-${si}`} />)
      return
    }
    const isObj = typeof segment !== 'string'
    const text = isObj ? segment.text : segment
    const pixel = isObj ? !!segment.pixel : false
    const after = isObj ? segment.after : undefined
    const words = text.split(/\s+/).filter(Boolean)

    words.forEach((word, wi) => {
      const isLastWord = wi === words.length - 1
      nodes.push(
        <span
          key={`w-${si}-${wi}`}
          className={`reveal-word${pixel ? ' is-pixel pixel-word' : ''}`}
          style={{ animationDelay: `${wordIndex * stagger}ms` }}
        >
          {word}
          {isLastWord && after ? after : ''}
        </span>,
      )
      // Real space between words so line breaking still works normally.
      nodes.push(<span key={`s-${si}-${wi}`}> </span>)
      wordIndex += 1
    })
  })

  return (
    <h2 ref={ref} className={className} data-inview={inView ? 'true' : 'false'}>
      {nodes}
    </h2>
  )
}
