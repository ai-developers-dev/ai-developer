import { useRef, useEffect } from 'react'

/* ─── Types ─── */
interface StreamPoint { x: number; y: number }

interface DataStream {
  points: StreamPoint[]
  width: number
  opacity: number
  speed: number
  phase: number
  hueShift: number // 0 = primary, 1 = tertiary
}

interface Pulse {
  stream: number
  progress: number
  speed: number
  size: number
  brightness: number
}

interface CircuitTrace {
  segments: StreamPoint[]
  opacity: number
}

interface FloatingText {
  text: string
  x: number
  y: number
  opacity: number
  speed: number
  phase: number
  size: number
}

interface Particle {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  phase: number
}

/* ─── Helpers ─── */
function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  const n = parseInt(hex, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/* ─── Generators ─── */
function createStreams(w: number, h: number, count: number): DataStream[] {
  const streams: DataStream[] = []
  for (let i = 0; i < count; i++) {
    const yBase = h * 0.15 + (h * 0.7) * (i / (count - 1))
    const points: StreamPoint[] = []
    const steps = 80
    for (let s = 0; s <= steps; s++) {
      points.push({
        x: (s / steps) * (w + 200) - 100,
        y: yBase,
      })
    }
    streams.push({
      points,
      width: 0.5 + Math.random() * 0.8,
      opacity: 0.02 + Math.random() * 0.04,
      speed: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      hueShift: Math.random() > 0.7 ? 1 : 0,
    })
  }
  return streams
}

function createCircuitTraces(w: number, h: number, count: number): CircuitTrace[] {
  const traces: CircuitTrace[] = []
  for (let i = 0; i < count; i++) {
    const segments: StreamPoint[] = []
    let x = w * 0.3 + Math.random() * w * 0.7
    let y = Math.random() * h
    const numSegments = 3 + Math.floor(Math.random() * 5)
    segments.push({ x, y })
    for (let s = 0; s < numSegments; s++) {
      // Circuit traces move in right angles
      if (Math.random() > 0.5) {
        x += (Math.random() > 0.5 ? 1 : -1) * (40 + Math.random() * 120)
      } else {
        y += (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 80)
      }
      segments.push({ x: Math.max(0, Math.min(w, x)), y: Math.max(0, Math.min(h, y)) })
    }
    traces.push({ segments, opacity: 0.015 + Math.random() * 0.02 })
  }
  return traces
}

const codeSnippets = [
  '<ai/>',
  'neural.init()',
  'async deploy()',
  'model.train()',
  'data.process()',
  '<dev/>',
  'import { AI }',
  'pipeline.run()',
  'agent.start()',
  'build()',
]

function createFloatingTexts(w: number, h: number, count: number): FloatingText[] {
  return Array.from({ length: count }, () => ({
    text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
    x: w * 0.4 + Math.random() * w * 0.6,
    y: Math.random() * h,
    opacity: 0.02 + Math.random() * 0.03,
    speed: 0.1 + Math.random() * 0.2,
    phase: Math.random() * Math.PI * 2,
    size: 10 + Math.random() * 4,
  }))
}

function createParticles(w: number, h: number, count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: 0.8 + Math.random() * 1.5,
    opacity: 0.03 + Math.random() * 0.07,
    speed: 0.2 + Math.random() * 0.4,
    phase: Math.random() * Math.PI * 2,
  }))
}

