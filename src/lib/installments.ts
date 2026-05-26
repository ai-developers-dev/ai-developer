// Shared types + helpers for the proposal installment schedule.
// Keep this file framework-agnostic — used by both pay page and the editor.

export type Stage =
  | 'lead'
  | 'proposal'
  | 'review'
  | 'contracted'
  | 'in_progress'
  | 'completed'

export type InstallmentTrigger =
  | { type: 'on_acceptance' }
  | { type: 'net_days_after_previous'; days: number }
  | { type: 'on_completion' }
  | { type: 'on_stage'; stage: Stage }

export type InstallmentStatus = 'pending' | 'invoiced' | 'paid' | 'skipped'

export interface Installment {
  id: string
  label: string
  percent: number
  order: number
  trigger: InstallmentTrigger
  status: InstallmentStatus
  stripeSessionId?: string
  stripePaymentIntentId?: string
  dueAt?: number
  invoicedAt?: number
  paidAt?: number
  scheduledJobId?: string
}

// Slim shape submitted from the editor; backend fills id/order/status.
export interface InstallmentInput {
  label: string
  percent: number
  trigger: InstallmentTrigger
}

/**
 * Compute the dollar amount each installment receives. Works in integer cents
 * to dodge float drift; the final row absorbs any sub-cent rounding so the
 * sum always equals totalAmount exactly.
 */
export function computeInstallmentAmounts(
  totalAmount: number,
  percents: number[],
): number[] {
  const totalCents = Math.round(totalAmount * 100)
  const amounts: number[] = []
  let remaining = totalCents
  for (let i = 0; i < percents.length; i++) {
    if (i === percents.length - 1) {
      amounts.push(remaining / 100)
    } else {
      const rowCents = Math.floor((totalCents * percents[i]) / 100)
      amounts.push(rowCents / 100)
      remaining -= rowCents
    }
  }
  return amounts
}

const stageLabels: Record<Stage, string> = {
  lead: 'Lead',
  proposal: 'Proposal',
  review: 'Review',
  contracted: 'Contracted',
  in_progress: 'In Progress',
  completed: 'Completed',
}

export function describeTrigger(t: InstallmentTrigger): string {
  switch (t.type) {
    case 'on_acceptance':
      return 'On acceptance'
    case 'net_days_after_previous':
      return `Net ${t.days} days`
    case 'on_completion':
      return 'On project completion'
    case 'on_stage':
      return `On stage: ${stageLabels[t.stage]}`
  }
}

export const STAGE_OPTIONS: { value: Stage; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'review', label: 'Review' },
  { value: 'contracted', label: 'Contracted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

export type Preset = 'full' | 'split-50' | 'thirds' | 'front-loaded' | 'custom'

export const PRESETS: Record<
  Exclude<Preset, 'custom'>,
  { label: string; rows: InstallmentInput[] }
> = {
  full: {
    label: 'Full payment',
    rows: [
      { label: 'Full payment', percent: 100, trigger: { type: 'on_acceptance' } },
    ],
  },
  'split-50': {
    label: '50 / 50',
    rows: [
      { label: 'Deposit', percent: 50, trigger: { type: 'on_acceptance' } },
      { label: 'Final', percent: 50, trigger: { type: 'on_completion' } },
    ],
  },
  thirds: {
    label: '33 / 33 / 34',
    rows: [
      { label: 'Deposit', percent: 33, trigger: { type: 'on_acceptance' } },
      {
        label: 'Net 30',
        percent: 33,
        trigger: { type: 'net_days_after_previous', days: 30 },
      },
      { label: 'Final', percent: 34, trigger: { type: 'on_completion' } },
    ],
  },
  'front-loaded': {
    label: '30 / 30 / 40',
    rows: [
      { label: 'Deposit', percent: 30, trigger: { type: 'on_acceptance' } },
      {
        label: 'Net 30',
        percent: 30,
        trigger: { type: 'net_days_after_previous', days: 30 },
      },
      { label: 'Final', percent: 40, trigger: { type: 'on_completion' } },
    ],
  },
}

export function isScheduleValid(rows: InstallmentInput[]): {
  ok: boolean
  reason?: string
} {
  if (rows.length === 0) return { ok: false, reason: 'Add at least one row' }
  for (const r of rows) {
    if (!r.label.trim()) return { ok: false, reason: 'Each row needs a label' }
    if (!Number.isFinite(r.percent) || r.percent <= 0)
      return { ok: false, reason: 'Each row needs a positive percent' }
    if (
      r.trigger.type === 'net_days_after_previous' &&
      (!Number.isFinite(r.trigger.days) || r.trigger.days < 0)
    )
      return { ok: false, reason: 'Net days must be ≥ 0' }
  }
  const sum = rows.reduce((s, r) => s + r.percent, 0)
  if (Math.abs(sum - 100) > 0.01)
    return { ok: false, reason: `Percents must total 100% (got ${sum.toFixed(2)}%)` }
  return { ok: true }
}
