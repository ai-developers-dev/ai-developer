import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowRight, X } from 'lucide-react'

export const Route = createFileRoute('/dashboard/submissions')({
  component: SubmissionsPage,
})

type Status = 'new' | 'contacted' | 'converted' | 'archived'

const statusBadge = (status: string) => {
  switch (status) {
    case 'new':
      return <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">New</Badge>
    case 'contacted':
      return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200">Contacted</Badge>
    case 'converted':
      return <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">Converted</Badge>
    case 'archived':
      return <Badge variant="secondary">Archived</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function SubmissionsPage() {
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all')
  const [selectedId, setSelectedId] = useState<Id<'contactSubmissions'> | null>(null)
  const [notes, setNotes] = useState('')

  const submissions = useQuery(
    api.contactSubmissions.list,
    filterStatus === 'all' ? {} : { status: filterStatus as Status }
  )
  const updateStatus = useMutation(api.contactSubmissions.updateStatus)
  const convertToClient = useMutation(api.clients.convertFromSubmission)

  const selected = submissions?.find((s) => s._id === selectedId)

  async function handleStatusChange(id: Id<'contactSubmissions'>, status: Status) {
    await updateStatus({ id, status })
  }

  async function handleConvert(id: Id<'contactSubmissions'>) {
    await convertToClient({ submissionId: id })
    setSelectedId(null)
  }

  async function handleSaveNotes() {
    if (selectedId && selected) {
      await updateStatus({
        id: selectedId,
        status: selected.status,
        notes,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Submissions</h1>
          <p className="text-muted-foreground">Review and manage incoming leads.</p>
        </div>
        <Select
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v as Status | 'all')}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Submissions</CardTitle>
              <CardDescription>
                {submissions?.length ?? 0} total submission{(submissions?.length ?? 0) !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!submissions || submissions.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No submissions found.
                </p>
              ) : (
                <div className="space-y-2">
                  {submissions.map((sub) => (
                    <div
                      key={sub._id}
                      className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedId === sub._id ? 'bg-muted border-primary/20' : ''
                      }`}
                      onClick={() => {
                        setSelectedId(sub._id)
                        setNotes(sub.notes || '')
                      }}
                    >
                      <div className="space-y-1 min-w-0 flex-1 mr-4">
                        <p className="text-sm font-medium leading-none">{sub.name}</p>
                        <p className="text-sm text-muted-foreground">{sub.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {sub.service} &middot; {sub.budget || 'No budget'}
                        </p>
                      </div>
                      {statusBadge(sub.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {selected ? (
            <Card className="sticky top-24">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Details</CardTitle>
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-1 rounded-md hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</p>
                  <p className="text-sm">{selected.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</p>
                  <p className="text-sm">{selected.email}</p>
                </div>
                {selected.company && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</p>
                    <p className="text-sm">{selected.company}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</p>
                  <p className="text-sm">{selected.service}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</p>
                  <p className="text-sm text-muted-foreground">{selected.description}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
                  <Select
                    value={selected.status}
                    onValueChange={(v) =>
                      handleStatusChange(selected._id, v as Status)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes..."
                    rows={3}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveNotes}
                  >
                    Save Notes
                  </Button>
                </div>

                {selected.status !== 'converted' && (
                  <Button
                    className="w-full"
                    onClick={() => handleConvert(selected._id)}
                  >
                    Convert to Client
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground text-sm">
                  Select a submission to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
