import { createFileRoute, Link } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header.js'
import { CTASection } from '@/components/sections/cta-section.js'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import {
  StaggerChildren,
  StaggerItem,
} from '@/components/animations/stagger-children.js'
import { Card, CardContent } from '@/components/ui/card'
import { Brain, Shield, Users, Hammer } from 'lucide-react'
import { JsonLd, SITE_URL, pageSeo } from '@/lib/seo'

export const Route = createFileRoute('/about')({
  component: AboutPage,
  head: () =>
    pageSeo({
      title: 'About AI Developer — Founded by Doug Allen',
      description:
        'AI Developer is the small shop building custom CRMs, AI agents, and web apps for businesses that are tired of monthly SaaS. Founded by Doug Allen in 2023.',
      path: '/about',
    }),
})

const PERSON_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Doug Allen',
  jobTitle: 'Founder & CEO',
  worksFor: { '@type': 'Organization', name: 'AI Developer', url: SITE_URL },
  email: 'doug@aideveloper.dev',
  image: `${SITE_URL}/images/doug-allen.jpg`,
}

const values = [
  {
    icon: Hammer,
    title: 'Built to be Owned',
    description:
      "We don't build software you rent. We build software you keep. Every project ships with the source code in your hands and a hosting setup you control.",
  },
  {
    icon: Brain,
    title: 'AI-First, Human-Reviewed',
    description:
      'AI is in every step of how we build — planning, code, tests, deployment. But every line of code that ships to your business has been read, shaped, and verified by a person.',
  },
  {
    icon: Shield,
    title: 'No Bloat, No Lock-In',
    description:
      "We don't add features you didn't ask for. We don't add fees that weren't in the quote. And we don't hold your data hostage if you ever want to take the project somewhere else.",
  },
  {
    icon: Users,
    title: 'Direct Partnership',
    description:
      "You won't talk to an account manager who escalates to a project manager who emails a developer. You'll talk to the people actually writing your software. That's the whole thing.",
  },
]

