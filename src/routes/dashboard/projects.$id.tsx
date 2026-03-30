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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Clock, FileText } from 'lucide-react'
import { sendSecondPaymentInvoice } from '@/lib/resend-server'

export const Route = createFileRoute('/dashboard/projects/$id')({
  component: ProjectDetailPage,
})

const stageOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'review', label: 'Review' },
  { value: 'contracted', label: 'Contracted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

function ProjectDetailPage() {
  const { id } = Route.useParams()
  const project = useQuery(api.projects.getById, {
    id: id as Id<'projects'>,
  })
  const updateStage = useMutation(api.projects.updateStage)

  if (!project) {
    return (
      <div className="text-center py-12 text-muted-foreground">Loading project...</div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/dashboard/projects">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Projects
        </Link>
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {project.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {project.client?.name} &middot; {project.service}
          </p>
        </div>
        <Select
          value={project.stage}
          onValueChange={async (v) => {
            const result = await updateStage({
              id: id as Id<'projects'>,
              stage: v as any,
            })
            // When project completed with a split-payment proposal, send second invoice
            if (result?.sendSecondInvoiceFor) {
              const splitProposal = project.proposals.find(
                (p) => p._id === result.sendSecondInvoiceFor
              )
              if (splitProposal) {
                const client = project.client
                if (client) {
                  try {
                    await sendSecondPaymentInvoice({
                      data: {
                        to: client.contactEmail,
                        clientName: client.name,
                        proposalTitle: splitProposal.title,
                        lineItems: (splitProposal as any).lineItems ?? [],
                        totalAmount: splitProposal.totalAmount,
                        secondPaymentAmount: (splitProposal as any).secondPaymentAmount ?? splitProposal.totalAmount / 2,
                        payUrl: `${window.location.origin}/pay/${splitProposal._id}`,
                      },
                    })
                  } catch (err) {
                    console.error('Failed to send second invoice email:', err)
                  }
                }
              }
            }
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {stageOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.description && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</p>
                  <p className="text-sm">{project.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {project.budget && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Budget</p>
                    <p className="text-sm font-semibold">${project.budget.toLocaleString()}</p>
                  </div>
                )}
                {project.assignedTo && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned To</p>
                    <p className="text-sm">{project.assignedTo}</p>
                  </div>
                )}
                {project.startDate && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Start Date</p>
                    <p className="text-sm">{project.startDate}</p>
                  </div>
                )}
                {project.dueDate && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</p>
                    <p className="text-sm">{project.dueDate}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Proposals</CardTitle>
                <CardDescription>{project.proposals.length} proposal{project.proposals.length !== 1 ? 's' : ''}</CardDescription>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to="/dashboard/proposals/new">
                  <FileText className="w-4 h-4 mr-1" />
                  New Proposal
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {project.proposals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No proposals yet.</p>
              ) : (
                <div className="space-y-2">
                  {project.proposals.map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{p.title}</p>
                        <p className="text-xs text-muted-foreground">
                          ${p.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline">{p.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Hours</span>
                <span className="text-sm font-semibold">
                  {project.totalHours.toFixed(1)}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Billable Hours</span>
                <span className="text-sm font-semibold">
                  {project.billableHours.toFixed(1)}h
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Time Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {project.timeEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No time entries yet.</p>
              ) : (
                <div className="space-y-2">
                  {project.timeEntries.slice(0, 5).map((entry) => (
                    <div
                      key={entry._id}
                      className="rounded-lg border p-2 text-sm"
                    >
                      <div className="flex justify-between">
                        <span>{entry.description}</span>
                        <span className="font-medium">{entry.hours}h</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{entry.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
