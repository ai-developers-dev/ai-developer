import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header.js'
import { CTASection } from '@/components/sections/cta-section.js'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import { StaggerChildren, StaggerItem } from '@/components/animations/stagger-children.js'
import { Card, CardContent } from '@/components/ui/card'
import { AppWindow, Radio, Shield, Plug, Layers } from 'lucide-react'

export const Route = createFileRoute('/services/web-apps')({
  component: WebAppsPage,
  head: () => ({
    meta: [
      { title: 'Web Applications Built to Scale — AI Developer' },
      {
        name: 'description',
        content:
          'Full-stack web applications with real-time features, secure authentication, and the integrations your business needs.',
      },
    ],
  }),
})

const benefits = [
  {
    icon: Radio,
    title: 'Real-Time Features',
    description:
      'Live dashboards, instant notifications, and collaborative features powered by WebSockets and real-time databases.',
  },
  {
    icon: Shield,
    title: 'Secure Auth',
    description:
      'Enterprise-grade authentication with SSO, role-based access control, and multi-factor authentication built in.',
  },
  {
    icon: Plug,
    title: 'API Integrations',
    description:
      'Connect with the tools you already use — CRMs, payment processors, analytics platforms, and more.',
  },
  {
    icon: Layers,
    title: 'Scalable Architecture',
    description:
      'Built on modern infrastructure that grows with your business, from 10 users to 10,000.',
  },
]

function WebAppsPage() {
  return (
    <>
      <PageHeader
        badge="Web Apps"
        title="Web Applications Built to Scale"
        highlightWord="Scale"
        description="Full-stack web applications with real-time features, secure authentication, and the integrations your business needs."
      />

      {/* Detail Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInView>
              <div className="w-20 h-20 rounded-2xl bg-surface-low flex items-center justify-center mb-6">
                <AppWindow className="w-10 h-10 text-brand-primary" />
              </div>
              <h2
                className="text-3xl font-bold text-foreground mb-6"

              >
                Custom software for complex workflows
              </h2>
            </FadeInView>
            <FadeInView delay={0.15}>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Off-the-shelf tools can only take you so far. When your business needs custom dashboards, internal tools, or customer-facing platforms, we build full-stack web applications tailored to your exact requirements.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our applications include real-time data syncing, secure user authentication, payment processing, and integrations with the tools your team already relies on.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  AI-accelerated development means you get a production-ready application faster, with cleaner code and fewer bugs than traditional development cycles.
                </p>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-surface-low/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <div className="text-center mb-16">
              <h2
                className="text-3xl sm:text-4xl font-bold text-foreground mb-4"

              >
                What you get
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every web app we build is designed for reliability, security, and growth.
              </p>
            </div>
          </FadeInView>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <StaggerItem key={benefit.title}>
                <Card className="h-full border-subtle-border bg-surface">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-surface-low flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-brand-primary" />
                    </div>
                    <h3
                      className="text-lg font-semibold text-foreground mb-2"
      
                    >
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
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
