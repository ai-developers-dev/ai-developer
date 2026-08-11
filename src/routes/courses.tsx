import { createFileRoute, Link } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header.js'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EarlyAccessForm } from '@/components/early-access-form'
import {
  ArrowRight,
  Bot,
  Check,
  Code2,
  Database,
  Infinity as InfinityIcon,
  Phone,
  Workflow,
} from 'lucide-react'
import { JsonLd, pageSeo, breadcrumbSchema } from '@/lib/seo'

const PATH = '/courses'
const TITLE = 'AI Developer Courses — One-Time Price, Lifetime Access'
const DESCRIPTION =
  'Learn to build the AI systems we ship for clients: custom CRMs, voice agents, chat agents, and automations. One-time payment, lifetime access. Early access open now.'

export const Route = createFileRoute('/courses')({
  component: CoursesPage,
  head: () => pageSeo({ title: TITLE, description: DESCRIPTION, path: PATH }),
})

// ── Edit these to change what the page sells ────────────────────────────────
// Pre-launch placeholders — set your real numbers before announcing.
const FOUNDING_PRICE = 297 // early-access one-time price
const REGULAR_PRICE = 497 // price after public launch
// ───────────────────────────────────────────────────────────────────────────

const courses = [
  {
    icon: Database,
    title: 'Build a Custom CRM',
    description:
      'The full build we sell to home-service companies: jobs, scheduling, quoting, invoicing, and a client portal — from empty repo to deployed.',
  },
  {
    icon: Phone,
    title: 'Voice AI Agents',
    description:
      'Ship an agent that answers the phone, books the job, and hands off to a human when it should. Telephony, prompting, and guardrails included.',
  },
  {
    icon: Bot,
    title: 'Chat Agents That Convert',
    description:
      'Site chat that qualifies leads instead of annoying them — retrieval over your own content, handoff rules, and lead capture that actually fires.',
  },
  {
    icon: Workflow,
    title: 'AI Automations',
    description:
      'The unglamorous money-makers: review requests, lead routing, follow-up sequences, and back-office cleanup wired end to end.',
  },
  {
    icon: Code2,
    title: 'The Production Stack',
    description:
      'Auth, payments, background jobs, webhooks, and deploys — the parts tutorials skip and real projects live or die on.',
  },
  {
    icon: InfinityIcon,
    title: 'Selling What You Build',
    description:
      'Scoping, pricing, proposals, and payment schedules — how we turn a build into a signed project instead of a free consultation.',
  },
]

const included = [
  'Every course in the library — no per-course upsells',
  'Full source code for each build, yours to reuse on client work',
  'Step-by-step video walkthroughs, start to deploy',
  'The prompts, schemas, and configs we use in production',
  'New courses added at no extra cost',
  'Lifetime access — no subscription, no expiring seat',
]

const faqs = [
  {
    q: 'When do the courses launch?',
    a: "They're in production now. Early-access members get the launch email first, before anything goes public.",
  },
  {
    q: 'Is this really a one-time payment?',
    a: `Yes. One payment of $${FOUNDING_PRICE} for early-access members and the library is yours — including courses we add later. No monthly fee, no renewal.`,
  },
  {
    q: 'How much do I need to know already?',
    a: 'You should be comfortable writing some code. We start at the architecture level and build real, deployable systems — this is not an intro-to-programming course.',
  },
  {
    q: 'Can I use the code on client projects?',
    a: 'That\'s the point. Every build ships with source you can adapt and sell — the same way we do.',
  },
]

function CoursesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema({
          items: [
            { label: 'Home', path: '/' },
            { label: 'Courses', path: PATH },
          ],
        })}
      />

      <PageHeader
        badge="Courses — Coming Soon"
        title="Learn To Build What We Ship"
        highlightWord="Ship"
        description="The same AI systems we ship for real clients — custom CRMs, voice agents, chat agents, and automations — taught end to end. One payment, yours forever."
      />

      {/* Pricing / early-access card */}
      <section className="pb-16 -mt-4">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <Card className="border-brand-primary/30 bg-brand-primary/5 overflow-hidden">
              <CardContent className="pt-8 pb-8 text-center">
                <Badge className="bg-brand-tertiary/10 text-brand-tertiary border-brand-tertiary/20 hover:bg-brand-tertiary/10 mb-5">
                  Not open to the public yet
                </Badge>

                <div className="flex items-end justify-center gap-3 mb-2">
                  <span className="font-heading text-5xl sm:text-6xl font-bold text-foreground">
                    ${FOUNDING_PRICE}
                  </span>
                  <span className="text-xl text-muted-foreground line-through mb-2">
                    ${REGULAR_PRICE}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-8">
                  One-time payment · Lifetime access · Founding price for
                  early-access members
                </p>

                <div className="max-w-md mx-auto text-left">
                  <EarlyAccessForm source="courses" compact />
                </div>
              </CardContent>
            </Card>
          </FadeInView>
        </div>
      </section>

      {/* Course lineup */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <div className="text-center mb-14">
              <span className="font-label text-brand-tertiary tracking-[0.3em] uppercase text-xs mb-4 inline-block">
                The Lineup
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
                What's in the library
              </h2>
            </div>
          </FadeInView>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, i) => (
              <FadeInView key={course.title} delay={0.05 * i}>
                <Card className="border-subtle-border h-full">
                  <CardContent className="pt-6">
                    <div className="w-11 h-11 rounded-lg bg-surface-low flex items-center justify-center mb-4">
                      <course.icon
                        className="w-5 h-5 text-brand-tertiary"
                        strokeWidth={1.5}
                      />
                    </div>
                    <h3 className="font-heading font-semibold text-foreground mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {course.description}
                    </p>
                  </CardContent>
                </Card>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <Card className="border-subtle-border">
              <CardContent className="pt-8 pb-8">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                  What the one-time fee includes
                </h2>
                <ul className="space-y-3">
                  {included.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-brand-tertiary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </FadeInView>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <h2 className="font-heading text-3xl font-bold text-foreground text-center mb-12">
              Questions
            </h2>
          </FadeInView>
          <div className="space-y-5">
            {faqs.map((faq, i) => (
              <FadeInView key={faq.q} delay={0.05 * i}>
                <div className="border-b border-subtle-border pb-5">
                  <h3 className="font-semibold text-foreground mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInView>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Claim the founding price
            </h2>
            <p className="text-muted-foreground mb-8">
              The courses open to early-access members first. Get on the list and
              you'll pay ${FOUNDING_PRICE} instead of ${REGULAR_PRICE}.
            </p>
            <Link
              to="/early-access"
              className="inline-flex items-center gap-2 gradient-btn font-label text-xs tracking-[0.2em] font-bold py-4 px-8 rounded-sm uppercase transition-all"
            >
              Get Early Access
              <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeInView>
        </div>
      </section>
    </>
  )
}
