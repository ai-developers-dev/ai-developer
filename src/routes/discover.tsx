import { createFileRoute, useSearch } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header.js'
import { DiscoveryForm } from '@/components/discovery/discovery-form'
import { JsonLd, breadcrumbSchema, pageSeo } from '@/lib/seo'

const SEO_PATH = '/discover'
const SEO_TITLE = 'Custom CRM Discovery — Get a Real Quote — AI Developer'
const SEO_DESCRIPTION =
  'Tell us about your home service business in 12 minutes and get a custom CRM scope + price within 24 hours. No sales calls required to start.'

export const Route = createFileRoute('/discover')({
  component: DiscoverPage,
  head: () =>
    pageSeo({ title: SEO_TITLE, description: SEO_DESCRIPTION, path: SEO_PATH }),
  validateSearch: (search: Record<string, unknown>) => ({
    source: typeof search.source === 'string' ? search.source : undefined,
  }),
})

function DiscoverPage() {
  const { source } = useSearch({ from: '/discover' })

  return (
    <>
      <JsonLd
        data={breadcrumbSchema({
          items: [
            { label: 'Home', path: '/' },
            { label: 'Custom CRM', path: '/services/custom-crm' },
            { label: 'Discovery', path: SEO_PATH },
          ],
        })}
      />

      <PageHeader
        badge="Discovery"
        title="Let's design your custom CRM"
        highlightWord="custom CRM"
        description="Answer 20 questions in about 12 minutes. We'll send back a real scope and a price range within 24 hours — no sales call required to get started."
      />

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <DiscoveryForm source={source} />
      </section>
    </>
  )
}
