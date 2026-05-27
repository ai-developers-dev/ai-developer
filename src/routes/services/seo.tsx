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
  Search,
  MapPin,
  Globe,
  PenLine,
  BarChart3,
  Wrench,
  FileText,
  Sparkles,
} from 'lucide-react'
import { JsonLd, pageSeo, serviceSchema, breadcrumbSchema } from '@/lib/seo'

const SEO_PATH = '/services/seo'
const SEO_TITLE = 'SEO Services — Local & Global Search Optimization | AI Developer'
const SEO_DESCRIPTION =
  'Local and national SEO with AI-assisted content writing. Rank in Google, capture map-pack traffic, and turn search into your top lead source.'

export const Route = createFileRoute('/services/seo')({
  component: SeoServicesPage,
  head: () =>
    pageSeo({ title: SEO_TITLE, description: SEO_DESCRIPTION, path: SEO_PATH }),
})

const pillars = [
  {
    icon: MapPin,
    title: 'Local SEO',
    description:
      'Google Business Profile optimization, map-pack targeting, citation cleanup, and review velocity for service-area businesses that need to dominate their zip code.',
  },
  {
    icon: Globe,
    title: 'National & Global SEO',
    description:
      'Topical authority, technical site architecture, internal linking, and high-intent keyword targeting for brands competing in larger markets.',
  },
  {
    icon: PenLine,
    title: 'AI-Assisted Content Writing',
    description:
      'Long-form articles, location pages, and service pages written with our AI workflows — every draft edited by humans before it ships.',
  },
  {
    icon: Wrench,
    title: 'Technical SEO',
    description:
      'Core Web Vitals, schema markup, sitemap and robots hygiene, crawlability fixes, and indexing diagnostics so search engines see everything you publish.',
  },
  {
    icon: BarChart3,
    title: 'Reporting & Tracking',
    description:
      'Rank tracking, GSC integration, and a monthly dashboard that ties keyword movement to real lead and revenue outcomes.',
  },
  {
    icon: Sparkles,
    title: 'Conversion-Ready Pages',
    description:
      'Built-in lead capture, click-to-call, and booking widgets on every page we ship — so the traffic we earn actually becomes customers.',
  },
]

const contentTypes = [
  {
    title: 'Service & Location Pages',
    description:
      'Dedicated landers for every service in every city you serve — the foundation of local search dominance.',
  },
  {
    title: 'Long-Form Blog Articles',
    description:
      '1,500–3,000 word pieces engineered to rank for buyer-intent keywords your competitors are ignoring.',
  },
  {
    title: 'FAQ & Knowledge Hubs',
    description:
      'Question-driven content that wins featured snippets and shows up in AI Overviews.',
  },
  {
    title: 'Case Studies & Comparison Pieces',
    description:
      '"Brand X vs Brand Y" and customer story content that captures high-intent late-funnel traffic.',
  },
]

function SeoServicesPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'SEO Services — Local & Global',
          description: SEO_DESCRIPTION,
          path: SEO_PATH,
        })}
      />
      <JsonLd
        data={breadcrumbSchema({
          items: [
            { label: 'Home', path: '/' },
            { label: 'Services', path: '/about' },
            { label: 'SEO', path: SEO_PATH },
          ],
        })}
      />
      <PageHeader
        badge="SEO"
        title="SEO That Actually Moves Rankings — and Pipeline"
        highlightWord="Pipeline"
        description="Local and national search optimization paired with AI-assisted content writing. Built for businesses that need search to be a real, measurable lead channel."
      />

      {/* Intro */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInView>
              <div className="w-20 h-20 rounded-2xl bg-surface-low flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-brand-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Local or global — search is your highest-intent channel
              </h2>
            </FadeInView>
            <FadeInView delay={0.15}>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Whether you're an electrician trying to own the map pack in
                  three zip codes or a SaaS brand chasing national keywords,
                  the playbook is the same: technical hygiene, real topical
                  authority, and content that earns links and clicks.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We pair AI-assisted writing workflows with hands-on editing
                  to ship more pages per month than a traditional agency — at
                  a fraction of the cost. Every page is tracked, indexed, and
                  measured against real conversion outcomes.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  No quarterly check-ins. No "we'll get to it next month."
                  Weekly publishing cadence, monthly reporting, and a clear
                  line from impression → click → booked job.
                </p>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="py-20 bg-surface-low/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                What we ship
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A full SEO program — not a checklist.
              </p>
            </div>
          </FadeInView>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p) => (
              <StaggerItem key={p.title}>
                <Card className="h-full border-subtle-border bg-surface">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-surface-low flex items-center justify-center mb-4">
                      <p.icon className="w-6 h-6 text-brand-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {p.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {p.description}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Content writing detail */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <FadeInView>
              <div className="w-20 h-20 rounded-2xl bg-surface-low flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-brand-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Content writing that ranks — built on AI workflows we own
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We use our own AI assistants to research, outline, and draft
                content faster than any traditional agency. Every piece is
                edited by a human, fact-checked against your business, and
                optimized for the exact queries your future customers type.
              </p>
            </FadeInView>
            <FadeInView delay={0.15}>
              <div className="space-y-3">
                {contentTypes.map((c) => (
                  <div
                    key={c.title}
                    className="rounded-xl border border-subtle-border bg-surface p-5"
                  >
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      {c.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {c.description}
                    </p>
                  </div>
                ))}
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
