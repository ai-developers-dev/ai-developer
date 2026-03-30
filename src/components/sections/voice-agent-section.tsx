import { useCallback } from 'react'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import { VoiceOrb } from '@/components/ui/voice-orb.js'
import { useGeminiLive } from '@/hooks/use-gemini-live.js'

const statusLabels = {
  idle: 'Click to start a conversation',
  connecting: 'Connecting...',
  listening: 'Listening...',
  speaking: 'Speaking...',
} as const

export function VoiceAgentSection() {
  const { status, start, stop } = useGeminiLive()

  const handleClick = useCallback(() => {
    if (status === 'idle') {
      start()
    } else {
      stop()
    }
  }, [status, start, stop])

  return (
    <section className="relative py-20 md:py-28 bg-surface-low overflow-hidden">
      {/* Background gradient accents */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(255,198,64,0.15) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(223,194,159,0.2) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -top-10 -left-20 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(212,206,187,0.15) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-12">
        <FadeInView>
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Talk to Our{' '}
              <span className="bg-gradient-to-r from-brand-tertiary to-brand-secondary bg-clip-text text-transparent">
                AI Agent
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ask about our services, pricing, or book a discovery call — all
              through a live voice conversation with our AI.
            </p>
          </div>
        </FadeInView>

        <FadeInView delay={0.15}>
          <div className="flex flex-col items-center gap-6">
            <VoiceOrb status={status} onClick={handleClick} />

            <p
              className={`text-sm font-medium tracking-wide font-heading ${
                status === 'listening'
                  ? 'text-brand-tertiary'
                  : status === 'speaking'
                    ? 'text-brand-secondary'
                    : 'text-nav-text/50'
              }`}
            >
              {statusLabels[status]}
            </p>

            {status !== 'idle' && (
              <button
                onClick={stop}
                className="text-xs text-brand-primary/40 hover:text-brand-primary/70 transition-colors underline underline-offset-2"
              >
                End conversation
              </button>
            )}
          </div>
        </FadeInView>
      </div>
    </section>
  )
}
