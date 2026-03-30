import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header.js'
import { CTASection } from '@/components/sections/cta-section.js'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import { StaggerChildren, StaggerItem } from '@/components/animations/stagger-children.js'
import { Card, CardContent } from '@/components/ui/card'
import { Bot, FileText, BarChart3, BookOpen, Lightbulb } from 'lucide-react'

export const Route = createFileRoute('/services/ai-assistants')({
  component: AIAssistantsPage,
  head: () => ({
    meta: [
      { title: 'AI Assistants That Work Alongside Your Team — AI Developer' },
      {
        name: 'description',
        content:
          'Custom AI assistants that summarize data, draft documents, answer questions, and accelerate decisions across your organization.',
      },
    ],
  }),
})

const benefits = [
  {
    icon: FileText,
    title: 'Document Processing',
    description:
      'Summarize contracts, extract key data from reports, and draft documents in seconds instead of hours.',
  },
  {
    icon: BarChart3,
    title: 'Data Analysis',
    description:
      'Ask questions in plain English and get instant insights from your spreadsheets, databases, and dashboards.',
  },
  {
    icon: BookOpen,
    title: 'Knowledge Base',
    description:
      'Turn your company docs, SOPs, and training materials into a searchable AI-powered knowledge base.',
  },
  {
    icon: Lightbulb,
    title: 'Decision Support',
    description:
      'Get AI-generated recommendations, risk assessments, and scenario analysis to make better decisions faster.',
  },
]

function AIAssistantsPage() {
  return (
    <>
      <PageHeader
        badge="AI Assistants"
        title="AI Assistants That Work Alongside Your Team"
        highlightWord="Your Team"
        description="Custom AI assistants that summarize data, draft documents, answer questions, and accelerate decisions across your organization."
      />

      {/* Detail Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInView>
              <div className="w-20 h-20 rounded-2xl bg-surface-low flex items-center justify-center mb-6">
                <Bot className="w-10 h-10 text-brand-primary" />
              </div>
              <h2
                className="text-3xl font-bold text-foreground mb-6"

              >
                Your team's AI-powered co-pilot
              </h2>
            </FadeInView>
            <FadeInView delay={0.15}>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Your team spends hours every week searching for information, summarizing documents, and compiling reports. An AI assistant handles all of that instantly — freeing your people to focus on high-value work.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We build custom assistants trained on your company's data, processes, and terminology. They integrate with your existing tools — Slack, email, CRM, project management — and work the way your team already works.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  From drafting client proposals to analyzing sales data to onboarding new employees, AI assistants multiply your team's output without adding headcount.
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
                An AI assistant built for your team's specific workflows.
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
