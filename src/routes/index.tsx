import { createFileRoute } from '@tanstack/react-router'
import { HeroSection } from '@/components/sections/hero-section.js'
import { LogoBar } from '@/components/sections/logo-bar.js'
import { ServicesSection } from '@/components/sections/services-section.js'
import { FasterCheaperSection } from '@/components/sections/faster-cheaper.js'
import { HowItWorks } from '@/components/sections/how-it-works.js'
import { CTASection } from '@/components/sections/cta-section.js'
import { VoiceAgentSection } from '@/components/sections/voice-agent-section.js'
import { pageSeo } from '@/lib/seo'

export const Route = createFileRoute('/')({
  component: HomePage,
  head: () =>
    pageSeo({
      title: 'AI Developer — Custom AI Software & CRMs Built Faster',
      description:
        'AI Developer builds custom websites, web apps, voice AI agents, and home service CRMs — owned forever, no monthly SaaS fees.',
      path: '/',
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
