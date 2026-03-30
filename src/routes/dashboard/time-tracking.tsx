import { useState, useMemo } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/dashboard/time-tracking')({
  component: TimeTrackingPage,
})

function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

function getDaysOfWeek(weekStart: string): string[] {
  const days: string[] = []
  const start = new Date(weekStart)
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function TimeTrackingPage() {
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()))
  const [showForm, setShowForm] = useState(false)
  const [newEntry, setNewEntry] = useState({
    projectId: '',
    description: '',
    hours: '',
    date: new Date().toISOString().split('T')[0],
    billable: true,
    hourlyRate: '',
  })

  const projects = useQuery(api.projects.list, {})
  const weekEntries = useQuery(api.timeEntries.getWeekEntries, { weekStart })
  const currentUser = useQuery(api.users.getCurrent)
  const allUsers = useQuery(api.users.list)
  const createEntry = useMutation(api.timeEntries.create)
  const removeEntry = useMutation(api.timeEntries.remove)

  // Build list of available rates from users who have one set
  const availableRates = useMemo(() => {
    if (!allUsers) return []
    const rateSet = new Set<number>()
    for (const u of allUsers) {
      if (u.billableRate !== undefined) rateSet.add(u.billableRate)
    }
    return Array.from(rateSet).sort((a, b) => a - b)
  }, [allUsers])

  const days = getDaysOfWeek(weekStart)

  const projectEntries = useMemo(() => {
    if (!weekEntries || !projects) return []
    const grouped = new Map<string, { project: any; entries: Map<string, any[]> }>()

    for (const entry of weekEntries) {
      if (!grouped.has(entry.projectId)) {
        const project = projects.find((p) => p._id === entry.projectId)
        grouped.set(entry.projectId, {
          project: project || { title: 'Unknown', _id: entry.projectId },
          entries: new Map(),
        })
      }
      const group = grouped.get(entry.projectId)!
      if (!group.entries.has(entry.date)) {
        group.entries.set(entry.date, [])
      }
      group.entries.get(entry.date)!.push(entry)
    }

    return Array.from(grouped.values())
  }, [weekEntries, projects])

  const weekTotal = weekEntries?.reduce((sum, e) => sum + e.hours, 0) ?? 0
  const weekBillable = weekEntries
    ?.filter((e) => e.billable)
    .reduce((sum, e) => sum + e.hours * (e.hourlyRate || 0), 0) ?? 0

  function navigateWeek(direction: number) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + direction * 7)
    setWeekStart(d.toISOString().split('T')[0])
  }

  async function handleAddEntry() {
    if (!newEntry.projectId || !newEntry.description || !newEntry.hours) return
    const rate = newEntry.hourlyRate ? parseFloat(newEntry.hourlyRate) : undefined
    await createEntry({
      projectId: newEntry.projectId as Id<'projects'>,
      description: newEntry.description,
      hours: parseFloat(newEntry.hours),
      date: newEntry.date,
      billable: newEntry.billable,
      hourlyRate: !isNaN(rate as number) ? rate : undefined,
    })
    setNewEntry({
      projectId: '',
      description: '',
      hours: '',
      date: new Date().toISOString().split('T')[0],
      billable: true,
      hourlyRate: '',
    })
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
          <p className="text-muted-foreground">Track hours across your projects.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />
          Log Time
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <Select
                  value={newEntry.projectId}
                  onValueChange={(v) =>
                    setNewEntry({ ...newEntry, projectId: v })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={newEntry.description}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, description: e.target.value })
                  }
                  placeholder="What did you work on?"
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Hours</Label>
                <Input
                  type="number"
                  step="0.25"
                  min="0"
                  value={newEntry.hours}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, hours: e.target.value })
                  }
                  placeholder="0.0"
                />
              </div>
              <div className="space-y-2">
                <Label>Billable Rate ($/hr)</Label>
                <Select
                  value={newEntry.hourlyRate}
                  onValueChange={(v) =>
                    setNewEntry({ ...newEntry, hourlyRate: v })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        currentUser?.billableRate
                          ? `Default: $${currentUser.billableRate.toFixed(2)}`
                          : 'Select rate'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUser?.billableRate !== undefined && (
                      <SelectItem value={currentUser.billableRate.toString()}>
                        My rate — ${currentUser.billableRate.toFixed(2)}/hr
                      </SelectItem>
                    )}
                    {availableRates
                      .filter((r) => r !== currentUser?.billableRate)
                      .map((rate) => (
                        <SelectItem key={rate} value={rate.toString()}>
                          ${rate.toFixed(2)}/hr
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newEntry.billable}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, billable: e.target.checked })
                    }
                    className="rounded"
                  />
                  Billable
                </label>
                <Button size="sm" onClick={handleAddEntry}>
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week navigator */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigateWeek(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <CardTitle className="text-base">
                {new Date(weekStart).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                —{' '}
                {new Date(days[6]).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </CardTitle>
              <CardDescription>
                {weekTotal.toFixed(1)}h total
                {weekBillable > 0 && (
                  <span className="ml-2">&middot; ${weekBillable.toFixed(2)} billable</span>
                )}
                {currentUser?.billableRate !== undefined && (
                  <span className="ml-2">&middot; ${currentUser.billableRate.toFixed(2)}/hr</span>
                )}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigateWeek(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left pr-4 text-xs font-medium text-muted-foreground">Project</th>
                {days.map((day, i) => (
                  <th key={day} className="pb-2 text-center w-20 text-xs font-medium text-muted-foreground">
                    <div>{dayLabels[i]}</div>
                    <div className="text-[10px] font-normal">
                      {new Date(day).getDate()}
                    </div>
                  </th>
                ))}
                <th className="pb-2 text-center w-20 text-xs font-medium text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {projectEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No time entries this week.
                  </td>
                </tr>
              ) : (
                projectEntries.map(({ project, entries }) => {
                  const rowTotal = Array.from(entries.values())
                    .flat()
                    .reduce((sum, e) => sum + e.hours, 0)

                  return (
                    <tr key={project._id} className="border-b hover:bg-muted/50">
                      <td className="py-3 pr-4">
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {project.title}
                        </p>
                      </td>
                      {days.map((day) => {
                        const dayEntries = entries.get(day) || []
                        const dayTotal = dayEntries.reduce(
                          (sum: number, e: any) => sum + e.hours,
                          0
                        )
                        return (
                          <td key={day} className="py-3 text-center">
                            {dayTotal > 0 ? (
                              <span className="text-sm font-medium">
                                {dayTotal.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground/30">—</span>
                            )}
                          </td>
                        )
                      })}
                      <td className="py-3 text-center">
                        <span className="text-sm font-bold">
                          {rowTotal.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Detailed entries */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Entries</CardTitle>
          <CardDescription>Individual time log entries for this week.</CardDescription>
        </CardHeader>
        <CardContent>
          {!weekEntries || weekEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No entries this week.
            </p>
          ) : (
            <div className="space-y-2">
              {weekEntries.map((entry) => {
                const project = projects?.find((p) => p._id === entry.projectId)
                return (
                  <div
                    key={entry._id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {entry.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {project?.title || 'Unknown'} &middot; {entry.date}
                        {entry.billable && (
                          <span className="ml-1">&middot; billable</span>
                        )}
                        {entry.billable && entry.hourlyRate && (
                          <span className="ml-1">
                            &middot; ${(entry.hours * entry.hourlyRate).toFixed(2)}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{entry.hours}h</span>
                      <button
                        onClick={() => removeEntry({ id: entry._id })}
                        className="p-1 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
