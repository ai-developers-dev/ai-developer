import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ArrowRight, ChevronRight, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/dashboard/submissions')({
  component: SubmissionsPage,
})

type Status = 'new' | 'contacted' | 'converted' | 'archived'

const statusBadge = (status: string) => {
  switch (status) {
    case 'new':
      return (
        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
          New
        </Badge>
      )
    case 'contacted':
      return (
        <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200">
          Contacted
        </Badge>
      )
    case 'converted':
      return (
        <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
          Converted
        </Badge>
      )
    case 'archived':
      return <Badge variant="secondary">Archived</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function timeAgo(creationMs: number): string {
  const diffMs = Date.now() - creationMs
  const day = 24 * 60 * 60 * 1000
  if (diffMs < day) {
    const hours = Math.floor(diffMs / (60 * 60 * 1000))
    if (hours < 1) return 'just now'
    return `${hours}h ago`
  }
  const days = Math.floor(diffMs / day)
  if (days < 7) return `${days}d ago`
  return new Date(creationMs).toLocaleDateString()
}

function SubmissionsPage() {
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all')
  const [openId, setOpenId] = useState<Id<'contactSubmissions'> | null>(null)
  const [notes, setNotes] = useState('')

  const submissions = useQuery(
    api.contactSubmissions.list,
    filterStatus === 'all' ? {} : { status: filterStatus as Status },
  )
  const updateStatus = useMutation(api.contactSubmissions.updateStatus)
  const convertToClient = useMutation(api.clients.convertFromSubmission)
  const removeSubmission = useMutation(api.contactSubmissions.remove)

  const selected = submissions?.find((s) => s._id === openId) ?? null

  function openDetail(sub: NonNullable<typeof submissions>[number]) {
    setOpenId(sub._id)
    setNotes(sub.notes ?? '')
  }

  async function handleStatusChange(status: Status) {
    if (!selected) return
    await updateStatus({ id: selected._id, status })
  }

  async function handleConvert() {
    if (!selected) return
    await convertToClient({ submissionId: selected._id })
    setOpenId(null)
  }

  async function handleSaveNotes() {
    if (!selected) return
    await updateStatus({
      id: selected._id,
      status: selected.status,
      notes,
    })
  }

  async function handleDelete() {
    if (!selected) return
    await removeSubmission({ id: selected._id })
    setOpenId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Contact Submissions
          </h1>
          <p className="text-muted-foreground">
            Review and manage incoming leads.
          </p>
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

      <div className="space-y-2">
        {!submissions ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            Loading…
          </p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            No submissions yet.
          </p>
        ) : (
          submissions.map((sub) => (
            <button
              key={sub._id}
              type="button"
              onClick={() => openDetail(sub)}
              className="w-full flex items-center gap-3 rounded-lg border bg-card px-4 py-3 hover:bg-muted/50 hover:border-brand-primary/40 transition-colors text-left"
            >
              {statusBadge(sub.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold truncate">
                    {sub.name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {sub.email}
                  </span>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {sub.service}
                </Badge>
                {sub.budget && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {sub.budget}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0 w-16 text-right">
                {timeAgo(sub._creationTime)}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))
        )}
        {submissions && submissions.length > 0 && (
          <p className="text-xs text-muted-foreground text-right pt-2">
            {submissions.length} submission
            {submissions.length === 1 ? '' : 's'}
          </p>
        )}
      </div>

      <Dialog
        open={selected !== null}
        onOpenChange={(o) => {
          if (!o) setOpenId(null)
        }}
      >
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 flex-wrap">
                  <DialogTitle className="text-xl">{selected.name}</DialogTitle>
                  {statusBadge(selected.status)}
                </div>
                <DialogDescription>{selected.email}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {selected.company && (
                  <Pair label="Company" value={selected.company} />
                )}
                <Pair label="Service" value={selected.service} />
                {selected.budget && (
                  <Pair label="Budget" value={selected.budget} />
                )}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Description
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selected.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </p>
                    <Select
                      value={selected.status}
                      onValueChange={(v) => handleStatusChange(v as Status)}
                    >
                      <SelectTrigger>
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
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Submitted
                    </p>
                    <p className="text-sm pt-2">
                      {new Date(selected._creationTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Admin notes
                  </p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes..."
                    rows={3}
                  />
                  <Button size="sm" variant="outline" onClick={handleSaveNotes}>
                    Save Notes
                  </Button>
                </div>

                {selected.status !== 'converted' && (
                  <Button className="w-full" onClick={handleConvert}>
                    Convert to Client
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this submission?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This permanently removes the submission from{' '}
                        <span className="font-medium">{selected.name}</span>.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="outline" onClick={() => setOpenId(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <span className="text-muted-foreground col-span-1">{label}</span>
      <span className="col-span-2 break-words">{value}</span>
    </div>
  )
}
