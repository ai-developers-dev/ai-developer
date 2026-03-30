import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header.js'
import { CTASection } from '@/components/sections/cta-section.js'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import { StaggerChildren, StaggerItem } from '@/components/animations/stagger-children.js'
import { Card, CardContent } from '@/components/ui/card'
import { Phone, Clock, MessageCircle, Calendar, UserCheck } from 'lucide-react'

export const Route = createFileRoute('/services/voice-ai')({
  component: VoiceAIPage,
  head: () => ({
    meta: [
      { title: 'Voice AI Agents That Handle Calls — AI Developer' },
      {
        name: 'description',
        content:
          'AI-powered phone agents that answer calls, book appointments, qualify leads, and handle customer inquiries around the clock.',
      },
    ],
  }),
})

const benefits = [
  {
    icon: Clock,
    title: '24/7 Availability',
    description:
      'Your AI agent never sleeps. Every call gets answered — nights, weekends, and holidays included.',
  },
  {
    icon: MessageCircle,
    title: 'Natural Conversation',
    description:
      'Advanced speech models deliver human-like conversations that callers actually enjoy.',
  },
  {
    icon: Calendar,
    title: 'Appointment Booking',
    description:
      'Integrates with your calendar to check availability and book appointments in real time.',
  },
  {
    icon: UserCheck,
    title: 'Lead Qualification',
    description:
      'Asks the right questions, scores leads, and routes hot prospects directly to your sales team.',
  },
]

function VoiceAIPage() {
  return (
    <>
      <PageHeader
        badge="Voice AI"
        title="Voice AI Agents That Handle Calls"
        highlightWord="Handle Calls"
        description="AI-powered phone agents that answer calls, book appointments, qualify leads, and handle customer inquiries around the clock."
      />

      {/* Detail Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInView>
              <div className="w-20 h-20 rounded-2xl bg-surface-low flex items-center justify-center mb-6">
                <Phone className="w-10 h-10 text-brand-primary" />
              </div>
              <h2
                className="text-3xl font-bold text-foreground mb-6"

              >
                Never miss a call again
              </h2>
            </FadeInView>
            <FadeInView delay={0.15}>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Missed calls mean missed revenue. Our voice AI agents answer every call with natural, human-like conversation — handling FAQs, booking appointments, and qualifying leads without putting anyone on hold.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Each agent is custom-trained on your business, services, and brand voice. They integrate with your CRM, calendar, and phone system so everything stays in sync.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Whether you need an after-hours receptionist, an appointment setter, or a full inbound sales agent, we build voice AI that works the way your business needs it to.
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
                A voice AI agent built specifically for your business.
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
