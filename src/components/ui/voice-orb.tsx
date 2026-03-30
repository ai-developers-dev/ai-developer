import { motion } from 'framer-motion'
import { Mic, Volume2 } from 'lucide-react'
import type { VoiceStatus } from '@/hooks/use-gemini-live.js'

interface VoiceOrbProps {
  status: VoiceStatus
  onClick: () => void
}

const ringVariants = {
  idle: {
    scale: [1, 1.05, 1],
    opacity: [0.3, 0.5, 0.3],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
  },
  connecting: {
    scale: [1, 1.1, 1],
    opacity: [0.2, 0.6, 0.2],
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const },
  },
  listening: {
    scale: [1, 1.15, 1],
    opacity: [0.4, 0.7, 0.4],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const },
  },
  speaking: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 0.9, 0.5],
    transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

const outerRingVariants = {
  idle: {
    scale: [1, 1.08, 1],
    opacity: [0.15, 0.3, 0.15],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
  },
  connecting: {
    scale: [1, 1.15, 1],
    opacity: [0.1, 0.4, 0.1],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const },
  },
  listening: {
    scale: [1, 1.25, 1],
    opacity: [0.2, 0.5, 0.2],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
  speaking: {
    scale: [1, 1.3, 1],
    opacity: [0.3, 0.6, 0.3],
    transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

const coreVariants = {
  idle: { scale: 1 },
  connecting: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const },
  },
  listening: { scale: 1.05 },
  speaking: {
    scale: [1, 1.1, 1],
    transition: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

export function VoiceOrb({ status, onClick }: VoiceOrbProps) {
  const isActive = status !== 'idle'
  const Icon = status === 'speaking' ? Volume2 : Mic

  return (
    <button
      onClick={onClick}
      className="relative w-44 h-44 sm:w-52 sm:h-52 cursor-pointer focus:outline-none group"
      aria-label={isActive ? 'Stop conversation' : 'Start conversation'}
    >
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(212,206,187,0.15) 0%, transparent 70%)',
        }}
        animate={outerRingVariants[status]}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute inset-3 sm:inset-4 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255,198,64,0.25) 0%, transparent 70%)',
          boxShadow: isActive
            ? '0 0 60px rgba(255,198,64,0.3)'
            : '0 0 30px rgba(212,206,187,0.15)',
        }}
        animate={ringVariants[status]}
      />

      {/* Core orb */}
      <motion.div
        className="absolute inset-8 sm:inset-10 rounded-full flex items-center justify-center"
        style={{
          background:
            'radial-gradient(circle at 35% 35%, #dfc29f, #d4cebb 50%, #b8b3a0 100%)',
          boxShadow: isActive
            ? '0 0 40px rgba(255,198,64,0.5), inset 0 0 20px rgba(255,255,255,0.1)'
            : '0 0 20px rgba(212,206,187,0.3), inset 0 0 15px rgba(255,255,255,0.1)',
        }}
        animate={coreVariants[status]}
        whileHover={{ scale: isActive ? undefined : 1.08 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground/90" />
      </motion.div>
    </button>
  )
}
