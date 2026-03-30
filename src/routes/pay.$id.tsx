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
  const setStripeSessionId = useMutation(api.proposals.setStripeSessionId)
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

  // Split payment state detection
  const isSplit = proposal.paymentMode === 'split'
  const isFirstPaymentDue = isSplit && proposal.firstPaymentStatus !== 'paid'
  const isWaitingForCompletion =
    isSplit &&
    proposal.firstPaymentStatus === 'paid' &&
    proposal.secondPaymentStatus === 'pending'
  const isSecondPaymentDue = isSplit && proposal.secondPaymentStatus === 'invoiced'
  const isFullyPaid = isSplit
    ? proposal.secondPaymentStatus === 'paid'
    : proposal.status === 'accepted' && proposal.paidAt

  // Determine charge amount and payment number
  const chargeAmount = isSplit
    ? isSecondPaymentDue
      ? proposal.secondPaymentAmount!
      : proposal.firstPaymentAmount!
    : proposal.totalAmount
  const paymentNumber: 1 | 2 = isSecondPaymentDue ? 2 : 1

  // Can the user pay right now?
  const canPay = isSplit
    ? isFirstPaymentDue
      ? ['sent', 'viewed'].includes(proposal.status)
      : isSecondPaymentDue
    : ['sent', 'viewed'].includes(proposal.status)

  async function handlePay() {
    if (!proposal || !proposal.clientEmail) return
    setError(null)
    setLoading(true)

    try {
      const result = await createEmbeddedCheckoutSession({
        data: {
          proposalId: id,
          proposalTitle: proposal.title,
          totalAmount: chargeAmount,
          clientEmail: proposal.clientEmail,
          returnUrl: `${window.location.origin}/pay/${id}?success=true`,
          paymentNumber,
        },
      })

      if (result.sessionId) {
        await setStripeSessionId({
          id: id as Id<'proposals'>,
          stripeSessionId: result.sessionId,
          paymentNumber,
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

  return (
    <div className="min-h-screen bg-surface-low py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Banner */}
        {(success || isFullyPaid) && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-tertiary shrink-0" />
            <div>
              <p className="font-medium text-green-800 text-sm">
                {isFullyPaid && isSplit ? 'Paid in Full' : 'Payment Received'}
              </p>
              <p className="text-xs text-green-700">
                Thank you! Your payment was processed successfully.
              </p>
            </div>
          </div>
        )}

        {/* Waiting for project completion */}
        {isWaitingForCompletion && !success && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="font-medium text-blue-800 text-sm">First Payment Received</p>
              <p className="text-xs text-blue-700">
                Your second payment of ${formatCurrency(proposal.secondPaymentAmount!)} will be due when the project is completed.
              </p>
            </div>
          </div>
        )}

        {/* Proposal Card */}
        <div className="bg-surface rounded-xl shadow-sm border overflow-hidden">
          {/* Proposal Header */}
          <div className="bg-gradient-to-r from-brand-secondary to-brand-primary px-6 py-4 text-white flex items-center justify-between">
            <div>
              <p className="text-xs text-white/70">
                {isSecondPaymentDue ? 'Final Payment' : 'Proposal'} for {proposal.clientName}
              </p>
              <h2 className="text-lg font-bold">{proposal.title}</h2>
            </div>
            <div className="text-right">
              {isSplit && canPay && (
                <p className="text-xs text-white/70">
                  Payment {paymentNumber} of 2
                </p>
              )}
              <span className="text-2xl font-bold">
                ${formatCurrency(canPay ? chargeAmount : proposal.totalAmount)}
              </span>
            </div>
          </div>

          <div className="px-6 py-4">
            {proposal.description && (
              <p className="text-gray-600 text-sm mb-4">{proposal.description}</p>
            )}

            {/* Line Items */}
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

            {/* Split Payment Summary */}
            {isSplit && (
              <div className="bg-gray-50 rounded-lg p-3 mt-2 mb-2 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Project Total</span>
                  <span className="font-medium">${formatCurrency(proposal.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment 1 (50%)</span>
                  <span className={proposal.firstPaymentStatus === 'paid' ? 'text-brand-tertiary font-medium' : ''}>
                    {proposal.firstPaymentStatus === 'paid'
                      ? `Paid`
                      : `$${formatCurrency(proposal.firstPaymentAmount!)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment 2 (50%)</span>
                  <span className={proposal.secondPaymentStatus === 'paid' ? 'text-brand-tertiary font-medium' : ''}>
                    {proposal.secondPaymentStatus === 'paid'
                      ? `Paid`
                      : `$${formatCurrency(proposal.secondPaymentAmount!)}`}
                  </span>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Embedded Stripe Checkout */}
            {showCheckout && clientSecret ? (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{ clientSecret }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            ) : canPay && !success ? (
              <div className="text-center mt-4 border-t border-gray-200 pt-4">
                <button
                  onClick={handlePay}
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors w-full justify-center disabled:opacity-50"
                >
                  <CreditCard className="w-5 h-5" />
                  {loading
                    ? 'Loading...'
                    : isSecondPaymentDue
                      ? 'Pay Final Balance'
                      : isSplit
                        ? 'Pay First Installment'
                        : 'Pay Now'}
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  Secure payment powered by Stripe
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-4">
          AI Developer &mdash; Websites, Apps & AI Solutions Built Faster
        </p>
      </div>
    </div>
  )
}
