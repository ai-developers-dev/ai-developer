import { createFileRoute, Link } from '@tanstack/react-router'
import {
  BlogPost,
  H2,
  P,
  Quote,
  type BlogPostMeta,
} from '@/components/blog/blog-post'
import { pageSeo } from '@/lib/seo'

const meta: BlogPostMeta = {
  path: '/blog/housecall-pro-vs-custom-crm-features',
  category: 'Custom CRM',
  title:
    "5 Features Housecall Pro Doesn't Have That a Custom CRM Always Does",
  excerpt:
    "If you've outgrown Housecall Pro but ServiceTitan is overkill, these are the five things a custom build does that your SaaS won't — and what they're worth.",
  date: 'May 1, 2026',
  isoDate: '2026-05-01',
  author: 'Doug Allen',
}

export const Route = createFileRoute(
  '/blog/housecall-pro-vs-custom-crm-features',
)({
  component: PostPage,
  head: () =>
    pageSeo({
      title:
        "5 Features Housecall Pro Doesn't Have That Custom CRMs Do",
      description: meta.excerpt,
      path: meta.path,
    }),
})

function PostPage() {
  return (
    <BlogPost meta={meta}>
      <P>
        Housecall Pro is a fine product. We're not here to bury it — it's
        the right tool for a one-truck shop and a perfectly reasonable
        starting point for a 3-4 truck shop. But once you scale past that,
        or once your trade has any complexity beyond simple service calls,
        the gaps start showing.
      </P>
      <P>
        Most contractors paper over these gaps with spreadsheets, group
        texts, and Google Drive folders. Here are five things a purpose-built
        CRM does natively that you're probably duct-taping right now.
      </P>

      <H2>1. Permit & inspection tracking on the job record</H2>
      <P>
        Housecall Pro has no native concept of permits. Electricians and
        HVAC contractors working on anything beyond basic service runs end
        up tracking permit numbers, AHJ submissions, rough-in inspection
        dates, and final inspections in a separate spreadsheet that nobody
        on the truck can see.
      </P>
      <P>
        A custom CRM puts the permit data on the job. Tech pulls up the job
        on their phone, sees the permit number, sees the inspection
        schedule, can attach photos of the inspection card. Office gets a
        real-time view of every permit's status without a Friday afternoon
        spreadsheet reconcile.
      </P>

      <H2>2. Trade-specific equipment + spec fields</H2>
      <P>
        Generic CRMs give you a generic "notes" field. Electricians need to
        know panel size, breaker count, EV charger amperage, transfer
        switch model. HVAC needs tonnage, refrigerant type, SEER rating.
        Plumbers need pipe material and fixture brand.
      </P>
      <P>
        When this lives in free-text notes, you can't search by it, you can't
        report on it, and the next tech to visit the property has to dig
        through three years of paragraph notes to find what's there. A
        custom CRM has structured fields for what your trade actually
        installs.
      </P>

      <H2>3. Recurring maintenance contracts that actually schedule</H2>
      <P>
        Housecall Pro has a "memberships" feature, but most shops we talk to
        end up tracking renewals in a spreadsheet anyway because the
        scheduling layer is too clunky. HVAC tune-up programs, plumbing
        backflow tests, electrical inspection contracts — each has its own
        cadence, and your CRM should auto-route them to the right tech in
        the right window.
      </P>
      <P>
        A custom build can take "annual furnace tune-up, preferred slot
        late September, Joe is the assigned tech" and just do that — every
        year, on time, with the customer texted a confirmation, the invoice
        pre-generated. That's revenue you stop forgetting to collect.
      </P>

      <H2>4. Service vs install workflows on one platform</H2>
      <P>
        Service work and install work move differently. A panel swap is
        scheduled as a one-day ticket with a price. A new construction
        rough-in is phased across weeks with progress billing. Most SaaS
        CRMs treat both as the same "job" record, which means you compromise
        one workflow to fit the other.
      </P>
      <P>
        A custom CRM can have two distinct surfaces — a service queue and a
        project pipeline — that share the same customer and equipment data
        but track time, billing, and milestones differently.
      </P>

      <H2>5. Native QuickBooks sync without the surprise tax</H2>
      <P>
        Housecall Pro charges extra for the QuickBooks integration at
        certain tiers. ServiceTitan's sync has bugs that the community
        complains about loudly on Reddit. Custom CRMs we've built sync
        invoices, payments, and customer records in real time using QBO's
        API directly — no middleware, no monthly fee, no surprise.
      </P>

      <Quote>
        The pattern: anywhere your trade has specificity, the off-the-shelf
        CRM has a generic field. Anywhere you have recurring revenue, the
        SaaS treats it as an afterthought. Anywhere you need to push data
        somewhere else, you pay extra. A custom build inverts all three.
      </Quote>

      <H2>What does this cost vs. what does it save?</H2>
      <P>
        We've covered the cost math in detail in our{' '}
        <Link
          to="/blog/stop-paying-monthly-field-service-software"
          className="text-brand-primary underline"
        >
          monthly SaaS cost analysis
        </Link>
        . Short version: a custom CRM pays itself back inside 18 months
        against Housecall Pro Essentials and even faster against the higher
        tiers.
      </P>
      <P>
        See what a build for your trade actually includes:{' '}
        <Link
          to="/services/custom-crm/electricians"
          className="text-brand-primary underline"
        >
          Electricians
        </Link>{' '}
        ·{' '}
        <Link
          to="/services/custom-crm/plumbers"
          className="text-brand-primary underline"
        >
          Plumbers
        </Link>{' '}
        ·{' '}
        <Link
          to="/services/custom-crm/hvac"
          className="text-brand-primary underline"
        >
          HVAC
        </Link>
        .
      </P>
    </BlogPost>
  )
}
