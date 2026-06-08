import { useEffect, useState } from 'react'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { createEmbeddedCheckoutSession } from '@/lib/stripe-server'
import { loadStripe } from '@stripe/stripe-js'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js'
import {
  computeInstallmentAmounts,
  describeTrigger,
  type Installment,
} from '@/lib/installments'
import { CheckCircle2, Clock, Lock, ShieldCheck, X } from 'lucide-react'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export const Route = createFileRoute('/pay/$id')({
  validateSearch: (search: Record<string, unknown>) => ({
    success: search.success === 'true',
    preview: search.preview === 'true',
  }),
  component: PublicPayPage,
})

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function ProposalDescription({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/)
  return (
    <div className="space-y-4 text-[15px] text-[#d0c5af] leading-relaxed">
      {blocks.map((block, i) => {
        const lines = block.split('\n')
        const isList = lines.every(
          (l) => l.trim().startsWith('•') || l.trim().startsWith('-'),
        )
        if (isList && lines.length > 1) {
          return (
            <ul key={i} className="list-disc pl-5 space-y-1.5">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^[•\-]\s*/, ''))}</li>
              ))}
            </ul>
          )
        }
        return <p key={i}>{renderInline(block)}</p>
      })}
    </div>
  )
}

function renderInline(s: string): React.ReactNode {
  const parts = s.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[#f4dddb]">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function PublicPayPage() {
  const { id } = Route.useParams()
  const { success, preview } = useSearch({ from: '/pay/$id' })
  const proposal = useQuery(api.proposals.getPublic, {
    id: id as Id<'proposals'>,
  })
  const setInstallmentSessionId = useMutation(
    api.proposals.setInstallmentSessionId,
  )
  const [showCheckout, setShowCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreviewCheckout, setShowPreviewCheckout] = useState(false)

  // Force dark theme on this route to match branding
  useEffect(() => {
    const html = document.documentElement
    const hadDark = html.classList.contains('dark')
    html.classList.add('dark')
    return () => {
      if (!hadDark) html.classList.remove('dark')
    }
  }, [])

  if (proposal === undefined) {
    return (
      <div className="min-h-screen bg-[#1c1110] flex items-center justify-center">
        <p className="text-sm text-[#d0c5af]">Loading…</p>
      </div>
    )
  }

  if (proposal === null) {
    return (
      <div className="min-h-screen bg-[#1c1110] flex items-center justify-center">
        <p className="text-sm text-[#d0c5af]">Proposal not found.</p>
      </div>
    )
  }

  const installments: Installment[] = (proposal.installments ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
  const amounts = computeInstallmentAmounts(
    proposal.totalAmount,
    installments.map((i) => i.percent),
  )
  const activeIndex = (() => {
    const invoicedIdx = installments.findIndex((i) => i.status === 'invoiced')
    if (invoicedIdx >= 0) return invoicedIdx
    const pendingOnAcceptIdx = installments.findIndex(
      (i) =>
        i.status === 'pending' &&
        i.trigger.type === 'on_acceptance' &&
        (proposal.status === 'sent' || proposal.status === 'viewed'),
    )
    return pendingOnAcceptIdx
  })()
  const active = activeIndex >= 0 ? installments[activeIndex] : null
  const activeAmount = activeIndex >= 0 ? amounts[activeIndex] : 0
  const isFullyPaid =
    installments.length > 0 && installments.every((i) => i.status === 'paid')
  const isAwaitingNext =
    !active &&
    installments.some((i) => i.status === 'pending') &&
    !isFullyPaid

  async function handlePay() {
    if (!proposal || !proposal.clientEmail || !active) return
    if (preview) {
      setShowPreviewCheckout(true)
      return
    }
    setError(null)
    setLoading(true)

    try {
      const result = await createEmbeddedCheckoutSession({
        data: {
          proposalId: id,
          proposalTitle: proposal.title,
          totalAmount: activeAmount,
          clientEmail: proposal.clientEmail,
          returnUrl: `${window.location.origin}/pay/${id}?success=true`,
          installmentId: active.id,
          installmentLabel: active.label,
          installmentPosition: {
            index: activeIndex + 1,
            total: installments.length,
          },
        },
      })

      if (result.sessionId) {
        await setInstallmentSessionId({
          proposalId: id as Id<'proposals'>,
          installmentId: active.id,
          stripeSessionId: result.sessionId,
        })
      }

      if (result.clientSecret) {
        setClientSecret(result.clientSecret)
        setShowCheckout(true)
      } else {
        setError('Failed to initialize payment. Please try again.')
      }
    } catch (err: any) {
      console.error('Failed to create checkout session:', err)
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const positionLabel =
    active && installments.length > 1
      ? `Payment ${activeIndex + 1} of ${installments.length}`
      : null

  return (
    <div className="min-h-screen bg-[#1c1110] py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Brand header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#d4cebb] to-[#b8b3a0] text-[#333123] flex items-center justify-center font-bold text-lg font-['Space_Grotesk']">
            A
          </div>
          <div>
            <p className="text-base font-semibold text-[#f4dddb] font-['Space_Grotesk']">
              AI Developer
            </p>
            <p className="text-xs text-[#d0c5af]">
              Websites, Apps & AI Solutions Built Faster
            </p>
          </div>
        </div>

        {/* Status banners */}
        {(success || isFullyPaid) && (
          <div className="mb-4 rounded-xl bg-green-900/30 border border-green-700/50 px-4 py-3 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            <div>
              <p className="font-semibold text-green-300 text-sm">
                {isFullyPaid ? 'Paid in full' : 'Payment received'}
              </p>
              <p className="text-xs text-green-400/80">
                Thank you — your payment was processed successfully.
              </p>
            </div>
          </div>
        )}

        {isAwaitingNext && !success && (
          <div className="mb-4 rounded-xl bg-blue-900/30 border border-blue-700/50 px-4 py-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <p className="font-semibold text-blue-300 text-sm">
                Awaiting next milestone
              </p>
              <p className="text-xs text-blue-400/80">
                Your next installment will become available based on the schedule.
              </p>
            </div>
          </div>
        )}

        {/* Proposal card */}
        <div className="bg-[#251917] rounded-2xl border border-[rgba(208,197,175,0.15)] overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-[rgba(208,197,175,0.1)] flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#d0c5af] mb-1.5">
                Proposal for {proposal.clientName}
              </p>
              <h1 className="text-2xl font-bold text-[#f4dddb] leading-tight font-['Space_Grotesk']">
                {proposal.title}
              </h1>
            </div>
            <div className="text-right shrink-0">
              {positionLabel && (
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#d0c5af] mb-1">
                  {positionLabel}
                </p>
              )}
              <p className="text-3xl font-bold text-[#d4cebb] tabular-nums font-['Space_Grotesk']">
                ${formatCurrency(active ? activeAmount : proposal.totalAmount)}
              </p>
              {active && installments.length > 1 && (
                <p className="text-xs text-[#d0c5af] mt-1">
                  of ${formatCurrency(proposal.totalAmount)} total
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {proposal.description && (
            <div className="px-8 py-6 border-b border-[rgba(208,197,175,0.1)]">
              <ProposalDescription text={proposal.description} />
            </div>
          )}

          {/* Line items */}
          <div className="px-8 py-6 border-b border-[rgba(208,197,175,0.1)]">
            <h2 className="text-[11px] uppercase tracking-[0.18em] text-[#d4cebb] mb-4 font-semibold">
              Services
            </h2>
            <div className="space-y-1.5">
              <div className="grid grid-cols-12 gap-3 text-[11px] uppercase tracking-wider text-[#d0c5af]/70 pb-2 border-b border-[rgba(208,197,175,0.1)]">
                <div className="col-span-7">Description</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              {proposal.lineItems.map((item, i) => {
                const isDiscount = item.total < 0
                return (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-3 py-3 text-sm border-b border-[rgba(208,197,175,0.05)] last:border-b-0"
                  >
                    <div className="col-span-7 text-[#f4dddb]">{item.description}</div>
                    <div className="col-span-1 text-center text-[#d0c5af]">
                      {item.quantity}
                    </div>
                    <div className="col-span-2 text-right text-[#d0c5af] tabular-nums">
                      {isDiscount ? '-' : ''}${formatCurrency(Math.abs(item.unitPrice))}
                    </div>
                    <div className={`col-span-2 text-right font-semibold tabular-nums ${isDiscount ? 'text-red-400' : 'text-[#f4dddb]'}`}>
                      {isDiscount ? '-' : ''}${formatCurrency(Math.abs(item.total))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Payment schedule */}
          {installments.length > 0 && (
            <div className="px-8 py-6 border-b border-[rgba(208,197,175,0.1)] bg-[#291d1b]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] uppercase tracking-[0.18em] text-[#d4cebb] font-semibold">
                  Payment Schedule
                </h2>
                <p className="text-sm font-semibold text-[#f4dddb] tabular-nums">
                  Total: ${formatCurrency(proposal.totalAmount)}
                </p>
              </div>
              <div className="space-y-2">
                {installments.map((row, i) => {
                  const isActive = i === activeIndex
                  const isPaid = row.status === 'paid'
                  return (
                    <div
                      key={row.id}
                      className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm transition-all ${
                        isActive
                          ? 'bg-[#251917] border-2 border-[#d4cebb]/40 shadow-lg shadow-[#d4cebb]/5'
                          : 'bg-[#251917]/50 border border-[rgba(208,197,175,0.1)]'
                      }`}
                    >
                      <div className="min-w-0">
                        <p
                          className={`font-medium ${
                            isPaid
                              ? 'text-[#d0c5af]/60 line-through'
                              : isActive
                                ? 'text-[#f4dddb]'
                                : 'text-[#d0c5af]'
                          }`}
                        >
                          {row.label}{' '}
                          <span className="text-[#d0c5af]/60 font-normal">
                            ({describeTrigger(row.trigger)})
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Paid
                          </span>
                        )}
                        <p
                          className={`tabular-nums font-semibold ${
                            isPaid
                              ? 'text-[#d0c5af]/40 line-through'
                              : isActive
                                ? 'text-[#d4cebb]'
                                : 'text-[#d0c5af]'
                          }`}
                        >
                          ${formatCurrency(amounts[i])}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mx-8 my-4 rounded-xl bg-red-900/30 border border-red-700/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Embedded checkout OR CTA */}
          {showCheckout && clientSecret ? (
            <div className="px-8 py-6 bg-white rounded-b-2xl">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ clientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          ) : active && !success ? (
            <div className="px-8 py-6">
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#d4cebb] to-[#b8b3a0] hover:from-[#e0d9c8] hover:to-[#c4bfac] text-[#333123] font-bold text-base px-6 py-4 rounded-xl transition-all disabled:opacity-60 font-['Space_Grotesk'] shadow-lg shadow-[#d4cebb]/20"
              >
                <Lock className="w-4 h-4" />
                {loading ? 'Loading…' : `Pay ${active.label} — $${formatCurrency(activeAmount)}`}
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-[#d0c5af]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secure payment powered by Stripe
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#d0c5af]/60 mt-8">
          AI Developer · Websites, Apps & AI Solutions Built Faster
        </p>
      </div>

      {preview && showPreviewCheckout && active && (
        <MockCheckoutOverlay
          amount={activeAmount}
          label={active.label}
          proposalTitle={proposal.title}
          clientEmail={proposal.clientEmail ?? 'client@example.com'}
          onClose={() => setShowPreviewCheckout(false)}
        />
      )}
    </div>
  )
}

function MockCheckoutOverlay({
  amount,
  label,
  proposalTitle,
  clientEmail,
  onClose,
}: {
  amount: number
  label: string
  proposalTitle: string
  clientEmail: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[#1c1110]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-[#251917] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-[rgba(208,197,175,0.15)]">
        {/* Preview ribbon */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-amber-900/50 border border-amber-600/50 text-amber-200 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
          Preview — not a real checkout
        </div>

        <button
          onClick={onClose}
          aria-label="Close preview"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-[#291d1b] hover:bg-[#342726] flex items-center justify-center text-[#d0c5af] border border-[rgba(208,197,175,0.15)]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[rgba(208,197,175,0.1)] overflow-auto">
          {/* Left — order summary */}
          <div className="p-8 bg-[#291d1b]">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4cebb] to-[#b8b3a0] text-[#333123] flex items-center justify-center text-sm font-bold font-['Space_Grotesk']">
                A
              </div>
              <p className="text-sm font-semibold text-[#f4dddb] font-['Space_Grotesk']">
                AI Developer
              </p>
            </div>
            <p className="text-sm text-[#d0c5af] mb-1">Pay AI Developer</p>
            <p className="text-4xl font-bold text-[#d4cebb] tabular-nums mb-6 font-['Space_Grotesk']">
              ${formatCurrency(amount)}
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[#f4dddb] font-medium truncate">
                    {proposalTitle}
                  </p>
                  <p className="text-xs text-[#d0c5af] mt-0.5">{label}</p>
                </div>
                <p className="text-[#f4dddb] font-medium tabular-nums shrink-0">
                  ${formatCurrency(amount)}
                </p>
              </div>
              <div className="pt-3 border-t border-[rgba(208,197,175,0.1)] flex items-center justify-between">
                <p className="text-[#d0c5af] font-medium">Total due</p>
                <p className="text-[#d4cebb] font-bold tabular-nums">
                  ${formatCurrency(amount)}
                </p>
              </div>
            </div>
          </div>

          {/* Right — payment form (mock) */}
          <div className="p-8 bg-[#251917]">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#d4cebb] mb-4 font-semibold">
              Contact information
            </p>
            <div className="mb-5">
              <label className="block text-xs font-medium text-[#d0c5af] mb-1">
                Email
              </label>
              <div className="px-3 py-2.5 rounded-lg border border-[rgba(208,197,175,0.15)] bg-[#291d1b] text-sm text-[#f4dddb]">
                {clientEmail}
              </div>
            </div>

            <p className="text-[11px] uppercase tracking-[0.18em] text-[#d4cebb] mb-4 mt-6 font-semibold">
              Payment method
            </p>
            <div className="flex items-center gap-2 mb-4">
              <div className="px-3 py-1.5 rounded-md border-2 border-[#d4cebb] text-xs font-semibold text-[#d4cebb]">
                Card
              </div>
              <div className="px-3 py-1.5 rounded-md border border-[rgba(208,197,175,0.2)] text-xs font-medium text-[#d0c5af]/60">
                Cash App Pay
              </div>
              <div className="px-3 py-1.5 rounded-md border border-[rgba(208,197,175,0.2)] text-xs font-medium text-[#d0c5af]/60">
                Link
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#d0c5af] mb-1">
                  Card number
                </label>
                <div className="px-3 py-2.5 rounded-lg border border-[rgba(208,197,175,0.15)] bg-[#291d1b] text-sm text-[#d0c5af]/50 flex items-center justify-between">
                  <span>1234 1234 1234 1234</span>
                  <div className="flex items-center gap-1">
                    <div className="w-7 h-5 rounded bg-gradient-to-br from-blue-600 to-blue-800" />
                    <div className="w-7 h-5 rounded bg-gradient-to-br from-red-500 to-orange-500" />
                    <div className="w-7 h-5 rounded bg-gradient-to-br from-blue-500 to-cyan-500" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#d0c5af] mb-1">
                    Expiration
                  </label>
                  <div className="px-3 py-2.5 rounded-lg border border-[rgba(208,197,175,0.15)] bg-[#291d1b] text-sm text-[#d0c5af]/50">
                    MM / YY
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#d0c5af] mb-1">
                    CVC
                  </label>
                  <div className="px-3 py-2.5 rounded-lg border border-[rgba(208,197,175,0.15)] bg-[#291d1b] text-sm text-[#d0c5af]/50">
                    CVC
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#d0c5af] mb-1">
                  Cardholder name
                </label>
                <div className="px-3 py-2.5 rounded-lg border border-[rgba(208,197,175,0.15)] bg-[#291d1b] text-sm text-[#d0c5af]/50">
                  Full name on card
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#d0c5af] mb-1">
                  Country
                </label>
                <div className="px-3 py-2.5 rounded-lg border border-[rgba(208,197,175,0.15)] bg-[#291d1b] text-sm text-[#f4dddb]">
                  United States
                </div>
              </div>
            </div>

            <button
              disabled
              className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#d4cebb] to-[#b8b3a0] text-[#333123] font-bold text-sm px-6 py-3.5 rounded-xl opacity-90 cursor-not-allowed font-['Space_Grotesk']"
            >
              <Lock className="w-3.5 h-3.5" />
              Pay ${formatCurrency(amount)}
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-[#d0c5af]/60">
              <ShieldCheck className="w-3 h-3" />
              Powered by Stripe
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
