import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Check, Copy, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/dashboard/early-access')({
  component: EarlyAccessPage,
})

type Status = 'new' | 'invited' | 'converted' | 'archived'

const statusBadge = (status: string) => {
  switch (status) {
    case 'new':
      return (
        <Badge className="bg-blue-500/10 text-blue-300 hover:bg-blue-500/10 border-blue-500/30">
          New
        </Badge>
      )
    case 'invited':
      return (
        <Badge className="bg-amber-500/10 text-amber-300 hover:bg-amber-500/10 border-amber-500/30">
          Invited
        </Badge>
      )
    case 'converted':
      return (
        <Badge className="bg-green-500/10 text-green-300 hover:bg-green-500/10 border-green-500/30">
          Purchased
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

function EarlyAccessPage() {
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all')
  const [copied, setCopied] = useState(false)

  const signups = useQuery(
    api.earlyAccess.list,
    filterStatus === 'all' ? {} : { status: filterStatus as Status },
  )
  const updateStatus = useMutation(api.earlyAccess.updateStatus)
  const removeSignup = useMutation(api.earlyAccess.remove)

  async function handleCopyEmails() {
    if (!signups?.length) return
    await navigator.clipboard.writeText(signups.map((s) => s.email).join(', '))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Early Access</h1>
          <p className="text-muted-foreground">
            Waitlist for the courses launch.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyEmails}
            disabled={!signups?.length}
          >
            {copied ? (
              <Check className="w-4 h-4 mr-1.5" />
            ) : (
              <Copy className="w-4 h-4 mr-1.5" />
            )}
            {copied ? 'Copied' : 'Copy emails'}
          </Button>
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
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="converted">Purchased</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        {!signups ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            Loading…
          </p>
        ) : signups.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            No signups yet.
          </p>
        ) : (
          signups.map((signup) => (
            <div
              key={signup._id}
              className="w-full flex items-center gap-3 rounded-lg border bg-card px-4 py-3"
            >
              {statusBadge(signup.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold truncate">
                    {signup.name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {signup.email}
                  </span>
                </div>
              </div>
              {signup.source && (
                <Badge
                  variant="outline"
                  className="hidden sm:inline-flex text-[10px] px-1.5 py-0 shrink-0"
                >
                  {signup.source}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground shrink-0 w-16 text-right">
                {timeAgo(signup._creationTime)}
              </span>
              <Select
                value={signup.status}
                onValueChange={(v) =>
                  updateStatus({ id: signup._id, status: v as Status })
                }
              >
                <SelectTrigger className="w-32 h-8 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="converted">Purchased</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <DeleteButton
                name={signup.name}
                onConfirm={() => removeSignup({ id: signup._id })}
              />
            </div>
          ))
        )}
        {signups && signups.length > 0 && (
          <p className="text-xs text-muted-foreground text-right pt-2">
            {signups.length} signup{signups.length === 1 ? '' : 's'}
          </p>
        )}
      </div>
    </div>
  )
}

function DeleteButton({
  name,
  onConfirm,
}: {
  name: string
  onConfirm: () => void
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          aria-label={`Remove ${name}`}
          className="p-1.5 rounded-none hover:bg-destructive/10 shrink-0"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove this signup?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes{' '}
            <span className="font-medium">{name}</span> from the early-access
            list. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
