import { PageHeader } from '@/components/layout/page-header.js'
import { CTASection } from '@/components/sections/cta-section.js'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import {
  StaggerChildren,
  StaggerItem,
} from '@/components/animations/stagger-children.js'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Users,
  CalendarClock,
  ClipboardList,
  Smartphone,
  Wrench,
  PlugZap,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import {
  JsonLd,
  serviceSchema,
  breadcrumbSchema,
} from '@/lib/seo'

export interface TradeContent {
  /** Plural trade noun e.g. "electricians" — used in URL paths and prose */
  trade: string
  /** Singular trade noun for headings e.g. "Electrician" */
  tradeSingular: string
  /** Display label e.g. "HVAC" (for HVAC we don't title-case "Hvac") */
  tradeDisplay: string
  /** Route path */
  path: string
  /** Page title — keep under 60 chars */
  seoTitle: string
  /** Meta description — 140-160 chars */
  seoDescription: string
  /** Hero subtitle line */
  heroDescription: string
  /** Long intro paragraph */
  intro: string
  /** Specific pain points — short bullet sentences */
  painPoints: string[]
  /** Six trade-specific features */
  features: { icon: LucideIcon; title: string; description: string }[]
  /** Closing pitch line */
  closing: string
}

const RELATED: { slug: string; label: string }[] = [
  { slug: 'electricians', label: 'Electricians' },
  { slug: 'plumbers', label: 'Plumbers' },
  { slug: 'hvac', label: 'HVAC' },
]

export function TradeLander(props: { content: TradeContent }) {
  const c = props.content
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: `Custom CRM for ${c.tradeDisplay}`,
          description: c.seoDescription,
          path: c.path,
          serviceType: 'Custom Software Development',
        })}
      />
      <JsonLd
        data={breadcrumbSchema({
          items: [
            { label: 'Home', path: '/' },
            { label: 'Custom CRM', path: '/services/custom-crm' },
            { label: c.tradeDisplay, path: c.path },
          ],
        })}
      />

      <PageHeader
        badge={`Custom CRM for ${c.tradeDisplay}`}
        title={`A CRM Built for ${c.tradeDisplay}`}
        highlightWord={c.tradeDisplay}
        description={c.heroDescription}
      />

      {/* Intro / pain */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <FadeInView>
              <div className="w-20 h-20 rounded-2xl bg-surface-low flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-brand-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Stop forcing your {c.trade} into someone else's software
              </h2>
            </FadeInView>
            <FadeInView delay={0.15}>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{c.intro}</p>
                <ul className="space-y-2 pt-2">
                  {c.painPoints.map((p) => (
                    <li
                      key={p}
                      className="flex gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-brand-tertiary mt-1">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 bg-surface-low/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Built for the way {c.trade} actually work
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every feature is shaped by how {c.tradeSingular.toLowerCase()}{' '}
                shops really run — service tickets, install jobs, permits, the
                whole flow.
              </p>
            </div>
          </FadeInView>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {c.features.map((f) => (
              <StaggerItem key={f.title}>
                <Card className="h-full border-subtle-border bg-surface">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-surface-low flex items-center justify-center mb-4">
                      <f.icon className="w-6 h-6 text-brand-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {f.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.description}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Own-it-forever banner */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInView>
            <p className="font-label text-[11px] tracking-[0.25em] uppercase text-brand-tertiary mb-4">
              Own it forever
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              Stop paying monthly for {c.tradeSingular.toLowerCase()} software.
              <br />
              <span className="text-brand-primary">
                Get a CRM you own forever.
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              {c.closing}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="text-base">
                <Link
                  to="/discover"
                  search={{
                    source: c.path.split('/').pop() ?? undefined,
                  }}
                >
                  Get a Custom Quote
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                12 minutes · real scope + price in 24 hours
              </p>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Related trades */}
      <section className="py-16 bg-surface-low/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <div className="text-center mb-8">
              <p className="font-label text-[11px] tracking-[0.25em] uppercase text-brand-tertiary mb-2">
                Also for
              </p>
              <h2 className="text-2xl font-semibold text-foreground">
                Other home service trades we build for
              </h2>
            </div>
          </FadeInView>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {RELATED.filter(
              (r) => r.slug !== c.path.split('/').pop(),
            ).map((r) => (
              <Link
                key={r.slug}
                to={`/services/custom-crm/${r.slug}` as any}
                className="block rounded-lg border border-subtle-border bg-surface p-4 hover:border-brand-primary/40 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">
                    CRM for {r.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-brand-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
            <Link
              to="/services/custom-crm"
              className="block rounded-lg border border-subtle-border bg-surface p-4 hover:border-brand-primary/40 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">
                  All Home Service Trades
                </span>
                <ArrowRight className="w-4 h-4 text-brand-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}

export const DEFAULT_FEATURE_ICONS = {
  Users,
  CalendarClock,
  ClipboardList,
  Smartphone,
  Wrench,
  PlugZap,
}
