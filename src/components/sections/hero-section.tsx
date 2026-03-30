import { useState } from 'react'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import { NeuralNetworkBg } from '@/components/animations/neural-network-bg.js'
import { GetStartedDialog } from '@/components/get-started-dialog'

export function HeroSection() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <section className="relative min-h-[795px] flex flex-col justify-center px-6 md:px-12 max-w-screen-2xl mx-auto overflow-hidden pt-24">
      {/* Animated neural network background */}
      <NeuralNetworkBg />

      <div className="relative z-10 max-w-4xl">
        <FadeInView delay={0}>
          <span className="font-label text-brand-tertiary tracking-[0.3em] uppercase text-xs mb-6 block">
            AI-Powered Development Agency
          </span>
        </FadeInView>

        <FadeInView delay={0.1}>
          <h1 className="font-heading text-6xl md:text-9xl font-bold leading-tight mb-8">
            <span className="architectural-outline block">WE BUILD</span>
            <span className="text-brand-primary block">THE FUTURE</span>
          </h1>
        </FadeInView>

        <FadeInView delay={0.2}>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed mb-12">
            We engineer bespoke websites, web applications, and AI solutions that
            bridge the gap between enterprise-grade technology and small-to-medium
            business agility. Precision-crafted, neural-powered.
          </p>
        </FadeInView>

        <FadeInView delay={0.3}>
          <div className="flex flex-wrap gap-6">
            <button
              className="gradient-btn text-primary-foreground font-label px-10 py-4 font-bold tracking-widest uppercase transition-all hover:shadow-[0_0_40px_rgba(212,206,187,0.3)]"
              onClick={() => setDialogOpen(true)}
            >
              Explore Systems
            </button>
            <GetStartedDialog open={dialogOpen} onOpenChange={setDialogOpen} />
            <a href="#services">
              <button className="glass-card text-brand-primary font-label px-10 py-4 font-bold tracking-widest uppercase transition-all">
                View Blueprint
              </button>
            </a>
          </div>
        </FadeInView>
      </div>
    </section>
  )
}
