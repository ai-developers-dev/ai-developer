import { createFileRoute } from '@tanstack/react-router'
import { HeroSection } from '@/components/sections/hero-section.js'
import { LogoBar } from '@/components/sections/logo-bar.js'
import { ServicesSection } from '@/components/sections/services-section.js'
import { FasterCheaperSection } from '@/components/sections/faster-cheaper.js'
import { HowItWorks } from '@/components/sections/how-it-works.js'
import { CTASection } from '@/components/sections/cta-section.js'
import { VoiceAgentSection } from '@/components/sections/voice-agent-section.js'

export const Route = createFileRoute('/')({
  component: HomePage,
  head: () => ({
    meta: [
      { title: 'AI Developer — Websites, Apps & AI Solutions Built Faster' },
      {
        name: 'description',
        content:
          'AI Developer builds custom websites, web apps, voice AI agents, chat AI agents, AI assistants, and AI automations — faster and cheaper with AI.',
      },
    ],
  }),
})

function HomePage() {
  return (
    <>
      <HeroSection />
      <LogoBar />
      <VoiceAgentSection />
      <ServicesSection />
      <FasterCheaperSection />
      <HowItWorks />
      <CTASection />
    </>
  )
}
