import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header.js'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import { Card, CardContent } from '@/components/ui/card'
import { EarlyAccessForm } from '@/components/early-access-form'
import { BadgeCheck, Clock, Lock } from 'lucide-react'
import { pageSeo } from '@/lib/seo'

const PATH = '/early-access'
const TITLE = 'Early Access — AI Developer Courses'
const DESCRIPTION =
  'Join the early-access list for AI Developer courses. Be first in line when they launch, and lock in the founding one-time price.'

export const Route = createFileRoute('/early-access')({
  component: EarlyAccessPage,
  head: () => pageSeo({ title: TITLE, description: DESCRIPTION, path: PATH }),
})

const perks = [
  {
    icon: BadgeCheck,
    title: 'Founding price, locked',
    description:
      'Early-access members get the lowest one-time price the courses will ever have — locked in before the public launch.',
  },
  {
    icon: Clock,
    title: 'First through the door',
    description:
      'You get access before anyone else, so you can start building while everyone else is still on the waitlist.',
  },
  {
    icon: Lock,
    title: 'Buy once, keep it',
    description:
      'One payment. No subscription, no seat fees, no expiring access — the same way we build software for clients.',
  },
]

function EarlyAccessPage() {
  return (
    <>
      <PageHeader
        badge="Early Access"
        title="Get In Before The Doors Open"
        highlightWord="Before"
        description="Our courses aren't public yet. Drop your name and email to claim early access — and the founding one-time price."
      />

      <section className="py-16 -mt-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Signup form */}
            <div className="lg:col-span-3">
              <FadeInView>
                <Card className="border-subtle-border">
                  <CardContent className="pt-6">
                    <EarlyAccessForm source="early-access" />
                  </CardContent>
                </Card>
              </FadeInView>

              {/* The "View the courses" cross-link is removed while /courses
                  is unlisted — it would walk visitors straight into the
                  placeholder pricing. Restore it when prices are real. */}
            </div>

            {/* Perks */}
            <div className="lg:col-span-2 space-y-6">
              {perks.map((perk, i) => (
                <FadeInView key={perk.title} delay={0.1 * (i + 1)}>
                  <Card className="border-subtle-border">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-surface-low flex items-center justify-center shrink-0">
                          <perk.icon className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                          <h2 className="font-semibold text-foreground mb-1">
                            {perk.title}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {perk.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeInView>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
