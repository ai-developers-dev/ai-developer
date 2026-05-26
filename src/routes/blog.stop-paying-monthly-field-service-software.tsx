import { createFileRoute, Link } from '@tanstack/react-router'
import {
  BlogPost,
  H2,
  P,
  UL,
  Quote,
  type BlogPostMeta,
} from '@/components/blog/blog-post'
import { pageSeo } from '@/lib/seo'

const meta: BlogPostMeta = {
  path: '/blog/stop-paying-monthly-field-service-software',
  category: 'Custom CRM',
  title: 'Stop Paying Monthly for Field Service Software (We Did the Math)',
  excerpt:
    "Field service SaaS keeps creeping up — per-tech fees, modules, integrations. Here's what a 5-truck shop actually pays over 5 years, and what a custom CRM costs instead.",
  date: 'May 22, 2026',
  isoDate: '2026-05-22',
  author: 'Doug Allen',
}

export const Route = createFileRoute(
  '/blog/stop-paying-monthly-field-service-software',
)({
  component: PostPage,
  head: () =>
    pageSeo({
      title:
        'Stop Paying Monthly for Field Service Software (We Did the Math)',
      description: meta.excerpt,
      path: meta.path,
    }),
})

function PostPage() {
  return (
    <BlogPost meta={meta}>
      <P>
        Every electrical, plumbing, and HVAC contractor we talk to has the
        same complaint: their field service software bill keeps going up. A
        seat costs $79 a month, then $99, then they're "upgraded" to a new
        tier that bundles in features they never asked for. Add a tech, add a
        line. Drop a tech, the contract still locks you in.
      </P>
      <P>
        We sat down and did the actual math on what a typical 5-truck shop
        spends over five years. Then we compared it to what a custom CRM —
        built once, owned forever — costs over the same window. The numbers
        are stark.
      </P>

      <H2>The 5-truck shop SaaS bill</H2>
      <P>
        Let's take a realistic baseline. A small home service shop with five
        techs, one office manager, and one owner — seven total seats. Most
        major field service platforms charge per seat at the mid-tier:
      </P>
      <UL>
        <li>ServiceTitan Starter: ~$398/mo + $99/seat — about $1,090/mo for 7 seats once you include the platform fee.</li>
        <li>Housecall Pro Max: $279/mo for unlimited users, but their "essentials" tier hits $129/mo and most shops outgrow it within a year.</li>
        <li>Jobber Grow: $245/mo for unlimited users on the higher tier, plus per-feature add-ons.</li>
      </UL>
      <P>
        Take a conservative middle: <strong>$650/month all-in</strong>. That's
        $7,800 a year. Over five years, that's <strong>$39,000</strong> — and
        that's if prices never go up. (They will. ServiceTitan raised prices
        12% in 2025 alone.)
      </P>

      <H2>What you actually own after 5 years of paying</H2>
      <P>
        Nothing. You own no code, no platform, no real ownership of the
        customer database (you can export it, but try migrating five years of
        nested job history, photos, and notes to a different platform and
        watch what happens).
      </P>
      <P>
        The day you decide to leave is the day you discover how much you
        depended on them.
      </P>

      <H2>What a custom CRM costs instead</H2>
      <P>
        A custom CRM purpose-built for a home service shop with AI-accelerated
        development now runs in the <strong>$15,000 to $35,000</strong> range,
        depending on integrations. After year one, your only ongoing cost is
        hosting (usually $50-100/month) and occasional change orders when you
        want a new feature.
      </P>
      <P>Let's run the comparison:</P>
      <UL>
        <li><strong>SaaS over 5 years (no price increases):</strong> $39,000</li>
        <li><strong>SaaS over 5 years (10% annual increase):</strong> $47,600</li>
        <li><strong>Custom CRM, built once + hosting:</strong> $25,000 (build) + $5,400 (hosting over 5 years) = <strong>$30,400</strong></li>
      </UL>
      <P>
        Even before we factor in price hikes, the custom build is cheaper.
        With realistic increases, it's not even close. And at year six,
        seven, eight, the gap widens every single month.
      </P>

      <H2>What you actually get with a custom CRM</H2>
      <P>
        Beyond the math, the bigger win is the software actually fits your
        shop. We've seen contractors give up entire workflows because their
        CRM didn't support them. Permit tracking gets pushed to a spreadsheet.
        Maintenance contracts live in a paper binder. Photo documentation
        scatters across Google Drive and group texts.
      </P>
      <P>A custom CRM is shaped to how your shop actually moves:</P>
      <UL>
        <li>The fields you need, none of the ones you don't</li>
        <li>Dispatch logic tuned to your service area and crew structure</li>
        <li>Permits, inspections, and compliance built in — not bolted on</li>
        <li>Integrations to the supplier catalogs and accounting tools you already use</li>
        <li>A mobile app designed for your techs, not for a CRM software company's idea of a tech</li>
      </UL>

      <H2>What about the risk?</H2>
      <P>
        The honest objection: what happens if the developer disappears or
        stops maintaining it? This is a legitimate concern with custom
        software, and it has a real answer: you own the code. Source code in
        your private GitHub. Hosting on your own AWS or Vercel account.
        Database under your control. If we got hit by a bus tomorrow, another
        developer can pick it up next week.
      </P>
      <Quote>
        That's the difference. With a CRM you own, the worst-case scenario
        is "we hire someone to add a feature." With SaaS, the worst-case
        scenario is "they sunset the product and we have 90 days to migrate."
      </Quote>

      <H2>The case for moving now</H2>
      <P>
        Every month you delay is another $650+ out the door. Build a custom
        CRM in 4 weeks, switch when it's ready, and pay off the build in 18
        months. After that, every month you're saving 100% of what you used
        to spend on software.
      </P>
      <P>
        Want to see what your shop's numbers look like specifically? Read our{' '}
        <Link to="/services/custom-crm" className="text-brand-primary underline">
          Custom CRM overview
        </Link>{' '}
        or jump straight to the trade-specific build —{' '}
        <Link
          to="/services/custom-crm/electricians"
          className="text-brand-primary underline"
        >
          electricians
        </Link>
        ,{' '}
        <Link
          to="/services/custom-crm/plumbers"
          className="text-brand-primary underline"
        >
          plumbers
        </Link>
        , or{' '}
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
