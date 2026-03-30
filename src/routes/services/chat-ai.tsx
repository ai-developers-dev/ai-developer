import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header.js'
import { CTASection } from '@/components/sections/cta-section.js'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import { StaggerChildren, StaggerItem } from '@/components/animations/stagger-children.js'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Share2, Zap, TrendingUp, ArrowUpRight } from 'lucide-react'

export const Route = createFileRoute('/services/chat-ai')({
  component: ChatAIPage,
  head: () => ({
    meta: [
      { title: 'Chat AI Agents for Instant Engagement — AI Developer' },
      {
        name: 'description',
        content:
          'Intelligent chatbots deployed on your website, SMS, or social channels — handling customer support and sales conversations instantly.',
      },
    ],
  }),
})

const benefits = [
  {
    icon: Share2,
    title: 'Multi-Channel',
    description:
      'Deploy on your website, SMS, WhatsApp, Instagram, and Facebook Messenger from a single platform.',
  },
  {
    icon: Zap,
    title: 'Instant Response',
    description:
      'No waiting. Your chat agent responds in under a second, keeping visitors engaged and moving toward conversion.',
  },
  {
    icon: TrendingUp,
    title: 'Sales Automation',
    description:
      'Qualify leads, recommend products, and guide prospects through your sales funnel automatically.',
  },
  {
    icon: ArrowUpRight,
    title: 'Smart Escalation',
    description:
      'Knows when to hand off to a human. Complex issues get routed to the right team member with full context.',
  },
]

function ChatAIPage() {
  return (
    <>
      <PageHeader
        badge="Chat AI"
        title="Chat AI Agents for Instant Engagement"
        highlightWord="Instant Engagement"
        description="Intelligent chatbots deployed on your website, SMS, or social channels — handling customer support and sales conversations instantly."
      />

      {/* Detail Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInView>
              <div className="w-20 h-20 rounded-2xl bg-surface-low flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-brand-primary" />
              </div>
              <h2
                className="text-3xl font-bold text-foreground mb-6"

              >
                Engage every visitor, instantly
              </h2>
            </FadeInView>
            <FadeInView delay={0.15}>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Most website visitors leave without taking action. A chat AI agent engages them the moment they arrive — answering questions, recommending services, and capturing leads before they bounce.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our chat agents are trained on your business knowledge, FAQs, and product catalog. They handle support tickets, guide purchasing decisions, and seamlessly escalate to your team when needed.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Deploy across your website, SMS, and social media channels for a consistent, always-on customer experience that scales without adding headcount.
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
                A chat agent that represents your brand across every channel.
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
