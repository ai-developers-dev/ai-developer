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
import { Trash2, X } from 'lucide-react'

export const Route = createFileRoute('/dashboard/discoveries')({
  component: DiscoveriesPage,
})

type Status = 'new' | 'contacted' | 'quoted' | 'converted' | 'archived'

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
    case 'quoted':
      return (
        <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-50 border-purple-200">
          Quoted
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

const tradeBadge = (trade: string) => (
  <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
    {trade.replace('-', ' ')}
  </Badge>
)

const PRETTY: Record<string, Record<string, string>> = {
  employeeCount: {
    '1': '1 (solo)',
    '2-5': '2-5',
    '6-10': '6-10',
    '11-20': '11-20',
    '21-50': '21-50',
    '50+': '50+',
  },
  primaryTrade: {
    electrician: 'Electrician',
    plumber: 'Plumber',
    hvac: 'HVAC',
    'multi-trade': 'Multi-trade',
    other: 'Other',
  },
  topBottleneck: {
    scheduling: 'Scheduling / dispatch',
    quoting: 'Quoting & estimating',
    payment: 'Payment collection',
    job_tracking: 'Job tracking & follow-up',
    crew_coordination: 'Crew coordination',
    customer_communication: 'Customer communication',
    other: 'Other',
  },
  locationCount: {
    single: 'Single location',
    '2-3': '2-3 areas',
    '4+': '4+ areas',
    'multi-state': 'Multi-state',
  },
  serviceRadiusMiles: {
    under_25: 'Under 25 mi',
    '25-50': '25-50 mi',
    '50-100': '50-100 mi',
    '100+': '100+ mi',
  },
  techsQuoteOnSite: {
    always: 'Always',
    sometimes: 'Sometimes',
    never: 'Never',
  },
  changeOrderFrequency: {
    rarely: 'Rarely',
    sometimes_30: 'Sometimes (~30%)',
    often_50: 'Often (50%+)',
  },
  recurringContracts: {
    none: 'None',
    under_20: '<20%',
    '20-50': '20-50%',
    over_50: '>50%',
  },
  collectsGoogleReviews: {
    yes_routinely: 'Yes — routinely',
    occasionally: 'Sometimes',
    no: 'No',
  },
  missedCallHandling: {
    voicemail: 'Goes to voicemail',
    answering_service: 'Answering service',
    ai_receptionist: 'AI receptionist',
    callback_later: 'Callback later',
    unanswered: 'Calls go unanswered',
    other: 'Other',
  },
  afterHoursHandling: {
    staff_on_call: 'Staff on-call rotation',
    answering_service: 'Answering service',
    ai_agent: 'AI agent',
    voicemail: 'Voicemail only',
    no_after_hours: 'No after-hours service',
    other: 'Other',
  },
  desiredLaunch: {
    asap: 'ASAP',
    '3_months': 'Within 3 months',
    '3-6_months': '3-6 months',
    '6-12_months': '6-12 months',
    flexible: 'Flexible',
  },
}

function pretty(field: string, value: string): string {
  return PRETTY[field]?.[value] ?? value
}

function DiscoveriesPage() {
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all')
  const [selectedId, setSelectedId] = useState<
    Id<'discoverySubmissions'> | null
  >(null)
  const [notes, setNotes] = useState('')

  const submissions = useQuery(
    api.discoverySubmissions.list,
    filterStatus === 'all' ? {} : { status: filterStatus as Status },
  )
  const updateStatus = useMutation(api.discoverySubmissions.updateStatus)
  const removeSubmission = useMutation(api.discoverySubmissions.remove)

  const selected = submissions?.find((s) => s._id === selectedId)

  async function handleStatusChange(
    id: Id<'discoverySubmissions'>,
    status: Status,
  ) {
    await updateStatus({ id, status })
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

  async function handleDelete(id: Id<'discoverySubmissions'>) {
    await removeSubmission({ id })
    setSelectedId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Discovery Submissions
          </h1>
          <p className="text-muted-foreground">
            Qualified leads from the custom CRM funnel — full discovery payload.
          </p>
        </div>
        <Select
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v as Status | 'all')}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>
                {submissions?.length ?? 0} discovery
                {(submissions?.length ?? 0) !== 1 ? ' submissions' : ' submission'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!submissions || submissions.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No discoveries yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {submissions.map((sub) => (
                    <button
                      key={sub._id}
                      type="button"
                      onClick={() => {
                        setSelectedId(sub._id)
                        setNotes(sub.notes ?? '')
                      }}
                      className={`w-full text-left rounded-lg border p-3 hover:bg-muted/50 transition-colors ${
                        selectedId === sub._id
                          ? 'bg-muted border-primary/20'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium leading-none">
                          {sub.businessName}
                        </p>
                        {statusBadge(sub.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        {sub.businessEmail}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {tradeBadge(sub.primaryTrade)}
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {pretty('employeeCount', sub.employeeCount)} emp
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {pretty('desiredLaunch', sub.desiredLaunch)}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <Card className="sticky top-24">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>{selected.businessName}</CardTitle>
                  <CardDescription>
                    {selected.businessEmail} · {selected.businessPhone}
                  </CardDescription>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="p-1 rounded-md hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status + notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </p>
                    <Select
                      value={selected.status}
                      onValueChange={(v) =>
                        handleStatusChange(selected._id, v as Status)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="quoted">Quoted</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Source
                    </p>
                    <p className="text-sm pt-2">
                      {selected.source ?? 'direct'}
                    </p>
                  </div>
                </div>

                {/* Section: Business */}
                <Section title="Business basics">
                  <Pair
                    label="Has website?"
                    value={selected.hasWebsite === 'yes' ? 'Yes' : 'No'}
                  />
                  {selected.hasWebsite === 'yes' && (
                    <>
                      <Pair
                        label="Website has chat?"
                        value={
                          selected.websiteHasChat
                            ? selected.websiteHasChat === 'yes'
                              ? 'Yes'
                              : 'No'
                            : '—'
                        }
                      />
                      <Pair
                        label="Online appointment booking?"
                        value={
                          selected.websiteHasOnlineBooking
                            ? selected.websiteHasOnlineBooking === 'yes'
                              ? 'Yes'
                              : 'No'
                            : '—'
                        }
                      />
                    </>
                  )}
                  <Pair label="Address" value={selected.businessAddress || '—'} />
                  <Pair
                    label="Employees"
                    value={pretty('employeeCount', selected.employeeCount)}
                  />
                </Section>

                {/* Section: What they do */}
                <Section title="What they do">
                  <Pair
                    label="Primary trade"
                    value={pretty('primaryTrade', selected.primaryTrade)}
                  />
                  <Pair
                    label="Services"
                    value={
                      selected.servicesOffered.length
                        ? selected.servicesOffered.join(', ')
                        : '—'
                    }
                  />
                  <Pair
                    label="Current CRM"
                    value={selected.currentCrm || '—'}
                  />
                  <Pair
                    label="Other tools"
                    value={
                      selected.otherTools.length
                        ? selected.otherTools.join(', ')
                        : '—'
                    }
                  />
                  <Pair
                    label="Lead sources"
                    value={
                      selected.leadSources.length
                        ? selected.leadSources.join(', ')
                        : '—'
                    }
                  />
                  <Pair
                    label="Top bottleneck"
                    value={pretty('topBottleneck', selected.topBottleneck)}
                  />
                </Section>

                {/* Section: Operations */}
                <Section title="Operations">
                  <Pair
                    label="Locations"
                    value={pretty('locationCount', selected.locationCount)}
                  />
                  <Pair
                    label="Service radius"
                    value={pretty(
                      'serviceRadiusMiles',
                      selected.serviceRadiusMiles,
                    )}
                  />
                  <Pair
                    label="On-site quoting"
                    value={pretty(
                      'techsQuoteOnSite',
                      selected.techsQuoteOnSite,
                    )}
                  />
                  <Pair
                    label="Change-order freq"
                    value={pretty(
                      'changeOrderFrequency',
                      selected.changeOrderFrequency,
                    )}
                  />
                  <Pair
                    label="Recurring contracts"
                    value={pretty(
                      'recurringContracts',
                      selected.recurringContracts,
                    )}
                  />
                  <Pair
                    label="Google reviews"
                    value={pretty(
                      'collectsGoogleReviews',
                      selected.collectsGoogleReviews,
                    )}
                  />
                  <Pair
                    label="Missed-call handling"
                    value={pretty(
                      'missedCallHandling',
                      selected.missedCallHandling,
                    )}
                  />
                  <Pair
                    label="After-hours handling"
                    value={pretty(
                      'afterHoursHandling',
                      selected.afterHoursHandling,
                    )}
                  />
                </Section>

                {/* Section: Tech & project */}
                <Section title="Tech & project">
                  <Pair
                    label="Accounting"
                    value={selected.accountingSystem || '—'}
                  />
                  <Pair
                    label="Integrations"
                    value={
                      selected.requiredIntegrations.length
                        ? selected.requiredIntegrations.join(', ')
                        : '—'
                    }
                  />
                  <Pair
                    label="Current AI / automations"
                    value={
                      selected.currentAutomations.length
                        ? selected.currentAutomations.join(', ')
                        : '—'
                    }
                  />
                  <Pair
                    label="Desired launch"
                    value={pretty('desiredLaunch', selected.desiredLaunch)}
                  />
                </Section>

                {selected.successDefinition && (
                  <Section title="Success in 6 months">
                    <p className="text-sm text-muted-foreground italic border-l-2 border-brand-primary/40 pl-3">
                      {selected.successDefinition}
                    </p>
                  </Section>
                )}

                {/* Notes */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Admin notes
                  </p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Internal notes about this lead..."
                    rows={3}
                  />
                  <Button size="sm" variant="outline" onClick={handleSaveNotes}>
                    Save Notes
                  </Button>
                </div>

                {/* Delete */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete discovery
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this discovery?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This permanently removes the submission from{' '}
                        <span className="font-medium">
                          {selected.businessName}
                        </span>
                        . This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(selected._id)}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground text-sm">
                  Select a discovery submission to view details.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border pb-1">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <span className="text-muted-foreground col-span-1">{label}</span>
      <span className="col-span-2">{value}</span>
    </div>
  )
}
