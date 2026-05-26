import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header.js'
import { CTASection } from '@/components/sections/cta-section.js'
import { StaggerChildren, StaggerItem } from '@/components/animations/stagger-children.js'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Calendar } from 'lucide-react'
import { pageSeo } from '@/lib/seo'

export const Route = createFileRoute('/blog')({
  component: BlogPage,
  head: () =>
    pageSeo({
      title: 'AI Development Blog — Custom Software Insights',
      description:
        'Insights on building custom CRMs, AI agents, and automations for small business — from the AI Developer team.',
      path: '/blog',
    }),
})

const posts = [
  {
    category: 'Custom CRM',
    title: 'Stop Paying Monthly for Field Service Software (We Did the Math)',
    excerpt:
      "Field service SaaS keeps creeping up — per-tech fees, modules, integrations. Here's what a 5-truck shop actually pays over 5 years, and what a custom CRM costs instead.",
    date: 'May 22, 2026',
    href: '/blog/stop-paying-monthly-field-service-software',
  },
  {
    category: 'Electricians',
    title: 'The Honest ServiceTitan Alternative for Small Electrical Teams',
    excerpt:
      "ServiceTitan is built for $5M+ shops. If you're running 2-10 trucks, here's what to actually look at — and why a custom CRM beats every off-the-shelf option.",
    date: 'May 15, 2026',
    href: '/blog/servicetitan-alternative-small-electricians',
  },
  {
    category: 'Voice AI',
    title: 'How a Custom AI Voice Agent Books HVAC Dispatch 24/7',
    excerpt:
      "What a working voice AI dispatcher actually does for an HVAC shop — call answering, intake, scheduling, and emergency triage. Plus the tradeoffs nobody talks about.",
    date: 'May 8, 2026',
    href: '/blog/custom-ai-voice-agent-hvac-dispatch',
  },
  {
    category: 'Custom CRM',
    title:
      "5 Features Housecall Pro Doesn't Have That a Custom CRM Always Does",
    excerpt:
      "If you've outgrown Housecall Pro but ServiceTitan is overkill, these are the five things a custom build does that your SaaS won't — and what they're worth.",
    date: 'May 1, 2026',
    href: '/blog/housecall-pro-vs-custom-crm-features',
  },
  {
    category: 'Custom CRM',
    title: "Building vs. Buying Field Service Software: A Contractor's Guide",
    excerpt:
      "Six months ago, building your own field service app would've been crazy. Today it's the smartest move a 3-truck shop can make. Here's how to decide.",
    date: 'Apr 24, 2026',
    href: '/blog/build-vs-buy-field-service-software',
  },
] as const

function BlogPage() {
  return (
    <>
      <PageHeader
        badge="Blog"
        title="Custom CRM, AI Voice, and Field Service Insights"
        highlightWord="Custom CRM"
        description="Practical writing on building custom CRMs, AI voice agents, and field service software for electricians, plumbers, and HVAC."
      />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <StaggerItem key={post.title}>
                <Link to={post.href} className="block group h-full">
                  <Card className="h-full border-subtle-border bg-surface transition-shadow group-hover:shadow-lg">
                    <CardContent className="pt-6">
                      <Badge
                        variant="secondary"
                        className="mb-4 bg-surface-low text-brand-primary border border-subtle-border"
                      >
                        {post.category}
                      </Badge>
                      <h3
                        className="text-xl font-semibold text-foreground mb-3 group-hover:text-brand-primary transition-colors"

                      >
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1 text-sm font-medium text-brand-primary group-hover:gap-2 transition-all">
                          Read more
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <CTASection />
    </>
  )
}
