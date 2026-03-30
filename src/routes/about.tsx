import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header.js'
import { CTASection } from '@/components/sections/cta-section.js'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import { StaggerChildren, StaggerItem } from '@/components/animations/stagger-children.js'
import { Card, CardContent } from '@/components/ui/card'
import { Brain, Shield, Users } from 'lucide-react'

export const Route = createFileRoute('/about')({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: 'About AI Developer — Our Mission & Values' },
      {
        name: 'description',
        content:
          'Meet the team behind AI Developer. We combine AI-powered development with expert engineering to deliver world-class software at a fraction of the traditional cost.',
      },
    ],
  }),
})

const values = [
  {
    icon: Brain,
    title: 'AI-First Process',
    description:
      "We integrate AI into every stage of development — from planning and design to coding, testing, and deployment. This isn't a gimmick; it's how we deliver better results, faster.",
  },
  {
    icon: Shield,
    title: 'Quality Without Compromise',
    description:
      'AI handles the repetitive work, freeing our expert developers to focus on architecture, edge cases, and the details that separate good software from great software.',
  },
  {
    icon: Users,
    title: 'Transparent Partnership',
    description:
      'No black boxes. You get regular updates, clear timelines, and direct access to your development team. We succeed when you succeed.',
  },
]

function AboutPage() {
  return (
    <>
      <PageHeader
        badge="About Us"
        title="About AI Developer"
        highlightWord="AI Developer"
        description="We're a team of developers, designers, and AI specialists on a mission to make world-class software accessible to every business."
      />

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInView>
              <div>
                <h2
                  className="text-3xl sm:text-4xl font-bold text-foreground mb-6"

                >
                  Our Mission
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  We founded AI Developer on a simple belief: every business deserves
                  Fortune 500-quality software. Traditionally, building custom software
                  meant six-figure budgets and months of waiting. That's no longer the
                  case.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  AI has fundamentally changed the economics of software development. By
                  integrating AI into our workflow, we deliver polished, production-ready
                  applications in weeks instead of months — at a fraction of the
                  traditional cost.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our team of experienced developers and AI specialists work alongside
                  cutting-edge tools to handle everything from custom websites and web
                  apps to voice AI agents and intelligent automations.
                </p>
              </div>
            </FadeInView>

            <FadeInView delay={0.2}>
              <div className="relative">
                <div className="bg-gradient-to-br from-brand-primary to-brand-tertiary rounded-2xl p-8 text-white">
                  <div className="space-y-6">
                    <div>
                      <p className="text-3xl font-bold">10x</p>
                      <p className="text-white/80 text-sm">Faster than traditional development</p>
                    </div>
                    <div className="border-t border-white/20" />
                    <div>
                      <p className="text-3xl font-bold">60%</p>
                      <p className="text-white/80 text-sm">Lower cost on average</p>
                    </div>
                    <div className="border-t border-white/20" />
                    <div>
                      <p className="text-3xl font-bold">100%</p>
                      <p className="text-white/80 text-sm">Human-reviewed & production-ready</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-surface-low/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <div className="text-center mb-16">
              <h2
                className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
                             >
                Our Values
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The principles that guide every project we take on.
              </p>
            </div>
          </FadeInView>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => (
              <StaggerItem key={value.title}>
                <Card className="h-full border-subtle-border bg-surface">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-surface-low flex items-center justify-center mb-4">
                      <value.icon className="w-6 h-6 text-brand-primary" />
                    </div>
                    <h3
                      className="text-xl font-semibold text-foreground mb-2"
    
                    >
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <CTASection />
    </>
  )
}
