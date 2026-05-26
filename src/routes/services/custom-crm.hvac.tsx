import { createFileRoute } from '@tanstack/react-router'
import {
  TradeLander,
  DEFAULT_FEATURE_ICONS as I,
  type TradeContent,
} from '@/components/proposals/trade-lander'
import { pageSeo } from '@/lib/seo'

const SEO_TITLE = 'Custom CRM for HVAC Contractors — Own It Forever — AI Developer'
const SEO_DESCRIPTION =
  'A custom CRM for HVAC contractors — maintenance contracts, install jobs, refrigerant tracking, dispatch. No per-seat fees. Own the software forever.'
const PATH = '/services/custom-crm/hvac'

export const Route = createFileRoute('/services/custom-crm/hvac')({
  component: HvacPage,
  head: () =>
    pageSeo({ title: SEO_TITLE, description: SEO_DESCRIPTION, path: PATH }),
})

const content: TradeContent = {
  trade: 'HVAC contractors',
  tradeSingular: 'HVAC',
  tradeDisplay: 'HVAC',
  path: PATH,
  seoTitle: SEO_TITLE,
  seoDescription: SEO_DESCRIPTION,
  heroDescription:
    "Stop renting field service software that treats your maintenance plans as an afterthought. A CRM shaped to how HVAC contractors actually run — and you own it forever.",
  intro:
    "HVAC lives and dies on recurring revenue. Maintenance agreements are the backbone of cash flow, but generic CRMs treat them as a checkbox instead of a workflow. Add seasonal demand swings, refrigerant tracking, EPA compliance, and equipment-specific job records — the off-the-shelf tools are not built for any of it.",
  painPoints: [
    'Maintenance plans get tracked in spreadsheets because the CRM does not actually schedule them.',
    'Refrigerant logs and EPA compliance live in a separate binder no tech can find at the truck.',
    'Heat-pump vs furnace vs split-system jobs need different checklists; you have one generic form.',
    "Seasonal load — heat waves, cold snaps — buries dispatch in a tool not built for surge planning.",
  ],
  features: [
    {
      icon: I.Users,
      title: 'Equipment History by Property',
      description:
        'Every condenser, air handler, and mini-split tied to the home. Tonnage, refrigerant type, install date, warranty — at the tech\'s fingertips.',
    },
    {
      icon: I.CalendarClock,
      title: 'Maintenance Plans That Actually Schedule',
      description:
        'Spring tune-ups, fall furnace checks, filter swaps — auto-scheduled by contract, auto-routed by territory, auto-invoiced on completion.',
    },
    {
      icon: I.ClipboardList,
      title: 'Install Quotes With Real Pricing',
      description:
        'Build a system replacement quote on-site with live supplier pricing, financing options, and SEER/AFUE rebates folded in.',
    },
    {
      icon: I.Smartphone,
      title: 'Tech Checklists by Equipment Type',
      description:
        'Heat pump? Different checklist than a gas furnace. Mini-split? Different again. Photos, readings, and notes match the job.',
    },
    {
      icon: I.Wrench,
      title: 'Refrigerant Tracking & EPA Compliance',
      description:
        'Log refrigerant added or recovered per job. Print compliance reports without rebuilding from paper logs at year-end.',
    },
    {
      icon: I.PlugZap,
      title: 'QuickBooks, Financing, & SMS',
      description:
        'Invoices to QuickBooks, financing applications to your lender, customer texts before arrival — connected once and persistent.',
    },
  ],
  closing:
    "No per-seat licensing. No annual contract renegotiation. No vendor sunset risk. You commission a CRM tuned to how your HVAC business actually runs — install crews, service techs, maintenance contracts — and you keep the code, the data, and every integration forever.",
}

function HvacPage() {
  return <TradeLander content={content} />
}
