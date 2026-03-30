import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header.js'
import { CTASection } from '@/components/sections/cta-section.js'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import { StaggerChildren, StaggerItem } from '@/components/animations/stagger-children.js'
import { Card, CardContent } from '@/components/ui/card'
import { Workflow, GitBranch, Database, FileBarChart, Plug } from 'lucide-react'

export const Route = createFileRoute('/services/ai-automations')({
  component: AIAutomationsPage,
  head: () => ({
    meta: [
      { title: 'AI Automations That Eliminate Busywork — AI Developer' },
      {
        name: 'description',
        content:
          'Automate repetitive workflows — from lead routing and data entry to report generation and email sequences.',
      },
    ],
  }),
})

const benefits = [
  {
    icon: GitBranch,
    title: 'Workflow Automation',
    description:
      'Automate multi-step processes — lead routing, approval chains, follow-up sequences — with intelligent branching logic.',
  },
  {
    icon: Database,
    title: 'Data Processing',
    description:
      'Extract, transform, and load data between systems automatically. No more copy-pasting between spreadsheets.',
  },
  {
    icon: FileBarChart,
    title: 'Report Generation',
    description:
      'Auto-generate daily, weekly, or monthly reports from your data sources and deliver them where your team needs them.',
  },
  {
    icon: Plug,
    title: 'Tool Integration',
    description:
      'Connect your CRM, email, calendar, accounting, and project management tools into seamless automated workflows.',
  },
]

function AIAutomationsPage() {
  return (
    <>
      <PageHeader
        badge="AI Automations"
        title="AI Automations That Eliminate Busywork"
        highlightWord="Eliminate Busywork"
        description="Automate repetitive workflows — from lead routing and data entry to report generation and email sequences."
      />

      {/* Detail Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInView>
              <div className="w-20 h-20 rounded-2xl bg-surface-low flex items-center justify-center mb-6">
                <Workflow className="w-10 h-10 text-brand-primary" />
              </div>
              <h2
                className="text-3xl font-bold text-foreground mb-6"

              >
                Stop doing what software can do for you
              </h2>
            </FadeInView>
            <FadeInView delay={0.15}>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Your team spends hours every day on tasks that could be automated — data entry, lead routing, report compilation, follow-up emails. AI automations handle all of it, running 24/7 without errors or delays.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We build custom automation workflows that connect your existing tools and add intelligent decision-making. Not just simple if-then rules — these automations use AI to classify data, prioritize tasks, and adapt to edge cases.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  From onboarding sequences to invoice processing to inventory alerts, we identify your biggest time sinks and automate them end-to-end.
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
                Intelligent automations that save your team hours every week.
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
