import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/portal/proposals')({
  component: PortalProposalsPage,
})

const statusBadge = (status: string) => {
  switch (status) {
    case 'draft':
      return <Badge variant="secondary">Draft</Badge>
    case 'sent':
      return <Badge className="bg-blue-500/10 text-blue-300 hover:bg-blue-500/10 border-blue-500/30">Sent</Badge>
    case 'viewed':
      return <Badge className="bg-amber-500/10 text-amber-300 hover:bg-amber-500/10 border-amber-500/30">Viewed</Badge>
    case 'accepted':
      return <Badge className="bg-green-500/10 text-green-300 hover:bg-green-500/10 border-green-500/30">Accepted</Badge>
    case 'rejected':
      return <Badge className="bg-red-500/10 text-red-300 hover:bg-red-500/10 border-red-500/30">Rejected</Badge>
    case 'expired':
      return <Badge variant="outline">Expired</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function PortalProposalsPage() {
  const proposals = useQuery(api.proposals.getByClient)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Proposals</h1>
        <p className="text-muted-foreground">Review and accept proposals from your developer.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Proposals</CardTitle>
          <CardDescription>
            {proposals?.length ?? 0} proposal{(proposals?.length ?? 0) !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!proposals || proposals.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No proposals yet.</p>
          ) : (
            <div className="space-y-2">
              {proposals.map((proposal) => (
                <Link
                  key={proposal._id}
                  to="/portal/proposals/$id"
                  params={{ id: proposal._id }}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{proposal.title}</p>
                    {proposal.project && (
                      <p className="text-xs text-muted-foreground">
                        Project: {proposal.project.title}
                      </p>
                    )}
                    <p className="text-sm font-medium">
                      ${proposal.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {statusBadge(proposal.status)}
                    {proposal.sentAt && (
                      <p className="text-xs text-muted-foreground">
                        Sent {new Date(proposal.sentAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
