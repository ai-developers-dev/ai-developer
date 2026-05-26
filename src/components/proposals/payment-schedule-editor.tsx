import { useMemo } from 'react'
import { Plus, Trash2 } from 'lucide-react'
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
import {
  computeInstallmentAmounts,
  isScheduleValid,
  PRESETS,
  STAGE_OPTIONS,
  type InstallmentInput,
  type InstallmentTrigger,
  type Stage,
} from '@/lib/installments'

interface Props {
  totalAmount: number
  value: InstallmentInput[]
  onChange: (rows: InstallmentInput[]) => void
  /** When true, the editor renders read-only (e.g. schedule locked after first paid row). */
  locked?: boolean
}

const TRIGGER_OPTIONS: { value: InstallmentTrigger['type']; label: string }[] = [
  { value: 'on_acceptance', label: 'On acceptance' },
  { value: 'net_days_after_previous', label: 'Net N days after previous' },
  { value: 'on_completion', label: 'On project completion' },
  { value: 'on_stage', label: 'On specific project stage' },
]

function fmt(n: number) {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function PaymentScheduleEditor({
  totalAmount,
  value,
  onChange,
  locked = false,
}: Props) {
  const amounts = useMemo(
    () => computeInstallmentAmounts(totalAmount || 0, value.map((r) => r.percent)),
    [totalAmount, value],
  )
  const sum = useMemo(
    () => value.reduce((s, r) => s + (Number.isFinite(r.percent) ? r.percent : 0), 0),
    [value],
  )
  const validity = useMemo(() => isScheduleValid(value), [value])

  function updateRow(i: number, patch: Partial<InstallmentInput>) {
    if (locked) return
    const next = value.slice()
    next[i] = { ...next[i], ...patch }
    onChange(next)
  }

  function updateTrigger(i: number, type: InstallmentTrigger['type']) {
    if (locked) return
    let trigger: InstallmentTrigger
    switch (type) {
      case 'on_acceptance':
        trigger = { type: 'on_acceptance' }
        break
      case 'net_days_after_previous':
        trigger = { type: 'net_days_after_previous', days: 30 }
        break
      case 'on_completion':
        trigger = { type: 'on_completion' }
        break
      case 'on_stage':
        trigger = { type: 'on_stage', stage: 'review' }
        break
    }
    updateRow(i, { trigger })
  }

  function addRow() {
    if (locked) return
    onChange([
      ...value,
      { label: 'Installment', percent: 0, trigger: { type: 'on_completion' } },
    ])
  }

  function removeRow(i: number) {
    if (locked) return
    onChange(value.filter((_, idx) => idx !== i))
  }

  function applyPreset(key: keyof typeof PRESETS) {
    if (locked) return
    onChange(PRESETS[key].rows.map((r) => ({ ...r, trigger: { ...r.trigger } })))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Label className="text-sm font-medium">Payment Schedule</Label>
        {!locked && (
          <div className="flex gap-1.5 flex-wrap">
            {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((key) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => applyPreset(key)}
              >
                {PRESETS[key].label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {locked && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          Schedule is locked — at least one installment has already been
          invoiced or paid.
        </p>
      )}

      <div className="space-y-2">
        {value.map((row, i) => {
          const isLast = i === value.length - 1
          return (
            <div
              key={i}
              className="grid grid-cols-12 gap-2 items-start rounded-md border bg-card p-2"
            >
              <div className="col-span-3">
                <Input
                  value={row.label}
                  onChange={(e) => updateRow(i, { label: e.target.value })}
                  placeholder="Label"
                  className="h-8"
                  disabled={locked}
                />
              </div>
              <div className="col-span-2">
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={Number.isFinite(row.percent) ? row.percent : ''}
                    onChange={(e) =>
                      updateRow(i, { percent: parseFloat(e.target.value) || 0 })
                    }
                    className="h-8 pr-7"
                    disabled={locked}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
              <div className="col-span-4">
                <Select
                  value={row.trigger.type}
                  onValueChange={(v) =>
                    updateTrigger(i, v as InstallmentTrigger['type'])
                  }
                  disabled={locked}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {row.trigger.type === 'net_days_after_previous' && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs">
                    <Input
                      type="number"
                      min={0}
                      value={row.trigger.days}
                      onChange={(e) =>
                        updateRow(i, {
                          trigger: {
                            type: 'net_days_after_previous',
                            days: parseInt(e.target.value, 10) || 0,
                          },
                        })
                      }
                      className="h-7 w-20"
                      disabled={locked}
                    />
                    <span className="text-muted-foreground">days</span>
                  </div>
                )}
                {row.trigger.type === 'on_stage' && (
                  <div className="mt-1">
                    <Select
                      value={row.trigger.stage}
                      onValueChange={(v) =>
                        updateRow(i, {
                          trigger: { type: 'on_stage', stage: v as Stage },
                        })
                      }
                      disabled={locked}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="col-span-2 text-right pt-1.5">
                <span className="text-sm font-medium">
                  ${fmt(amounts[i] ?? 0)}
                </span>
                {isLast && value.length > 1 && (
                  <p className="text-[10px] text-muted-foreground">
                    absorbs rounding
                  </p>
                )}
              </div>
              <div className="col-span-1 flex justify-end pt-1">
                {!locked && (
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    aria-label="Remove row"
                    className="p-1 rounded hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!locked && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addRow}
          className="h-8"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add installment
        </Button>
      )}

      <div className="flex items-center justify-between text-xs pt-1">
        <span
          className={
            validity.ok
              ? 'text-green-700'
              : 'text-red-600'
          }
        >
          Σ = {sum.toFixed(2)}%{' '}
          {validity.ok ? '✓' : `— ${validity.reason}`}
        </span>
        <span className="text-muted-foreground">
          Total: ${fmt(totalAmount || 0)}
        </span>
      </div>
    </div>
  )
}
