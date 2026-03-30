'use client'

import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'

interface ClipPathItem {
  imageUrl: string
  clipId: string
}

interface ClipPathRevealProps {
  items: ClipPathItem[]
  activeIndex: number
}

export function ClipPathReveal({ items, activeIndex }: ClipPathRevealProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const ctx = gsap.context(() => {
      // Kill any running timeline
      tlRef.current?.kill()

      const item = items[activeIndex]
      if (!item) return

      // Update image href and clip-path
      const image = svg.querySelector('#reveal-image') as SVGImageElement
      if (image) {
        image.setAttribute('href', item.imageUrl)
        image.setAttribute('clip-path', `url(#${item.clipId})`)
      }

      // Get the shapes inside the active clip-path
      const clipPath = svg.querySelector(`#${item.clipId}`)
      if (!clipPath) return
      const shapes = clipPath.children

      // Animate: scale in with stagger
      gsap.set(shapes, {
        scale: 0,
        transformOrigin: 'center center',
      })

      tlRef.current = gsap.timeline()
      tlRef.current.to(shapes, {
        scale: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: 'back.out(1.7)',
      })
    }, svg)

    return () => ctx.revert()
  }, [activeIndex, items])

  return (
    <div className="relative flex items-center justify-center">
      {/* Purple glow background */}
      <div className="absolute inset-0 bg-[#8B5CF6]/5 rounded-full blur-3xl" />

      <svg
        ref={svgRef}
        viewBox="0 0 500 500"
        className="relative w-full aspect-square max-w-[500px]"
      >
        <defs>
          {/* clip-original: 2×2 rounded squares */}
          <clipPath id="clip-original">
            <rect x="20" y="20" width="220" height="220" rx="24" />
            <rect x="260" y="20" width="220" height="220" rx="24" />
            <rect x="20" y="260" width="220" height="220" rx="24" />
            <rect x="260" y="260" width="220" height="220" rx="24" />
          </clipPath>

          {/* clip-hexagons: 6 rounded rects (bento layout) */}
          <clipPath id="clip-hexagons">
            <rect x="20" y="20" width="200" height="280" rx="12" />
            <rect x="20" y="320" width="200" height="160" rx="12" />
            <rect x="240" y="20" width="240" height="140" rx="12" />
            <rect x="240" y="180" width="110" height="160" rx="12" />
            <rect x="370" y="180" width="110" height="160" rx="12" />
            <rect x="240" y="360" width="240" height="120" rx="12" />
          </clipPath>

          {/* clip-pixels: 3×3 grid */}
          <clipPath id="clip-pixels">
            {Array.from({ length: 9 }, (_, i) => (
              <rect
                key={i}
                x={(i % 3) * 160 + 20}
                y={Math.floor(i / 3) * 160 + 20}
                width={140}
                height={140}
                rx={4}
              />
            ))}
          </clipPath>
        </defs>

        <image
          id="reveal-image"
          x="0"
          y="0"
          width="500"
          height="500"
          preserveAspectRatio="xMidYMid slice"
          href={items[0]?.imageUrl ?? ''}
          clipPath={`url(#${items[0]?.clipId ?? 'clip-original'})`}
        />

        {/* Light purple overlay for first two images */}
        {activeIndex < 2 && (
          <rect
            x="0"
            y="0"
            width="500"
            height="500"
            fill="#8B5CF6"
            opacity="0.25"
            clipPath={`url(#${items[activeIndex]?.clipId ?? 'clip-original'})`}
            style={{ pointerEvents: 'none' }}
          />
        )}
      </svg>
    </div>
  )
}
