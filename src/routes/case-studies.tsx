import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header.js'
import { CTASection } from '@/components/sections/cta-section.js'
import { StaggerChildren, StaggerItem } from '@/components/animations/stagger-children.js'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'
import { pageSeo } from '@/lib/seo'

export const Route = createFileRoute('/case-studies')({
  component: CaseStudiesPage,
  head: () =>
    pageSeo({
      title: 'Case Studies — Custom Software Results — AI Developer',
      description:
        'See how AI Developer has helped businesses launch faster, cut costs, and replace monthly SaaS with custom software they own.',
      path: '/case-studies',
    }),
})

const caseStudies = [
  {
    industry: 'Electrician',
    title: 'Custom CRM Replaces Housecall Pro for a 5-Truck Electrical Shop',
    description:
      'A residential electrical contractor was paying $700/month for software that still required spreadsheets to track permits and EV charger specs. We built a CRM with native permit tracking, panel + EV fields, and on-site quoting — and they cancelled the SaaS the next month.',
    metrics: [
      { label: 'Software cost', value: '-100%' },
      { label: 'Build payback', value: '14 months' },
    ],
    services: ['Custom CRM', 'QuickBooks Integration'],
  },
  {
    industry: 'Plumber',
    title: 'After-Hours AI Dispatch for a 4-Truck Plumbing Shop',
    description:
      'Emergency calls were going to voicemail after hours and being lost to competitors. We deployed a voice AI agent that triages urgent water leaks to the on-call tech and books routine calls into the live schedule — all integrated with their custom CRM.',
    metrics: [
      { label: 'After-hours calls captured', value: '+38%' },
      { label: 'Office phone time', value: '-22 hrs/wk' },
    ],
    services: ['Voice AI', 'Custom CRM'],
  },
  {
    industry: 'HVAC',
    title: 'Maintenance Plan Engine for a Regional HVAC Contractor',
    description:
      'Annual tune-ups were being tracked in a spreadsheet — and forgotten. We built a maintenance plan engine inside their custom CRM that auto-schedules visits, sends reminders, and pre-generates invoices on completion.',
    metrics: [
      { label: 'Maintenance revenue', value: '+27%' },
      { label: 'Missed renewals', value: '~0' },
    ],
    services: ['Custom CRM', 'Automation'],
  },
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
        title="Custom CRM & AI Wins for Home Service Shops"
        highlightWord="Home Service"
        description="Electricians, plumbers, HVAC, and beyond — measurable outcomes from custom CRMs, voice AI dispatch, and AI automations."
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
