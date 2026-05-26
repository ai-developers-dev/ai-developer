import { Link } from '@tanstack/react-router'
import { CTASection } from '@/components/sections/cta-section.js'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar } from 'lucide-react'
import { JsonLd, SITE_URL, breadcrumbSchema } from '@/lib/seo'

export interface BlogPostMeta {
  /** Route path including leading slash */
  path: string
  category: string
  title: string
  /** Short summary used for OG description and blog index */
  excerpt: string
  /** Human-readable date e.g. "Feb 20, 2026" */
  date: string
  /** ISO date for schema, e.g. "2026-02-20" */
  isoDate: string
  /** Author name */
  author?: string
}

interface BlogPostProps {
  meta: BlogPostMeta
  children: React.ReactNode
}

export function BlogPost({ meta, children }: BlogPostProps) {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.excerpt,
    datePublished: meta.isoDate,
    dateModified: meta.isoDate,
    author: {
      '@type': 'Person',
      name: meta.author ?? 'AI Developer',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Developer',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo512.png` },
    },
    mainEntityOfPage: `${SITE_URL}${meta.path}`,
  }

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd
        data={breadcrumbSchema({
          items: [
            { label: 'Home', path: '/' },
            { label: 'Blog', path: '/blog' },
            { label: meta.title, path: meta.path },
          ],
        })}
      />

      <article className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </FadeInView>

          <FadeInView delay={0.05}>
            <Badge
              variant="secondary"
              className="mb-4 bg-surface-low text-brand-primary border border-subtle-border"
            >
              {meta.category}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              {meta.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-10">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {meta.date}
              </span>
              {meta.author && <span>· by {meta.author}</span>}
            </div>
          </FadeInView>

          <FadeInView delay={0.1}>
            <div className="prose-content space-y-6 text-foreground/90 leading-relaxed">
              {children}
            </div>
          </FadeInView>
        </div>
      </article>

      <CTASection />
    </>
  )
}

// Typography helpers — keep blog post body markup terse while staying readable.

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-12 mb-4">
      {children}
    </h2>
  )
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">
      {children}
    </h3>
  )
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground leading-relaxed">{children}</p>
  )
}

export function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="space-y-2 pl-6 list-disc text-muted-foreground marker:text-brand-tertiary">
      {children}
    </ul>
  )
}

export function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-l-2 border-brand-primary/40 pl-4 italic text-foreground/80">
      {children}
    </blockquote>
  )
}
