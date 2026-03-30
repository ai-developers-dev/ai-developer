import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header.js'
import { CTASection } from '@/components/sections/cta-section.js'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import { StaggerChildren, StaggerItem } from '@/components/animations/stagger-children.js'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Calendar } from 'lucide-react'

export const Route = createFileRoute('/blog')({
  component: BlogPage,
  head: () => ({
    meta: [
      { title: 'Blog — AI Developer Insights & Updates' },
      {
        name: 'description',
        content:
          'Stay up to date with the latest insights on AI development, web applications, voice AI, and automation from the AI Developer team.',
      },
    ],
  }),
})

const posts = [
  {
    category: 'AI Development',
    title: 'How AI Is Changing the Economics of Software Development',
    excerpt:
      'Traditional software projects take months and cost six figures. AI-powered development is rewriting those rules — here\'s what that means for your business.',
    date: 'Feb 20, 2026',
  },
  {
    category: 'Voice AI',
    title: 'Voice AI Agents: Beyond the Hype',
    excerpt:
      'Voice AI has moved from novelty to necessity. We break down real-world use cases where voice agents are saving businesses thousands of hours per year.',
    date: 'Feb 12, 2026',
  },
  {
    category: 'Automation',
    title: '5 Workflows Every Small Business Should Automate Today',
    excerpt:
      'Still doing things manually? These five automation opportunities can free up your team to focus on what actually grows your business.',
    date: 'Feb 4, 2026',
  },
]

function BlogPage() {
  return (
    <>
      <PageHeader
        badge="Blog"
        title="Insights & Updates"
        highlightWord="Insights"
        description="Practical advice on AI development, automation, and building better software — straight from our team."
      />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <StaggerItem key={post.title}>
                <a href="#" className="block group h-full">
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
                </a>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <CTASection />
    </>
  )
}