/* ─── Component ─── */
export function NeuralNetworkBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.innerWidth < 768

    let w = 0, h = 0
    let streams: DataStream[] = []
    let pulses: Pulse[] = []
    let traces: CircuitTrace[] = []
    let texts: FloatingText[] = []
    let particles: Particle[] = []
    let animId = 0
    let time = 0

    function init() {
      const rect = canvas!.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      const streamCount = isMobile ? 6 : 12
      const traceCount = isMobile ? 8 : 20
      const textCount = isMobile ? 4 : 8
      const particleCount = isMobile ? 30 : 70

      streams = createStreams(w, h, streamCount)
      traces = createCircuitTraces(w, h, traceCount)
      texts = createFloatingTexts(w, h, textCount)
      particles = createParticles(w, h, particleCount)
      pulses = []
    }

    function getColors() {
      const isDark = document.documentElement.classList.contains('dark')
      const s = getComputedStyle(document.documentElement)
      const primary = s.getPropertyValue('--brand-primary').trim() || '#d4cebb'
      const tertiary = s.getPropertyValue('--brand-tertiary').trim() || '#ffc640'
      // Light mode needs stronger opacity — dark colors on light bg have less contrast
      const boost = isDark ? 1 : 2.5
      return { primary: hexToRgb(primary), tertiary: hexToRgb(tertiary), boost }
    }

    function drawCircuitTraces(colors: ReturnType<typeof getColors>) {
      const [r, g, b] = colors.primary
      const b2 = colors.boost
      for (const trace of traces) {
        ctx!.beginPath()
        for (let i = 0; i < trace.segments.length; i++) {
          const seg = trace.segments[i]
          if (i === 0) ctx!.moveTo(seg.x, seg.y)
          else ctx!.lineTo(seg.x, seg.y)
        }
        ctx!.strokeStyle = `rgba(${r},${g},${b},${trace.opacity * b2})`
        ctx!.lineWidth = 0.5
        ctx!.stroke()

        // Small node at each corner
        for (const seg of trace.segments) {
          ctx!.beginPath()
          ctx!.arc(seg.x, seg.y, 1.5, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${r},${g},${b},${trace.opacity * b2})`
          ctx!.fill()
        }
      }
    }

    function drawStreams(colors: ReturnType<typeof getColors>) {
      const { primary, tertiary, boost: b2 } = colors
      for (const stream of streams) {
        const [r, g, b] = stream.hueShift > 0.5 ? tertiary : primary

        ctx!.beginPath()
        const pts = stream.points
        for (let i = 0; i < pts.length; i++) {
          const t = i / (pts.length - 1)
          const waveY = pts[i].y +
            Math.sin(time * stream.speed + stream.phase + t * 6) * (40 + stream.phase * 10) +
            Math.sin(time * stream.speed * 0.5 + t * 3) * 20
          const x = pts[i].x
          if (i === 0) ctx!.moveTo(x, waveY)
          else ctx!.lineTo(x, waveY)
        }
        ctx!.strokeStyle = `rgba(${r},${g},${b},${stream.opacity * b2})`
        ctx!.lineWidth = stream.width
        ctx!.stroke()
      }
    }

    function getStreamPointAt(stream: DataStream, progress: number): StreamPoint {
      const pts = stream.points
      const idx = progress * (pts.length - 1)
      const i = Math.floor(idx)
      const f = idx - i
      const a = pts[Math.min(i, pts.length - 1)]
      const b = pts[Math.min(i + 1, pts.length - 1)]
      const t = (i + f) / (pts.length - 1)
      return {
        x: lerp(a.x, b.x, f),
        y: lerp(a.y, b.y, f) +
          Math.sin(time * stream.speed + stream.phase + t * 6) * (40 + stream.phase * 10) +
          Math.sin(time * stream.speed * 0.5 + t * 3) * 20,
      }
    }

    function drawPulses(colors: ReturnType<typeof getColors>) {
      const [r, g, b] = colors.tertiary
      const b2 = colors.boost
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]
        p.progress += p.speed
        if (p.progress >= 1) { pulses.splice(i, 1); continue }

        const stream = streams[p.stream]
        if (!stream) { pulses.splice(i, 1); continue }

        const pt = getStreamPointAt(stream, p.progress)
        const glow = Math.sin(p.progress * Math.PI) * p.brightness * b2

        // Outer glow
        const grad = ctx!.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, p.size * 4)
        grad.addColorStop(0, `rgba(${r},${g},${b},${glow * 0.2})`)
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx!.fillStyle = grad
        ctx!.fillRect(pt.x - p.size * 4, pt.y - p.size * 4, p.size * 8, p.size * 8)

        // Core
        ctx!.beginPath()
        ctx!.arc(pt.x, pt.y, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${r},${g},${b},${glow})`
        ctx!.fill()
      }

      // Spawn pulses
      if (Math.random() < 0.04 && streams.length > 0) {
        pulses.push({
          stream: Math.floor(Math.random() * streams.length),
          progress: 0,
          speed: 0.003 + Math.random() * 0.006,
          size: 1.5 + Math.random() * 1.5,
          brightness: 0.2 + Math.random() * 0.25,
        })
      }
    }

    function drawFloatingTexts(colors: ReturnType<typeof getColors>) {
      const [r, g, b] = colors.primary
      const b2 = colors.boost
      ctx!.font = '500 12px "Space Grotesk", monospace'
      for (const t of texts) {
        const y = t.y + Math.sin(time * t.speed + t.phase) * 8
        const x = t.x + Math.cos(time * t.speed * 0.5 + t.phase) * 5
        ctx!.fillStyle = `rgba(${r},${g},${b},${t.opacity * b2})`
        ctx!.fillText(t.text, x, y)
      }
    }

    function drawParticles(colors: ReturnType<typeof getColors>) {
      const { primary, tertiary, boost: b2 } = colors
      for (const p of particles) {
        const y = p.y + Math.sin(time * p.speed + p.phase) * 6
        const x = p.x + Math.cos(time * p.speed * 0.7 + p.phase) * 4
        const isAmber = Math.random() > 0.92
        const [r, g, b] = isAmber ? tertiary : primary
        ctx!.beginPath()
        // Mix of circles and tiny squares
        if (p.size > 2) {
          ctx!.rect(x - 1, y - 1, 2, 2)
        } else {
          ctx!.arc(x, y, p.size, 0, Math.PI * 2)
        }
        ctx!.fillStyle = `rgba(${r},${g},${b},${p.opacity * b2})`
        ctx!.fill()
      }
    }

    function animate() {
      if (document.hidden) { animId = requestAnimationFrame(animate); return }

      time += prefersReducedMotion ? 0 : 0.008
      const colors = getColors()

      ctx!.clearRect(0, 0, w, h)

      drawCircuitTraces(colors)
      drawStreams(colors)
      if (!prefersReducedMotion) drawPulses(colors)
      drawFloatingTexts(colors)
      drawParticles(colors)

      animId = requestAnimationFrame(animate)
    }

    init()
    const observer = new ResizeObserver(() => init())
    observer.observe(canvas)
    animId = requestAnimationFrame(animate)

    return () => { cancelAnimationFrame(animId); observer.disconnect() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  )
}
