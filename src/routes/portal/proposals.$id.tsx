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
import {
  computeInstallmentAmounts,
  describeTrigger,
  type Installment,
} from '@/lib/installments'

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
  const setInstallmentSessionId = useMutation(
    api.proposals.setInstallmentSessionId,
  )
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

  const installments: Installment[] = ((proposal as any).installments ?? [])
    .slice()
    .sort((a: Installment, b: Installment) => a.order - b.order)
  const amounts = computeInstallmentAmounts(
    proposal.totalAmount,
    installments.map((i) => i.percent),
  )
  const activeIndex = (() => {
    const invoiced = installments.findIndex((i) => i.status === 'invoiced')
    if (invoiced >= 0) return invoiced
    return installments.findIndex(
      (i) =>
        i.status === 'pending' &&
        i.trigger.type === 'on_acceptance' &&
        (proposal.status === 'sent' || proposal.status === 'viewed'),
    )
  })()
  const active = activeIndex >= 0 ? installments[activeIndex] : null
  const activeAmount = activeIndex >= 0 ? amounts[activeIndex] : 0
  const isFullyPaid =
    installments.length > 0 && installments.every((i) => i.status === 'paid')
  const isAwaitingNext =
    !active &&
    !isFullyPaid &&
    installments.some((i) => i.status === 'pending')

  async function handleAcceptAndPay() {
    if (!proposal?.client || !active) return

    try {
      const result = await createEmbeddedCheckoutSession({
        data: {
          proposalId: id,
          proposalTitle: proposal.title,
          totalAmount: activeAmount,
          clientEmail: proposal.client.contactEmail,
          returnUrl: `${window.location.origin}/portal/proposals/${id}?success=true`,
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
      }
    } catch (err) {
      console.error('Failed to create checkout session:', err)
    }
  }

  const positionLabel =
    active && installments.length > 1
      ? `Payment ${activeIndex + 1} of ${installments.length}`
      : 'Total Amount'

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
            <p className="font-medium text-green-800">Paid in Full</p>
            <p className="text-sm text-green-700">
              Thank you! Your payment was processed successfully.
            </p>
          </div>
        </div>
      )}

      {isAwaitingNext && (
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-600" />
          <div>
            <p className="font-medium text-blue-800">Awaiting next milestone</p>
            <p className="text-sm text-blue-700">
              Your next installment will become available based on the schedule.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{proposal.title}</CardTitle>
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
                <p className="text-sm text-muted-foreground">{positionLabel}</p>
                <p className="text-3xl font-bold">
                  ${(active ? activeAmount : proposal.totalAmount).toLocaleString()}
                </p>
              </div>

              {active && !showCheckout && (
                <Button size="lg" onClick={handleAcceptAndPay}>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay {active.label} — ${activeAmount.toLocaleString()}
                </Button>
              )}
            </div>

            {installments.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-3 mb-4 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Project Total</span>
                  <span className="font-medium">
                    ${proposal.totalAmount.toLocaleString()}
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
                        <span className="text-muted-foreground truncate">
                          {row.label}{' '}
                          <span className="opacity-60">
                            ({describeTrigger(row.trigger)})
                          </span>
                        </span>
                        <span
                          className={
                            row.status === 'paid'
                              ? 'text-green-600 font-medium'
                              : isActive
                                ? 'font-medium'
                                : ''
                          }
                        >
                          {row.status === 'paid'
                            ? 'Paid'
                            : `$${amounts[i].toLocaleString()}`}
                        </span>
                      </div>
                    )
                  })}
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
