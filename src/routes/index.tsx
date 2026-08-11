import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { pageSeo } from '@/lib/seo'

export const Route = createFileRoute('/')({
  component: HomePage,
  head: () =>
    pageSeo({
      title: 'AI Developer — Custom Software & AI You Own',
      description:
        'AI Developer builds custom websites, web apps, voice AI agents, and home service CRMs — owned forever, no monthly SaaS fees.',
      path: '/',
    }),
})

function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Crm />
      <Process />
      <Talk />
    </>
  )
}

/* ══════════════════════════════════════════════════════════
   HERO — locked viewport, cyborg subject, breathing zoom
   ══════════════════════════════════════════════════════════ */

const proofChips = [
  { value: '2–6 WKS', label: 'to launch', size: 'text-base tracking-[-0.015em]' },
  { value: '$0', label: 'per seat', size: 'text-xl' },
  { value: '24/7', label: 'calls answered', size: 'text-base tracking-[-0.015em]' },
]

function Hero() {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      {/* Backdrop radial */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 110% at 50% 42%, #131a24 0%, #05070a 58%, #000 100%)',
        }}
      />
      {/* Centre glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 'min(46vw, 760px)',
          height: 'min(46vw, 760px)',
          background:
            'radial-gradient(circle, rgba(239,106,0,0.22) 0%, rgba(239,106,0,0.07) 42%, rgba(239,106,0,0) 70%)',
        }}
      />
      {/* Subject */}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-center">
        <img
          src="/images/cyborg-head.webp"
          alt=""
          width={1024}
          height={1536}
          fetchPriority="high"
          className="h-[96%] w-auto object-contain"
          style={{
            filter: 'drop-shadow(0 0 60px rgba(239,106,0,0.25))',
            animation: 'hero-zoom 24s ease-in-out infinite alternate',
            transformOrigin: 'bottom center',
          }}
        />
      </div>
      {/* Vignettes */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 100% at 50% 45%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.6) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.75) 100%)',
        }}
      />

      {/* Content — sits under the fixed navbar */}
      <div className="relative z-10 flex h-full flex-col side-pad pt-[78px] pb-4">
        <h2 className="m-0 text-[clamp(16px,1.3vw,20px)] font-normal leading-[1.15] tracking-[0.025em]">
          <span className="block">SOFTWARE &amp;</span>
          <span
            className="block font-label"
            style={{ fontSize: 'clamp(22px, min(2.1vw, 3.4vh), 30px)' }}
          >
            AI SYSTEMS
          </span>
        </h2>

        <div className="min-h-4 flex-1" />

        <div className="pb-4">
          <div className="grid grid-cols-1 items-center gap-[clamp(16px,1.4vw,24px)] md:grid-cols-[1.1fr_0.9fr]">
            <h1 className="display-h1">
              {/* "SOFTWARE" runs at 1.5em (vs 1.25em for other pixel words) so
                  it carries the line now that "I BUILD THE" is gone. Inline —
                  .pixel-word is unlayered CSS and would beat a Tailwind size
                  utility in the cascade. */}
              <span
                className="pixel-word pixel-shimmer"
                style={{ fontSize: '1.5em' }}
              >
                SOFTWARE
              </span>{' '}
              YOUR
              <br />
              {/* nbsp so the em dash can never orphan onto its own line */}
              BUSINESS OWNS{' —'}
              <br />
              <span className="pixel-word">NOT RENTS</span>
            </h1>

            <div className="flex flex-col items-start gap-[clamp(14px,1.2vw,22px)] md:items-end md:justify-end">
              <a
                href="#talk"
                className="flex items-center gap-3 border border-white/30 bg-white/5 px-6 py-3 backdrop-blur-[4px] transition-colors duration-200 hover:bg-white/10"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="text-sm tracking-[0.05em]">WATCH A BUILD</span>
              </a>

              <div className="flex flex-col items-start gap-3 md:items-end">
                {proofChips.map((chip) => (
                  <div
                    key={chip.label}
                    className="flex items-center gap-2 bg-[#0B0B0B] px-4 py-2"
                  >
                    <span className={`font-bold ${chip.size}`}>{chip.value}</span>
                    <span className="text-xs text-white/50">{chip.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-[18px] grid grid-cols-1 gap-4 pt-3.5 md:grid-cols-2">
            <div className="text-xs text-white/60">
              Taking on new builds this quarter.{' '}
              <a
                href="#talk"
                className="text-[#EF6A00] transition-colors duration-200 hover:text-[#FF8A2B]"
              >
                Book a 20-min call
              </a>
            </div>
            <div className="text-xs text-white/60 md:text-right">
              Fixed-price quotes • You keep the source code
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════
   01 / SERVICES
   ══════════════════════════════════════════════════════════ */

const serviceCards = [
  {
    href: '/services/custom-crm',
    eyebrow: 'Most requested',
    accent: true,
    title: 'Custom CRM',
    body: 'Dispatch, quotes, invoices and job history shaped around your crews. Built once, yours forever — for electricians, plumbers and HVAC.',
  },
  {
    href: '/services/websites',
    eyebrow: 'Get found',
    accent: false,
    title: 'Websites & SEO',
    body: 'Fast sites that convert, plus local SEO that puts you in the map pack for buyer-intent searches.',
  },
  {
    href: '/services/voice-ai',
    eyebrow: 'Answer every lead',
    accent: false,
    title: 'Voice & Chat Agents',
    body: 'Picks up at 9pm on a Sunday, qualifies the job, books it on the calendar, texts you the summary.',
  },
  {
    href: '/services/ai-automations',
    eyebrow: 'Cut the busywork',
    accent: false,
    title: 'Automations & Assistants',
    body: 'Lead routing, data entry, follow-up sequences, and assistants that read your own documents.',
  },
]

function Services() {
  return (
    <section id="services" className="section-pad border-t border-white/10">
      <div className="mx-auto max-w-[1320px]">
        <div className="eyebrow">01 / Services</div>
        <h2 className="display-h2 mt-5 max-w-[820px]">
          START WITH WHAT'S <span className="pixel-word">COSTING</span> YOU MONEY
        </h2>
        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {serviceCards.map((card) => (
            <Link
              key={card.href}
              to={card.href}
              className="flex flex-col gap-3.5 border border-white/10 bg-[#0B0B0B] p-7 transition-colors duration-200 hover:border-[#EF6A00]"
            >
              <div
                className={`eyebrow text-[13px] ${card.accent ? 'eyebrow-accent' : ''}`}
              >
                {card.eyebrow}
              </div>
              <div className="text-[22px] font-bold tracking-[0.01em]">{card.title}</div>
              <p className="m-0 flex-1 text-sm leading-[1.6] text-white/60">{card.body}</p>
              <div className="text-[13px] text-white/80">View specification →</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════
   02 / CRM
   ══════════════════════════════════════════════════════════ */

const crmRows = [
  'Job board your dispatcher reads across the room',
  'Quote to invoice without retyping anything',
  'Works on a phone in a truck, offline-tolerant',
  'Your data exports any time, no lock-in',
]

const trades = [
  { label: 'ELECTRICIANS', href: '/services/custom-crm/electricians' },
  { label: 'PLUMBERS', href: '/services/custom-crm/plumbers' },
  { label: 'HVAC', href: '/services/custom-crm/hvac' },
]

function Crm() {
  return (
    <section id="crm" className="section-pad border-t border-white/10">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-[clamp(32px,4vw,72px)] md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="eyebrow">02 / Own it forever</div>
          <h2 className="display-h2 mt-5">
            A CRM YOU <span className="pixel-word">OWN</span>,
            <br />
            NOT SUBSCRIBE TO
          </h2>
          <p className="mt-6 max-w-[520px] text-base leading-[1.65] text-white/60">
            A typical 8-person shop pays $640/mo for field-service SaaS and $300/mo for
            an answering service — forever. One fixed-price build replaces both, and
            adding your tenth user costs nothing.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {trades.map((trade) => (
              <Link
                key={trade.href}
                to={trade.href}
                className="border border-white/30 px-5 py-[11px] text-[13px] tracking-[0.05em] transition-colors duration-200 hover:bg-white/10"
              >
                {trade.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          {crmRows.map((row, i) => (
            <div
              key={row}
              className="flex items-baseline justify-between gap-4 border border-white/10 bg-[#0B0B0B] px-6 py-5"
            >
              <span className="text-[15px] text-white/80">{row}</span>
              <span className="font-label text-sm text-[#EF6A00]">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════
   03 / PROCESS
   ══════════════════════════════════════════════════════════ */

const steps = [
  {
    step: '01 · WEEK 1',
    title: 'Scope & fixed quote',
    body: "We walk through your workflow, agree what's in and out, and you get a fixed price and date before any money moves.",
    active: true,
  },
  {
    step: '02 · WEEKS 2–5',
    title: 'Build in the open',
    body: 'A live staging link from day three, updated as we go. Feedback on real screens, not mockups.',
    active: false,
  },
  {
    step: '03 · LAUNCH',
    title: 'Handover & support',
    body: 'Data migrated, team trained, repository handed over. Support after that is optional, never required.',
    active: false,
  },
]

function Process() {
  return (
    <section id="process" className="section-pad border-t border-white/10">
      <div className="mx-auto max-w-[1320px]">
        <div className="eyebrow">03 / Process</div>
        <h2 className="display-h2 mt-5">
          WORKING SOFTWARE IN <span className="pixel-word">WEEK ONE</span>
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.step}
              className="pt-6"
              style={{
                borderTop: `2px solid ${step.active ? '#EF6A00' : 'rgba(255,255,255,0.2)'}`,
              }}
            >
              <div
                className={`font-label text-sm tracking-[0.1em] ${
                  step.active ? 'text-[#EF6A00]' : 'text-white/50'
                }`}
              >
                {step.step}
              </div>
              <div className="mt-3 text-xl font-bold">{step.title}</div>
              <p className="mt-2.5 text-sm leading-[1.6] text-white/60">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════
   04 / TALK — wired to the existing contactSubmissions handler
   ══════════════════════════════════════════════════════════ */

const needOptions = [
  'A CRM for my trades business',
  'A new website',
  'Voice or chat AI agent',
  'SEO / more leads',
  'Automations or internal tools',
  "Not sure yet — let's talk",
]

const promises = [
  'Reply within one business day',
  'Fixed-price quote, not an hourly estimate',
  'No contract to look at the numbers',
]

const fieldClass =
  'border border-white/20 bg-[#0B0B0B] px-4 py-3.5 text-[15px] text-white outline-none transition-colors duration-200 focus:border-[#EF6A00]'
const labelClass = 'eyebrow text-[13px]'

function Talk() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    contact: '',
    need: needOptions[0],
    notes: '',
  })
  const submitContact = useMutation(api.contactSubmissions.submit)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await submitContact({
        name: form.name,
        email: form.contact,
        service: form.need,
        description: form.notes.trim() || `Interested in: ${form.need}`,
      })
      setSent(true)
    } catch (err) {
      console.error('Failed to submit homepage enquiry:', err)
      setError("That didn't send. Please try again, or email doug@aideveloper.dev.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="talk" className="section-pad border-t border-white/10">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-[clamp(32px,4vw,72px)] md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="eyebrow">04 / Talk</div>
          <h2 className="display-h2 mt-5">
            TELL ME WHAT'S <span className="pixel-word">SLOWING</span> YOU DOWN
          </h2>
          <p className="mt-6 max-w-[480px] text-base leading-[1.65] text-white/60">
            A 20-minute call — no deck, no sales team. You'll leave knowing roughly what
            it costs and how long it takes, whether or not you hire me.
          </p>
          <div className="mt-7 grid gap-2.5 text-sm text-white/80">
            {promises.map((promise) => (
              <div key={promise} className="flex gap-3">
                <span className="text-[#EF6A00]">→</span>
                {promise}
              </div>
            ))}
          </div>
          <div className="mt-8 text-[13px] text-white/50">
            Prefer email?{' '}
            <a
              href="mailto:doug@aideveloper.dev"
              className="text-[#EF6A00] transition-colors duration-200 hover:text-[#FF8A2B]"
            >
              doug@aideveloper.dev
            </a>
          </div>
        </div>

        {sent ? (
          <div className="flex flex-col justify-center gap-3 border border-[#EF6A00]/50 bg-[#EF6A00]/[0.06] p-10">
            <div className="text-2xl font-bold">Got it — thanks.</div>
            <p className="m-0 text-[15px] leading-[1.6] text-white/60">
              You'll get a reply within one business day with times and a couple of
              follow-up questions.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid content-start gap-4">
            <label className="grid gap-2">
              <span className={labelClass}>Your name</span>
              <input
                name="name"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={fieldClass}
              />
            </label>
            <label className="grid gap-2">
              <span className={labelClass}>Email or phone</span>
              <input
                name="contact"
                required
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                className={fieldClass}
              />
            </label>
            <label className="grid gap-2">
              <span className={labelClass}>What do you need?</span>
              <select
                name="need"
                value={form.need}
                onChange={(e) => setForm({ ...form, need: e.target.value })}
                className={fieldClass}
              >
                {needOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className={labelClass}>Anything useful to know?</span>
              <textarea
                name="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className={`${fieldClass} resize-y`}
              />
            </label>
            {error && <p className="m-0 text-sm text-[#FF5C5C]">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer border-none bg-[#EF6A00] p-4 text-sm font-bold tracking-[0.05em] text-black transition-colors duration-200 hover:bg-[#FF8A2B] disabled:opacity-70"
            >
              {submitting ? 'SENDING…' : 'REQUEST A CALL'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
