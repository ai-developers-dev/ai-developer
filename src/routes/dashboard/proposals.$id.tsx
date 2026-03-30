import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Send } from 'lucide-react'
import { sendProposalEmail } from '@/lib/resend-server'

export const Route = createFileRoute('/dashboard/proposals/$id')({
  component: ProposalDetailPage,
})

const statusBadge = (status: string) => {
  switch (status) {
    case 'draft':
      return <Badge variant="secondary">Draft</Badge>
    case 'sent':
      return <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">Sent</Badge>
    case 'viewed':
      return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200">Viewed</Badge>
    case 'accepted':
      return <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">Accepted</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function ProposalDetailPage() {
  const { id } = Route.useParams()
  const proposal = useQuery(api.proposals.getById, {
    id: id as Id<'proposals'>,
  })
  const markSent = useMutation(api.proposals.markSent)

  if (!proposal) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>
  }

  async function handleSend() {
    if (!proposal?.client) return
    await markSent({ id: id as Id<'proposals'> })
    try {
      await sendProposalEmail({
        data: {
          to: proposal.client.contactEmail,
          clientName: proposal.client.name,
          proposalTitle: proposal.title,
          description: proposal.description || undefined,
          lineItems: proposal.lineItems,
          totalAmount: proposal.totalAmount,
          validUntil: proposal.validUntil
            ? new Date(proposal.validUntil).toISOString().split('T')[0]
            : undefined,
          payUrl: `${window.location.origin}/pay/${id}`,
          signInUrl: `${window.location.origin}/sign-in`,
          signUpUrl: `${window.location.origin}/sign-up`,
        },
      })
    } catch (err) {
      console.error('Email failed:', err)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/dashboard/proposals">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Proposals
        </Link>
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {proposal.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {proposal.client?.name}
            {proposal.project && ` — ${proposal.project.title}`}
          </p>
        </div>
        {statusBadge(proposal.status)}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          {proposal.description && (
            <p className="text-sm text-muted-foreground mb-6">{proposal.description}</p>
          )}

          <table className="w-full mb-6">
            <thead>
              <tr className="border-b">
                <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground">Item</th>
                <th className="pb-2 pr-4 text-right text-xs font-medium text-muted-foreground">Qty</th>
                <th className="pb-2 pr-4 text-right text-xs font-medium text-muted-foreground">Unit Price</th>
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

          <div className="border-t pt-4 flex justify-end">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-3xl font-bold">
                ${proposal.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {proposal.status === 'draft' && (
        <div className="flex justify-end">
          <Button onClick={handleSend}>
            <Send className="w-4 h-4 mr-1" />
            Send to Client
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{new Date(proposal._creationTime).toLocaleDateString()}</span>
            </div>
            {proposal.sentAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sent</span>
                <span>{new Date(proposal.sentAt).toLocaleDateString()}</span>
              </div>
            )}
            {proposal.viewedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Viewed</span>
                <span>{new Date(proposal.viewedAt).toLocaleDateString()}</span>
              </div>
            )}
            {proposal.acceptedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accepted</span>
                <span className="text-green-600 font-medium">
                  {new Date(proposal.acceptedAt).toLocaleDateString()}
                </span>
              </div>
            )}
            {proposal.paidAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid</span>
                <span className="text-green-600 font-medium">
                  {new Date(proposal.paidAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
