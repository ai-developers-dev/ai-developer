import { createFileRoute } from '@tanstack/react-router'
import {
  TradeLander,
  DEFAULT_FEATURE_ICONS as I,
  type TradeContent,
} from '@/components/proposals/trade-lander'
import { pageSeo } from '@/lib/seo'

const SEO_TITLE = 'Custom CRM for Plumbers — Own It Forever — AI Developer'
const SEO_DESCRIPTION =
  'A custom CRM built for plumbers — drain calls, water heaters, repipes, emergency dispatch, photo-rich job histories. No monthly fees. Own it forever.'
const PATH = '/services/custom-crm/plumbers'

export const Route = createFileRoute('/services/custom-crm/plumbers')({
  component: PlumbersPage,
  head: () =>
    pageSeo({ title: SEO_TITLE, description: SEO_DESCRIPTION, path: PATH }),
})

const content: TradeContent = {
  trade: 'plumbers',
  tradeSingular: 'Plumber',
  tradeDisplay: 'Plumbers',
  path: PATH,
  seoTitle: SEO_TITLE,
  seoDescription: SEO_DESCRIPTION,
  heroDescription:
    'Stop running emergency dispatch out of a group text and a whiteboard. A CRM shaped to how plumbing shops actually move — and you own the software forever.',
  intro:
    "Plumbers run on speed. A water heater leaking at 9 PM doesn't wait for your generic field service app to render its dashboard. Off-the-shelf CRMs were built for predictable schedules; you live in the world of repipes that turn into mold remediation and drain calls that become slab leaks.",
  painPoints: [
    'Emergency calls bottleneck through whoever answers the office phone, not the closest truck.',
    'Photo-rich job histories (before/after) get scattered across Google Photos, texts, and email.',
    'Recurring drain maintenance contracts fall through the cracks the moment you stop micromanaging.',
    "Per-tech pricing punishes you for being a 4-truck shop instead of a single owner-operator.",
  ],
  features: [
    {
      icon: I.Users,
      title: 'Job History by Property',
      description:
        'Every drain call, water heater install, and repipe tied to the address — search by house, not by customer name.',
    },
    {
      icon: I.CalendarClock,
      title: 'Emergency Dispatch That Routes Smart',
      description:
        "After-hours calls hit the closest available tech first. Live ETA updates push to the customer's phone automatically.",
    },
    {
      icon: I.ClipboardList,
      title: 'Quote-on-the-Truck',
      description:
        'Snapshot the situation, build a quote on the spot, take a card before you start work. No more "I\'ll send it tonight" promises.',
    },
    {
      icon: I.Smartphone,
      title: 'Photo Documentation Built-In',
      description:
        'Before/after shots, leak source, pipe condition, model & serial numbers — all attached to the job, all searchable later.',
    },
    {
      icon: I.Wrench,
      title: 'Recurring Maintenance Contracts',
      description:
        'Annual drain cleaning, water heater flushes, backflow tests — auto-scheduled, auto-invoiced, never forgotten.',
    },
    {
      icon: I.PlugZap,
      title: 'QuickBooks, Stripe, & SMS',
      description:
        "Invoices push to QuickBooks, deposits flow through Stripe, customers get text reminders — wired once and they stay wired.",
    },
  ],
  closing:
    "No per-seat licensing. No quarterly price hikes. No \"sunset notice\" emails from your vendor. You commission a CRM built around how your plumbing shop actually runs, and you keep the code, the data, and the integrations for the life of the business.",
}

function PlumbersPage() {
  return <TradeLander content={content} />
}