function AboutPage() {
  return (
    <>
      <JsonLd data={PERSON_SCHEMA} />

      <PageHeader
        badge="About"
        title="A One-Person AI Dev Shop, On Purpose"
        highlightWord="On Purpose"
        description="AI Developer was founded in 2023 by Doug Allen to build the kind of custom software that used to cost six figures — at a price small businesses can actually justify."
      />

      {/* Founder Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <FadeInView className="lg:col-span-5">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-br from-brand-primary/30 to-brand-tertiary/20 rounded-2xl blur-2xl opacity-60" />
                <img
                  src="/images/doug-allen.jpg"
                  alt="Doug Allen — Founder & CEO of AI Developer"
                  className="relative rounded-2xl shadow-xl w-full max-w-md object-cover"
                />
                <div className="mt-6">
                  <p className="font-label text-[11px] tracking-[0.25em] uppercase text-brand-tertiary mb-1">
                    Founder &amp; CEO
                  </p>
                  <p className="text-2xl font-bold text-foreground">Doug Allen</p>
                  <p className="text-sm text-muted-foreground">
                    Building AI Developer since 2023
                  </p>
                </div>
              </div>
            </FadeInView>

            <FadeInView delay={0.15} className="lg:col-span-7">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Hi — I'm Doug.
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  I started AI Developer in 2023 because I'd watched too many
                  small businesses get squeezed by the same SaaS treadmill:
                  pay $500 a month for a tool that almost fits, watch the
                  price climb every renewal, and lose your data the day you
                  try to leave.
                </p>
                <p>
                  I'm a full-stack builder. I write the code. I sit in the
                  meetings with your office manager. I ride along with your
                  lead tech if that's what it takes to get the workflow
                  right. AI Developer isn't a layer of project managers
                  between you and the work — it's me, building, with AI as
                  the leverage that makes a one-person shop ship like a
                  ten-person agency used to.
                </p>
                <p>
                  My focus is on the businesses I see getting hurt the most
                  by the off-the-shelf software economy: home service
                  trades, small operators, and any owner who's ever said the
                  words <em>"our software doesn't really do that, we use a
                  spreadsheet for it."</em>
                </p>
                <p>
                  If you've outgrown your CRM, your phone is eating your
                  office manager alive, or you're staring at a five-figure
                  annual SaaS bill and wondering if there's a better way —
                  there is. Let's{' '}
                  <Link to="/contact" className="text-brand-primary underline">
                    talk
                  </Link>
                  .
                </p>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Economics Section */}
      <section className="py-20 bg-surface-low/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInView>
              <div>
                <p className="font-label text-[11px] tracking-[0.25em] uppercase text-brand-tertiary mb-3">
                  Why this works now
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  The economics of custom software just changed
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Five years ago, telling a 5-truck plumbing shop to build
                  their own CRM would have been insane. A six-month
                  engagement at $25k/month, plus three years of maintenance.
                  Nobody could justify that.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  AI changed the math. The same project now ships in 4-6
                  weeks for a fraction of the cost — and the quality is
                  better, not worse, because the boring repetitive code is
                  handled, freeing up real engineering thought for the
                  parts that matter.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  That's the shift I'm betting AI Developer on. Custom
                  software, fast and affordable, for the businesses that
                  were locked out of it.
                </p>
              </div>
            </FadeInView>

            <FadeInView delay={0.2}>
              <div className="bg-gradient-to-br from-brand-primary to-brand-tertiary rounded-2xl p-8 text-white">
                <div className="space-y-6">
                  <div>
                    <p className="text-3xl font-bold">10x</p>
                    <p className="text-white/80 text-sm">
                      Faster than traditional development
                    </p>
                  </div>
                  <div className="border-t border-white/20" />
                  <div>
                    <p className="text-3xl font-bold">60%</p>
                    <p className="text-white/80 text-sm">Lower cost on average</p>
                  </div>
                  <div className="border-t border-white/20" />
                  <div>
                    <p className="text-3xl font-bold">100%</p>
                    <p className="text-white/80 text-sm">
                      Owned by you — code, data, integrations
                    </p>
                  </div>
                </div>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* What I build */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <div className="text-center mb-16">
              <p className="font-label text-[11px] tracking-[0.25em] uppercase text-brand-tertiary mb-3">
                Expertise
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                What I build
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Hands-on across the stack — frontend, backend, AI integration,
                payments, voice, deployment. The whole project, one builder.
              </p>
            </div>
          </FadeInView>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                title: 'Custom CRMs',
                body: 'Trade-specific CRMs for electricians, plumbers, HVAC, and other home service shops. Owned, not rented.',
              },
              {
                title: 'Voice AI Agents',
                body: 'AI phone agents that answer calls 24/7, book appointments, and triage emergencies — built on the latest realtime voice models.',
              },
              {
                title: 'Chat AI Agents',
                body: 'Customer-facing chatbots on your website, SMS, and social — trained on your business, not someone else\'s template.',
              },
              {
                title: 'AI Automations',
                body: 'Workflows that eliminate the busywork — lead routing, document processing, follow-up sequences, report generation.',
              },
              {
                title: 'Web Apps & Sites',
                body: 'Custom dashboards, customer portals, marketing sites. Modern React/TanStack, fast and SEO-ready.',
              },
              {
                title: 'Stripe & Integrations',
                body: 'Payments, subscriptions, split installments, QuickBooks sync, supplier catalogs — the connective tissue that makes the rest real.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-subtle-border bg-surface p-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-surface-low/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <div className="text-center mb-16">
              <p className="font-label text-[11px] tracking-[0.25em] uppercase text-brand-tertiary mb-3">
                Principles
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                How I work
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Four principles that show up in every project, on purpose.
              </p>
            </div>
          </FadeInView>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {values.map((value) => (
              <StaggerItem key={value.title}>
                <Card className="h-full border-subtle-border bg-surface">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-surface-low flex items-center justify-center mb-4">
                      <value.icon className="w-6 h-6 text-brand-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
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
