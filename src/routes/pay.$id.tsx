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
import { CheckCircle2, Clock, Lock, ShieldCheck } from 'lucide-react'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export const Route = createFileRoute('/pay/$id')({
  validateSearch: (search: Record<string, unknown>) => ({
    success: search.success === 'true',
  }),
  component: PublicPayPage,
})

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Render the proposal description with simple markdown-ish parsing:
 * - **bold** → <strong>
 * - "\n\n" → paragraph break
 * - lines starting with "•" or "- " → bullet list items
 */
function ProposalDescription({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/)
  return (
    <div className="space-y-4 text-[15px] text-slate-700 leading-relaxed">
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
  // Tokenize on **bold** markers
  const parts = s.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function PublicPayPage() {
  const { id } = Route.useParams()
  const { success } = useSearch({ from: '/pay/$id' })
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

  // Force light theme on this route — clients land here from email
  // links and expect a clean invoice, not the admin's dark dashboard.
  useEffect(() => {
    const html = document.documentElement
    const hadDark = html.classList.contains('dark')
    html.classList.remove('dark')
    return () => {
      if (hadDark) html.classList.add('dark')
    }
  }, [])

  if (proposal === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    )
  }

  if (proposal === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">Proposal not found.</p>
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
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Brand header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
            A
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">
              AI Developer
            </p>
            <p className="text-xs text-slate-500">
              Custom AI software & CRMs
            </p>
          </div>
        </div>

        {/* Status banners */}
        {(success || isFullyPaid) && (
          <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-900 text-sm">
                {isFullyPaid ? 'Paid in full' : 'Payment received'}
              </p>
              <p className="text-xs text-green-800">
                Thank you — your payment was processed successfully.
              </p>
            </div>
          </div>
        )}

        {isAwaitingNext && !success && (
          <div className="mb-4 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="font-semibold text-blue-900 text-sm">
                Awaiting next milestone
              </p>
              <p className="text-xs text-blue-800">
                Your next installment will become available based on the
                schedule.
              </p>
            </div>
          </div>
        )}

        {/* Proposal card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-1.5">
                Proposal for {proposal.clientName}
              </p>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                {proposal.title}
              </h1>
            </div>
            <div className="text-right shrink-0">
              {positionLabel && (
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-1">
                  {positionLabel}
                </p>
              )}
              <p className="text-3xl font-bold text-slate-900 tabular-nums">
                ${formatCurrency(active ? activeAmount : proposal.totalAmount)}
              </p>
              {active && installments.length > 1 && (
                <p className="text-xs text-slate-500 mt-1">
                  of ${formatCurrency(proposal.totalAmount)} total
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {proposal.description && (
            <div className="px-8 py-6 border-b border-slate-100">
              <ProposalDescription text={proposal.description} />
            </div>
          )}

          {/* Line items */}
          <div className="px-8 py-6 border-b border-slate-100">
            <h2 className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-4">
              Line items
            </h2>
            <div className="space-y-1.5">
              <div className="grid grid-cols-12 gap-3 text-[11px] uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
                <div className="col-span-7">Description</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              {proposal.lineItems.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-3 py-2.5 text-sm text-slate-700 border-b border-slate-50 last:border-b-0"
                >
                  <div className="col-span-7">{item.description}</div>
                  <div className="col-span-1 text-center text-slate-500">
                    {item.quantity}
                  </div>
                  <div className="col-span-2 text-right text-slate-600 tabular-nums">
                    ${formatCurrency(item.unitPrice)}
                  </div>
                  <div className="col-span-2 text-right font-semibold text-slate-900 tabular-nums">
                    ${formatCurrency(item.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment schedule */}
          {installments.length > 0 && (
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Payment schedule
                </h2>
                <p className="text-sm font-semibold text-slate-900 tabular-nums">
                  Project total: ${formatCurrency(proposal.totalAmount)}
                </p>
              </div>
              <div className="space-y-1.5">
                {installments.map((row, i) => {
                  const isActive = i === activeIndex
                  const isPaid = row.status === 'paid'
                  return (
                    <div
                      key={row.id}
                      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm ${
                        isActive
                          ? 'bg-white border border-slate-300 shadow-sm'
                          : 'bg-white/60 border border-transparent'
                      }`}
                    >
                      <div className="min-w-0">
                        <p
                          className={`font-medium ${
                            isPaid
                              ? 'text-slate-500 line-through'
                              : isActive
                                ? 'text-slate-900'
                                : 'text-slate-700'
                          }`}
                        >
                          {row.label}{' '}
                          <span className="text-slate-400 font-normal">
                            ({describeTrigger(row.trigger)})
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Paid
                          </span>
                        )}
                        <p
                          className={`tabular-nums ${
                            isPaid
                              ? 'text-slate-400 line-through'
                              : isActive
                                ? 'text-slate-900 font-semibold'
                                : 'text-slate-600'
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
            <div className="mx-8 my-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Embedded checkout OR CTA */}
          {showCheckout && clientSecret ? (
            <div className="px-8 py-6">
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
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base px-6 py-4 rounded-xl transition-colors disabled:opacity-60"
              >
                <Lock className="w-4 h-4" />
                {loading ? 'Loading…' : `Pay ${active.label} — $${formatCurrency(activeAmount)}`}
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secure payment powered by Stripe
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          AI Developer · Custom AI software &amp; CRMs built faster
        </p>
      </div>
    </div>
  )
}
