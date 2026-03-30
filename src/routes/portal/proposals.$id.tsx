import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CreditCard, CheckCircle2, Clock } from 'lucide-react'
import { createEmbeddedCheckoutSession } from '@/lib/stripe-server'
import { loadStripe } from '@stripe/stripe-js'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export const Route = createFileRoute('/portal/proposals/$id')({
  component: PortalProposalDetailPage,
})

const statusBadge = (status: string) => {
  switch (status) {
    case 'accepted':
      return <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">Accepted</Badge>
    case 'sent':
    case 'viewed':
      return <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">{status}</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function PortalProposalDetailPage() {
  const { id } = Route.useParams()
  const proposal = useQuery(api.proposals.getById, {
    id: id as Id<'proposals'>,
  })
  const markViewed = useMutation(api.proposals.markViewed)
  const setStripeSessionId = useMutation(api.proposals.setStripeSessionId)
  const [showCheckout, setShowCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    if (proposal && proposal.status === 'sent') {
      markViewed({ id: id as Id<'proposals'> })
    }
  }, [proposal?.status])

  if (!proposal) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>
  }

  // Split payment state
  const isSplit = (proposal as any).paymentMode === 'split'
  const isFirstPaymentDue = isSplit && (proposal as any).firstPaymentStatus !== 'paid'
  const isWaitingForCompletion =
    isSplit &&
    (proposal as any).firstPaymentStatus === 'paid' &&
    (proposal as any).secondPaymentStatus === 'pending'
  const isSecondPaymentDue = isSplit && (proposal as any).secondPaymentStatus === 'invoiced'
  const isFullyPaid = isSplit
    ? (proposal as any).secondPaymentStatus === 'paid'
    : proposal.status === 'accepted' && proposal.paidAt

  const chargeAmount = isSplit
    ? isSecondPaymentDue
      ? (proposal as any).secondPaymentAmount!
      : (proposal as any).firstPaymentAmount!
    : proposal.totalAmount
  const paymentNumber: 1 | 2 = isSecondPaymentDue ? 2 : 1

  const canPay = isSplit
    ? isFirstPaymentDue
      ? ['sent', 'viewed'].includes(proposal.status)
      : isSecondPaymentDue
    : ['sent', 'viewed'].includes(proposal.status)

  async function handleAcceptAndPay() {
    if (!proposal?.client) return

    try {
      const result = await createEmbeddedCheckoutSession({
        data: {
          proposalId: id,
          proposalTitle: proposal.title,
          totalAmount: chargeAmount,
          clientEmail: proposal.client.contactEmail,
          returnUrl: `${window.location.origin}/portal/proposals/${id}?success=true`,
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
      }
    } catch (err) {
      console.error('Failed to create checkout session:', err)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/portal/proposals">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Proposals
        </Link>
      </Button>

      {isFullyPaid && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-medium text-green-800">
              {isFullyPaid && isSplit ? 'Paid in Full' : 'Payment Received'}
            </p>
            <p className="text-sm text-green-700">
              Thank you! Your payment was processed successfully.
            </p>
          </div>
        </div>
      )}

      {isWaitingForCompletion && (
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-600" />
          <div>
            <p className="font-medium text-blue-800">First Payment Received</p>
            <p className="text-sm text-blue-700">
              Your second payment of ${(proposal as any).secondPaymentAmount?.toLocaleString()} will be due when the project is completed.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {proposal.title}
              </CardTitle>
              {proposal.project && (
                <p className="text-muted-foreground mt-1">
                  Project: {proposal.project.title}
                </p>
              )}
            </div>
            {statusBadge(proposal.status)}
          </div>
        </CardHeader>
        <CardContent>
          {proposal.description && (
            <p className="text-muted-foreground mb-8">{proposal.description}</p>
          )}

          <div className="mb-8">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Scope of Work
            </h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground">Item</th>
                  <th className="pb-2 pr-4 text-right text-xs font-medium text-muted-foreground">Qty</th>
                  <th className="pb-2 pr-4 text-right text-xs font-medium text-muted-foreground">Rate</th>
                  <th className="pb-2 text-right text-xs font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {proposal.lineItems.map((item, i) => (
                  <tr key={i}>
                    <td className="py-3 pr-4 text-sm">{item.description}</td>
                    <td className="py-3 pr-4 text-sm text-right text-muted-foreground">{item.quantity}</td>
                    <td className="py-3 pr-4 text-sm text-right text-muted-foreground">${item.unitPrice.toLocaleString()}</td>
                    <td className="py-3 text-sm text-right font-medium">${item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  {canPay && isSplit ? `Payment ${paymentNumber} of 2` : 'Total Amount'}
                </p>
                <p className="text-3xl font-bold">
                  ${(canPay ? chargeAmount : proposal.totalAmount).toLocaleString()}
                </p>
              </div>

              {canPay && !showCheckout && (
                <Button size="lg" onClick={handleAcceptAndPay}>
                  <CreditCard className="w-5 h-5 mr-2" />
                  {isSecondPaymentDue
                    ? 'Pay Final Balance'
                    : isSplit
                      ? 'Accept & Pay First Installment'
                      : 'Accept & Pay'}
                </Button>
              )}
            </div>

            {isSplit && (
              <div className="bg-muted/50 rounded-lg p-3 mb-4 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project Total</span>
                  <span className="font-medium">${proposal.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment 1 (50%)</span>
                  <span className={(proposal as any).firstPaymentStatus === 'paid' ? 'text-green-600 font-medium' : ''}>
                    {(proposal as any).firstPaymentStatus === 'paid'
                      ? 'Paid'
                      : `$${(proposal as any).firstPaymentAmount?.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment 2 (50%)</span>
                  <span className={(proposal as any).secondPaymentStatus === 'paid' ? 'text-green-600 font-medium' : ''}>
                    {(proposal as any).secondPaymentStatus === 'paid'
                      ? 'Paid'
                      : `$${(proposal as any).secondPaymentAmount?.toLocaleString()}`}
                  </span>
                </div>
              </div>
            )}

            {showCheckout && clientSecret && (
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ clientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Powered by AI Developer &middot; Secure payment via Stripe
      </p>
    </div>
  )
}
