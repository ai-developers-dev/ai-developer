import { createFileRoute } from '@tanstack/react-router'
import {
  TradeLander,
  DEFAULT_FEATURE_ICONS as I,
  type TradeContent,
} from '@/components/proposals/trade-lander'
import { pageSeo } from '@/lib/seo'

const SEO_TITLE = 'Custom CRM for Electricians — Own It Forever — AI Developer'
const SEO_DESCRIPTION =
  'A custom CRM built for electricians — panel upgrades, service tickets, permits, EV chargers, dispatch. No monthly fees. Own the software forever.'
const PATH = '/services/custom-crm/electricians'

export const Route = createFileRoute('/services/custom-crm/electricians')({
  component: ElectriciansPage,
  head: () =>
    pageSeo({ title: SEO_TITLE, description: SEO_DESCRIPTION, path: PATH }),
})

const content: TradeContent = {
  trade: 'electricians',
  tradeSingular: 'Electrician',
  tradeDisplay: 'Electricians',
  path: PATH,
  seoTitle: SEO_TITLE,
  seoDescription: SEO_DESCRIPTION,
  heroDescription:
    "Stop wedging panel upgrades and permit tracking into someone else's plumbing software. A CRM shaped to how electrical contractors actually run — and you own it forever.",
  intro:
    "Generic field service apps treat every trade the same. Electricians lose the fields that matter — panel sizes, breaker counts, permit numbers, EV charger specs, inspection dates — while paying $200+ per seat per month for tools designed for plumbers and HVAC techs first.",
  painPoints: [
    'Tracking permits and inspections in a spreadsheet because the CRM has no field for it.',
    "Service vs. new-construction jobs need different workflows, but you've got one form.",
    'Per-tech licensing means hiring an apprentice triples your software bill.',
    "When you outgrow Housecall Pro or jump to ServiceTitan, your data doesn't come with you.",
  ],
  features: [
    {
      icon: I.Users,
      title: 'Panel & Service History',
      description:
        'Every panel upgrade, breaker replacement, and outlet add-on tied to the address. Your techs walk in already knowing what they last touched.',
    },
    {
      icon: I.CalendarClock,
      title: 'Service vs. New Construction Dispatch',
      description:
        'Two different workflows in one tool. Service trucks see today\'s tickets; install crews see the multi-week phase plan.',
    },
    {
      icon: I.ClipboardList,
      title: 'Permit & Inspection Tracking',
      description:
        'Permit numbers, AHJ submissions, rough-in and final inspection dates — built into the job, not bolted on with sticky notes.',
    },
    {
      icon: I.Smartphone,
      title: 'On-Site Quoting for Service Calls',
      description:
        'A tech can quote a panel swap on the porch, get a signature, and take a deposit before they leave — no callback to the office.',
    },
    {
      icon: I.Wrench,
      title: 'EV, Solar, & Battery Add-Ons',
      description:
        'Track the niche-specific specs your generic CRM ignores: charger amperage, panel headroom, transfer switch type, interconnect status.',
    },
    {
      icon: I.PlugZap,
      title: 'QuickBooks & Supplier Integrations',
      description:
        'Push invoices to QuickBooks, pull pricing from your supplier catalog, send SMS arrival texts — connected once, set forever.',
    },
  ],
  closing:
    'No per-seat licensing. No surprise price hikes. No vendor lock-in. You commission a CRM that fits your electrical business and you keep the code, the data, and every integration for the life of the company.',
}

function ElectriciansPage() {
  return <TradeLander content={content} />
}
