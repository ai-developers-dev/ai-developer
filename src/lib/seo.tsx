// Helpers for per-page SEO metadata + JSON-LD injection.
// Used by TanStack Start route `head` configs and rendered in page bodies.

export const SITE_URL = 'https://aideveloper.dev'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/hero-robot.png`

export interface PageSeoInput {
  title: string
  description: string
  path: string
  ogImage?: string
}

/**
 * Returns meta + link entries to spread into a route's head() config.
 * Always include canonical, OG, Twitter card. Page-specific values override
 * the defaults set in __root.tsx.
 */
export function pageSeo({ title, description, path, ogImage }: PageSeoInput) {
  const url = `${SITE_URL}${path}`
  const image = ogImage ?? DEFAULT_OG_IMAGE
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}

interface JsonLdProps {
  data: Record<string, unknown>
}

/**
 * Renders a JSON-LD schema.org block. Drop this anywhere in a page body —
 * Google parses JSON-LD regardless of head/body location.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

interface ServiceSchemaInput {
  name: string
  description: string
  path: string
  serviceType?: string
}

export function serviceSchema({
  name,
  description,
  path,
  serviceType,
}: ServiceSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    serviceType: serviceType ?? name,
    url: `${SITE_URL}${path}`,
    provider: {
      '@type': 'Organization',
      name: 'AI Developer',
      url: SITE_URL,
    },
    areaServed: 'US',
  }
}

interface BreadcrumbInput {
  items: { label: string; path: string }[]
}

export function breadcrumbSchema({ items }: BreadcrumbInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}
