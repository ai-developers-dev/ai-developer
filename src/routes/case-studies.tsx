import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header.js'
import { CTASection } from '@/components/sections/cta-section.js'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import { StaggerChildren, StaggerItem } from '@/components/animations/stagger-children.js'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'

export const Route = createFileRoute('/case-studies')({
  component: CaseStudiesPage,
  head: () => ({
    meta: [
      { title: 'Case Studies — AI Developer Results' },
      {
        name: 'description',
        content:
          'See how AI Developer has helped businesses launch faster, cut costs, and automate operations with custom AI solutions.',
      },
    ],
  }),
})

const caseStudies = [
  {
    industry: 'Healthcare',
    title: 'AI-Powered Patient Intake for a Regional Clinic',
    description:
      'A multi-location clinic needed to reduce front-desk bottlenecks. We built a voice AI agent that handles appointment scheduling, insurance verification, and patient intake — available 24/7.',
    metrics: [
      { label: 'Call handling time', value: '3x faster' },
      { label: 'Staff hours saved', value: '120 hrs/mo' },
    ],
    services: ['Voice AI', 'Automation'],
  },
  {
    industry: 'E-Commerce',
    title: 'Custom Storefront with AI-Driven Recommendations',
    description:
      'An online retailer was outgrowing their template-based site. We delivered a custom web application with AI-powered product recommendations that increased average order value.',
    metrics: [
      { label: 'Conversion rate', value: '+42%' },
      { label: 'Development cost', value: '50% less' },
    ],
    services: ['Web Application', 'AI Assistants'],
  },
  {
    industry: 'Professional Services',
    title: 'Automated Lead Qualification for a Law Firm',
    description:
      'A growing law firm was losing leads to slow response times. We deployed a chat AI agent that qualifies inquiries, collects case details, and books consultations automatically.',
    metrics: [
      { label: 'Response time', value: 'Under 30s' },
      { label: 'Qualified leads', value: '+65%' },
    ],
    services: ['Chat AI', 'Custom Website'],
  },
]

function CaseStudiesPage() {
  return (
    <>
      <PageHeader
        badge="Case Studies"
        title="Real Results for Real Businesses"
        highlightWord="Real Results"
        description="We don't just build software — we deliver measurable outcomes. Here's how we've helped businesses like yours."
      />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudies.map((study) => (
              <StaggerItem key={study.title}>
                <Card className="h-full border-subtle-border bg-surface">
                  <CardContent className="pt-6">
                    <Badge
                      variant="secondary"
                      className="mb-4 bg-surface-low text-brand-primary border border-subtle-border"
                    >
                      {study.industry}
                    </Badge>
                    <h3
                      className="text-xl font-semibold text-foreground mb-3"

                    >
                      {study.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                      {study.description}
                    </p>

                    {/* Key Metrics */}
                    <div className="bg-surface-low/60 rounded-xl p-4 mb-6 space-y-3">
                      {study.metrics.map((metric) => (
                        <div
                          key={metric.label}
                          className="flex items-center justify-between"
                        >
                          <span className="text-xs text-muted-foreground">
                            {metric.label}
                          </span>
                          <span className="flex items-center gap-1 text-sm font-semibold text-brand-primary">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {metric.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Services Tags */}
                    <div className="flex flex-wrap gap-2">
                      {study.services.map((service) => (
                        <Badge
                          key={service}
                          variant="outline"
                          className="text-xs text-muted-foreground border-border"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
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
