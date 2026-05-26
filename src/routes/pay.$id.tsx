import { useState } from 'react'
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
import { CreditCard, CheckCircle2, Clock } from 'lucide-react'

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

  if (proposal === undefined) {
    return (
      <div className="min-h-screen bg-surface-low flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (proposal === null) {
    return (
      <div className="min-h-screen bg-surface-low flex items-center justify-center">
        <p className="text-gray-500">Proposal not found.</p>
      </div>
    )
  }

  const installments: Installment[] = (proposal.installments ?? []).slice().sort(
    (a, b) => a.order - b.order,
  )
  const amounts = computeInstallmentAmounts(
    proposal.totalAmount,
    installments.map((i) => i.percent),
  )
  // Active row: first invoiced; or first pending on_acceptance if proposal is sent/viewed.
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
  const isAllInvoicedOrPaid =
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
    <div className="min-h-screen bg-surface-low py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {(success || isFullyPaid) && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-tertiary shrink-0" />
            <div>
              <p className="font-medium text-green-800 text-sm">
                {isFullyPaid ? 'Paid in Full' : 'Payment Received'}
              </p>
              <p className="text-xs text-green-700">
                Thank you! Your payment was processed successfully.
              </p>
            </div>
          </div>
        )}

        {isAllInvoicedOrPaid && !success && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="font-medium text-blue-800 text-sm">
                Awaiting next milestone
              </p>
              <p className="text-xs text-blue-700">
                Your next installment will become available based on the schedule.
              </p>
            </div>
          </div>
        )}

        <div className="bg-surface rounded-xl shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-brand-secondary to-brand-primary px-6 py-4 text-white flex items-center justify-between">
            <div>
              <p className="text-xs text-white/70">
                {active ? active.label : 'Proposal'} for {proposal.clientName}
              </p>
              <h2 className="text-lg font-bold">{proposal.title}</h2>
            </div>
            <div className="text-right">
              {positionLabel && (
                <p className="text-xs text-white/70">{positionLabel}</p>
              )}
              <span className="text-2xl font-bold">
                ${formatCurrency(active ? activeAmount : proposal.totalAmount)}
              </span>
            </div>
          </div>

          <div className="px-6 py-4">
            {proposal.description && (
              <p className="text-gray-600 text-sm mb-4">{proposal.description}</p>
            )}

            <table className="w-full mb-2">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="pb-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="pb-2 pr-6 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="pb-2 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {proposal.lineItems.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2 text-sm text-gray-800">{item.description}</td>
                    <td className="py-2 text-sm text-gray-500 text-center">{item.quantity}</td>
                    <td className="py-2 pr-6 text-sm text-gray-500 text-right">
                      ${formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-2 text-sm font-medium text-gray-900 text-right">
                      ${formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {installments.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 mt-2 mb-2 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Project Total</span>
                  <span className="font-medium">
                    ${formatCurrency(proposal.totalAmount)}
                  </span>
                </div>
                <div className="space-y-1">
                  {installments.map((row, i) => {
                    const isActive = i === activeIndex
                    return (
                      <div
                        key={row.id}
                        className={`flex justify-between items-center text-xs ${
                          isActive ? 'font-medium' : ''
                        }`}
                      >
                        <span className="text-gray-600 truncate">
                          {row.label}{' '}
                          <span className="text-gray-400">
                            ({describeTrigger(row.trigger)})
                          </span>
                        </span>
                        <span
                          className={
                            row.status === 'paid'
                              ? 'text-brand-tertiary font-medium'
                              : isActive
                                ? 'text-brand-primary'
                                : 'text-gray-700'
                          }
                        >
                          {row.status === 'paid'
                            ? 'Paid'
                            : `$${formatCurrency(amounts[i])}`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            {showCheckout && clientSecret ? (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{ clientSecret }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            ) : active && !success ? (
              <div className="text-center mt-4 border-t border-gray-200 pt-4">
                <button
                  onClick={handlePay}
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors w-full justify-center disabled:opacity-50"
                >
                  <CreditCard className="w-5 h-5" />
                  {loading
                    ? 'Loading...'
                    : `Pay ${active.label} — $${formatCurrency(activeAmount)}`}
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  Secure payment powered by Stripe
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          AI Developer &mdash; Websites, Apps & AI Solutions Built Faster
        </p>
      </div>
    </div>
  )
}
