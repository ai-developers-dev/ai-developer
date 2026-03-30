import { FadeInView } from '@/components/animations/fade-in-view.js'
import { TrendingUp, Zap, Clock } from 'lucide-react'

export function FasterCheaperSection() {
  return (
    <section className="py-32 px-6 md:px-12 bg-surface-low">
      <div className="max-w-screen-2xl mx-auto">
        <FadeInView>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:auto-rows-[300px]">
            {/* Main value prop — 8 columns */}
            <div className="md:col-span-8 glass-card p-12 flex flex-col justify-center">
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
                Why build with AI?
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Traditional software is static. AI is kinetic. We build systems that
                don't just solve today's problems but evolve to preempt tomorrow's
                challenges.
              </p>
            </div>

            {/* Stat card — 4 columns */}
            <div className="md:col-span-4 glass-card p-12 flex flex-col justify-between" style={{ background: 'rgba(255,198,64,0.05)' }}>
              <TrendingUp className="w-12 h-12 text-brand-tertiary" strokeWidth={1.5} />
              <div>
                <div className="text-5xl font-heading font-bold text-brand-tertiary mb-2">3×</div>
                <p className="font-label uppercase tracking-widest text-xs text-muted-foreground">
                  Faster Delivery
                </p>
              </div>
            </div>

            {/* Rapid scaling — 4 columns */}
            <div className="md:col-span-4 glass-card p-12 flex flex-col justify-between overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="font-heading text-2xl font-bold text-brand-primary mb-4 uppercase">
                  50% Lower Cost
                </h4>
                <p className="text-muted-foreground text-sm">
                  By automating repetitive coding, testing, and QA, we pass the savings
                  directly to you.
                </p>
              </div>
              <Zap className="absolute bottom-6 right-6 w-20 h-20 text-decoration" strokeWidth={1} />
            </div>

            {/* Precision engineering — 8 columns */}
            <div className="md:col-span-8 glass-card p-12 flex items-center justify-between">
              <div className="max-w-md">
                <h4 className="font-heading text-2xl font-bold text-brand-primary mb-4 uppercase">
                  24/7 AI Never Sleeps
                </h4>
                <p className="text-muted-foreground text-sm">
                  Your AI agents and automations work around the clock — no overtime,
                  no burnout, no missed inquiries. Pure architectural efficiency.
                </p>
              </div>
              <div className="hidden md:block">
                <Clock className="w-20 h-20 text-decoration" strokeWidth={1} />
              </div>
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  )
}
