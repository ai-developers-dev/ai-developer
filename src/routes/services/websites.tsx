import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header.js'
import { CTASection } from '@/components/sections/cta-section.js'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import { StaggerChildren, StaggerItem } from '@/components/animations/stagger-children.js'
import { Card, CardContent } from '@/components/ui/card'
import { Globe, Smartphone, Search, Zap, TrendingUp } from 'lucide-react'

export const Route = createFileRoute('/services/websites')({
  component: WebsitesPage,
  head: () => ({
    meta: [
      { title: 'Custom Websites That Convert — AI Developer' },
      {
        name: 'description',
        content:
          'High-performance, responsive websites designed to turn visitors into customers — built faster with AI-powered development.',
      },
    ],
  }),
})

const benefits = [
  {
    icon: Smartphone,
    title: 'Responsive Design',
    description:
      'Every site is built mobile-first and looks pixel-perfect on phones, tablets, and desktops.',
  },
  {
    icon: Search,
    title: 'SEO Optimized',
    description:
      'Built with clean markup, fast load times, and best-practice SEO so you rank higher from day one.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Optimized assets, modern frameworks, and edge delivery ensure sub-second page loads.',
  },
  {
    icon: TrendingUp,
    title: 'Conversion Focused',
    description:
      'Strategic layouts, clear CTAs, and data-driven design that turns visitors into customers.',
  },
]

function WebsitesPage() {
  return (
    <>
      <PageHeader
        badge="Websites"
        title="Custom Websites That Convert"
        highlightWord="Convert"
        description="High-performance, responsive websites designed to turn visitors into customers — built faster with AI."
      />

      {/* Detail Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInView>
              <div className="w-20 h-20 rounded-2xl bg-surface-low flex items-center justify-center mb-6">
                <Globe className="w-10 h-10 text-brand-primary" />
              </div>
              <h2
                className="text-3xl font-bold text-foreground mb-6"

              >
                Websites built for performance and growth
              </h2>
            </FadeInView>
            <FadeInView delay={0.15}>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Your website is your most important sales tool. We build custom sites that load instantly, look stunning on every device, and are engineered to convert visitors into customers.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Using AI-accelerated development, we deliver SEO-optimized, mobile-first websites in weeks — not months. Every site includes clean semantic markup, optimized images, and a CMS you can actually use.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  From landing pages to full marketing sites, we handle design, development, and deployment so you can focus on running your business.
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
                Every website we build comes with these core advantages.
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
