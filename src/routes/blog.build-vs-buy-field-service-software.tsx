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
  path: '/blog/build-vs-buy-field-service-software',
  category: 'Custom CRM',
  title: "Building vs. Buying Field Service Software: A Contractor's Guide",
  excerpt:
    "Six months ago, building your own field service app would've been crazy. Today it's the smartest move a 3-truck shop can make. Here's how to decide.",
  date: 'Apr 24, 2026',
  isoDate: '2026-04-24',
  author: 'Doug Allen',
}

export const Route = createFileRoute(
  '/blog/build-vs-buy-field-service-software',
)({
  component: PostPage,
  head: () =>
    pageSeo({
      title:
        "Build vs Buy Field Service Software: A Contractor's Guide",
      description: meta.excerpt,
      path: meta.path,
    }),
})

function PostPage() {
  return (
    <BlogPost meta={meta}>
      <P>
        The classic advice was: never build your own field service software.
        It's a solved problem, vendors are everywhere, and a small contractor
        has no business writing code. That advice was right in 2018. It is
        no longer right in 2026, and the change is so recent that most
        contractors haven't caught up.
      </P>
      <P>
        Here's the honest framework for deciding which side of the line your
        shop sits on.
      </P>

      <H2>What changed</H2>
      <P>
        Three things shifted in the last 18 months that flipped the math:
      </P>
      <UL>
        <li>
          <strong>AI-accelerated development</strong> cut build time by
          60-80%. What used to take a team six months now ships in 4-6
          weeks. Cost dropped from $150k+ to $20-35k.
        </li>
        <li>
          <strong>Modern hosting platforms</strong> (Vercel, Convex,
          Supabase) eliminated infrastructure complexity. You don't need a
          server admin. Hosting costs $50-100/month for a shop your size.
        </li>
        <li>
          <strong>SaaS pricing kept climbing</strong>. ServiceTitan,
          Housecall Pro, FieldEdge all raised prices double-digits in
          2024-2025 while reducing what's included at lower tiers.
        </li>
      </UL>
      <P>
        Together, these mean a custom build now pays back in 12-18 months
        for a 3+ truck shop. That used to take a decade.
      </P>

      <H2>When to buy (still)</H2>
      <P>You should buy SaaS if:</P>
      <UL>
        <li>You're a solo operator or two-truck shop with simple service work</li>
        <li>You have no specialized workflows your CRM has to support (no permits, no maintenance contracts, no install phases)</li>
        <li>You actively want to use the vendor's marketplace ecosystem (reviews, payments, financing add-ons)</li>
        <li>You'd rather pay $79/mo forever than $25k once</li>
      </UL>
      <P>
        For these shops, Housecall Pro Starter or Jobber Core is a
        legitimate forever-home. You won't outgrow them, and the savings
        from building custom don't justify the project effort.
      </P>

      <H2>When to build</H2>
      <P>Build custom if:</P>
      <UL>
        <li>
          You're running 3+ trucks and your monthly software bill is over
          $400
        </li>
        <li>
          Your trade has specificity the off-the-shelf doesn't capture
          (permits, equipment specs, install phases, maintenance contracts,
          compliance reporting)
        </li>
        <li>
          You've outgrown one CRM and are dreading the migration cost of
          switching to the next one
        </li>
        <li>
          You want software that fits the way <em>you</em> run, not the way
          a SaaS company assumes you should
        </li>
        <li>You're tired of being told "that's a feature on our roadmap"</li>
      </UL>

      <Quote>
        The biggest mental block is "we're not a software company." That's
        true. But you're not the one building the software — you're the one
        commissioning it. Same way you'd commission a custom truck buildout
        or a shop layout. You design what you need, the specialist builds it.
      </Quote>

      <H2>The risk you should actually worry about</H2>
      <P>
        The real risk isn't "what if the developer disappears" (the code is
        yours — another developer can pick it up). The real risk is
        <strong> scope creep</strong>. You start with "just a dispatch tool"
        and six months later you're trying to build an ERP.
      </P>
      <P>
        Mitigation: ship a focused v1 in 4-6 weeks. Use it. Find the gaps in
        real work. Then commission v2 with knowledge instead of speculation.
        This is how every CRM you've ever liked actually got built.
      </P>

      <H2>The decision tree</H2>
      <UL>
        <li>
          <strong>Annual revenue under $500k?</strong> Stay on SaaS. You'll
          get a better ROI buying ads than building software.
        </li>
        <li>
          <strong>$500k-$2M, simple workflows?</strong> SaaS still fine, but
          start watching your monthly bill. If it crosses $500/month, the
          math flips.
        </li>
        <li>
          <strong>$1M+, specialized workflows?</strong> Build. The custom
          CRM pays back inside two years and saves you forever after.
        </li>
        <li>
          <strong>$3M+?</strong> You should have built two years ago. Do it
          now before you sign another ServiceTitan multi-year.
        </li>
      </UL>

      <H2>What a build actually looks like</H2>
      <P>For our home service custom builds, the typical engagement:</P>
      <UL>
        <li><strong>Week 1:</strong> Ride-along + working session with your office. Map the real workflow.</li>
        <li><strong>Weeks 2-4:</strong> Build core: customers, jobs, dispatch, mobile app, invoicing.</li>
        <li><strong>Week 5:</strong> You start running real work in it. We watch where it breaks.</li>
        <li><strong>Week 6:</strong> Refinements, integrations (QuickBooks, supplier, SMS), training.</li>
        <li><strong>Week 7+:</strong> You're off SaaS. We're on retainer for change orders.</li>
      </UL>

      <P>
        Want to see the specifics for your trade? Read the{' '}
        <Link to="/services/custom-crm" className="text-brand-primary underline">
          Custom CRM overview
        </Link>{' '}
        or jump to the trade-specific build for{' '}
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
