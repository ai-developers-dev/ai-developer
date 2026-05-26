import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header.js'
import { CTASection } from '@/components/sections/cta-section.js'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import {
  StaggerChildren,
  StaggerItem,
} from '@/components/animations/stagger-children.js'
import { Card, CardContent } from '@/components/ui/card'
import {
  Users,
  CalendarClock,
  ClipboardList,
  Smartphone,
  Wrench,
  PlugZap,
} from 'lucide-react'

export const Route = createFileRoute('/services/custom-crm')({
  component: CustomCrmPage,
  head: () => ({
    meta: [
      { title: 'Custom CRMs for Home Service Businesses — AI Developer' },
      {
        name: 'description',
        content:
          'A custom CRM built for how home service businesses — electricians, plumbers, and HVAC — actually work. Jobs, dispatch, quotes, and invoicing in one place.',
      },
    ],
  }),
})

const features = [
  {
    icon: Users,
    title: 'Customer & Job History',
    description:
      'Every panel upgrade, drain clear, and AC install in one place. Search by address, customer, or equipment from the seat of a truck.',
  },
  {
    icon: CalendarClock,
    title: 'Scheduling & Dispatch',
    description:
      'Drag-and-drop a job onto a tech, send the route to their phone, and watch arrival times update live as the day shifts.',
  },
  {
    icon: ClipboardList,
    title: 'Quotes, Invoices & Payments',
    description:
      'Build a quote on-site, get the signature, take a deposit, then auto-bill the rest on completion — no juggling QuickBooks.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First in the Field',
    description:
      'Designed for grimy hands and bright sun. Techs log time, snap photos of the work, and close out a job in under a minute.',
  },
  {
    icon: Wrench,
    title: 'Built Around Your Workflow',
    description:
      'We map your actual day — service vs. install, permitting, maintenance contracts, change orders — and shape the CRM to it, not the other way around.',
  },
  {
    icon: PlugZap,
    title: 'Integrations That Matter',
    description:
      'QuickBooks, Stripe, Google Maps, SMS reminders, and supplier catalogs — connected so data flows in one direction, not three.',
  },
]

const trades = [
  {
    name: 'Electricians',
    detail:
      'Panel upgrades, service tickets, permits, EV chargers, and new construction phases — tracked end-to-end.',
  },
  {
    name: 'Plumbers',
    detail:
      'Drain calls, water heater installs, repipes, and emergency dispatch with photo-rich job histories.',
  },
  {
    name: 'HVAC',
    detail:
      'Seasonal maintenance plans, install jobs, refrigerant tracking, and recurring service agreements.',
  },
]

function CustomCrmPage() {
  return (
    <>
      <PageHeader
        badge="Custom CRM"
        title="A CRM Built for Home Service Businesses"
        highlightWord="Home Service"
        description="The off-the-shelf field service apps weren't built for the way you actually run. We design CRMs around your shop — whether you're wiring panels, snaking drains, or installing condensers."
      />

      {/* Detail Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInView>
              <div className="w-20 h-20 rounded-2xl bg-surface-low flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-brand-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Stop bending your business to fit someone else's software
              </h2>
            </FadeInView>
            <FadeInView delay={0.15}>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Most "field service" CRMs are built to be everything to
                  everyone — and end up serving no trade well.
                  Electricians get fields they don't use, plumbers can't track
                  the job photos they need, HVAC techs lose maintenance
                  contracts in the cracks. And the monthly bill goes up every
                  quarter.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We sit down with your office manager and your lead tech,
                  watch how jobs actually move from call to invoice, and build
                  a CRM that mirrors that flow — service tickets, install
                  schedules, permit tracking, maintenance plans, change
                  orders — whatever your shop runs on.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Because we build it with AI-accelerated development, what
                  used to take a team six months and six figures gets shipped
                  in weeks for a fraction of the cost — and stays yours
                  forever, with no per-seat tax.
                </p>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-surface-low/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                What's inside
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The pieces an electrical contractor actually needs — no bloat,
                no twenty modules you'll never open.
              </p>
            </div>
          </FadeInView>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <Card className="h-full border-subtle-border bg-surface">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-surface-low flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-brand-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Trades we build for */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <div className="text-center mb-12">
              <p className="font-label text-[11px] tracking-[0.25em] uppercase text-brand-tertiary mb-3">
                Trades we build for
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Electricians, plumbers, and HVAC
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Different trades, same problem: generic field service apps
                that almost fit. We build the one that actually does.
              </p>
            </div>
          </FadeInView>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trades.map((t) => (
              <StaggerItem key={t.name}>
                <Card className="h-full border-subtle-border bg-surface">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {t.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t.detail}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Own-it-forever banner */}
      <section className="py-20 bg-surface-low/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInView>
            <p className="font-label text-[11px] tracking-[0.25em] uppercase text-brand-tertiary mb-4">
              Own it forever
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              Stop paying for your monthly CRM.
              <br />
              <span className="text-brand-primary">
                Get your own custom CRM that you own forever.
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              No per-seat licensing, no quarterly price hikes, no losing your
              data when you switch vendors. Pay once, own the code, keep
              everything — customers, history, integrations — for the life of
              your business.
            </p>
          </FadeInView>
        </div>
      </section>

      {/* How it works — concise three-step */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                How we work with you
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Three steps from first call to a CRM you'd never trade for
                anyone else's.
              </p>
            </div>
          </FadeInView>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Shadow your shop',
                body: 'A short ride-along and a working session with your office. We map the real workflow — not the one in the brochure.',
              },
              {
                step: '02',
                title: 'Build in weeks',
                body: 'You get a working CRM in 2–4 weeks. Real data, real users, real feedback. We iterate fast and you ship sooner.',
              },
              {
                step: '03',
                title: 'Own it forever',
                body: 'No per-seat licensing. The code, the data, the integrations — yours. We stay on call for changes as the business grows.',
              },
            ].map((s, i) => (
              <FadeInView key={s.step} delay={0.05 * i}>
                <div className="rounded-2xl border border-subtle-border bg-surface p-6 h-full">
                  <p className="font-label text-[11px] tracking-[0.25em] uppercase text-brand-tertiary mb-3">
                    Step {s.step}
                  </p>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
