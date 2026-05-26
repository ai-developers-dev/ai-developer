import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
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
import { Plus, RotateCcw, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/dashboard/pricing')({
  component: PricingSettingsPage,
})

const EMPLOYEE_LABELS: Record<string, string> = {
  '1': '1 (solo)',
  '2-5': '2-5',
  '6-10': '6-10',
  '11-20': '11-20',
  '21-50': '21-50',
  '50+': '50+',
}
const LOCATION_LABELS: Record<string, string> = {
  single: 'Single location',
  '2-3': '2-3 service areas',
  '4+': '4+ service areas',
  'multi-state': 'Multi-state',
}
const RADIUS_LABELS: Record<string, string> = {
  under_25: 'Under 25 miles',
  '25-50': '25-50 miles',
  '50-100': '50-100 miles',
  '100+': '100+ miles',
}
const TRADE_LABELS: Record<string, string> = {
  electrician: 'Electrician',
  plumber: 'Plumber',
  hvac: 'HVAC',
  'multi-trade': 'Multi-trade',
  other: 'Other',
}

function PricingSettingsPage() {
  const cfg = useQuery(api.pricingSettings.get)
  const update = useMutation(api.pricingSettings.update)
  const reset = useMutation(api.pricingSettings.resetToDefaults)

  if (cfg === undefined) {
    return (
      <p className="text-sm text-muted-foreground py-12 text-center">
        Loading…
      </p>
    )
  }
  if (cfg === null) {
    return (
      <p className="text-sm text-muted-foreground py-12 text-center">
        Admin access required.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
          <p className="text-muted-foreground">
            Tune what the "Convert to Proposal" generator charges. Changes
            apply to the next conversion — existing proposals are untouched.
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Reset to defaults
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset pricing to defaults?</AlertDialogTitle>
              <AlertDialogDescription>
                Every value on this page reverts to the baked-in defaults.
                Any custom integrations you've added will be removed. This
                can't be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => reset()}>
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Base price</CardTitle>
          <CardDescription>
            Every custom CRM proposal starts here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DollarInput
            value={cfg.basePrice}
            onCommit={(v) => update({ basePrice: v })}
          />
        </CardContent>
      </Card>

      <ScaleCard
        title="Employee count"
        description="Added when the discovery says the shop is this size."
        labels={EMPLOYEE_LABELS}
        value={cfg.employeeScale}
        onCommit={(next) => update({ employeeScale: next })}
      />

      <ScaleCard
        title="Service locations"
        description="Added when the shop runs out of more than one location."
        labels={LOCATION_LABELS}
        value={cfg.locationScale}
        onCommit={(next) => update({ locationScale: next })}
      />

      <ScaleCard
        title="Service radius"
        description="Added when the service area extends beyond a normal commute."
        labels={RADIUS_LABELS}
        value={cfg.radiusScale}
        onCommit={(next) => update({ radiusScale: next })}
      />

      <ScaleCard
        title="Trade complexity"
        description="Added based on the primary trade — multi-trade and 'other' need extra workflow scaffolding."
        labels={TRADE_LABELS}
        value={cfg.tradeScale}
        onCommit={(next) => update({ tradeScale: next })}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature line items</CardTitle>
          <CardDescription>
            Conditional add-ons. Each fires only when the relevant discovery
            answer flags it (e.g., on-site quoting line only appears if
            "techs quote on-site" is anything except "never").
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <PriceRow
            label="On-site mobile quoting + deposit collection"
            value={cfg.onSiteQuotingPrice}
            onCommit={(v) => update({ onSiteQuotingPrice: v })}
          />
          <PriceRow
            label="Recurring maintenance contract engine"
            value={cfg.recurringContractsPrice}
            onCommit={(v) => update({ recurringContractsPrice: v })}
          />
          <PriceRow
            label="Photo documentation & job timeline (always included)"
            value={cfg.photoDocsPrice}
            onCommit={(v) => update({ photoDocsPrice: v })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Modules included in CRM Starter
          </CardTitle>
          <CardDescription>
            These ship out of the box with our CRM Starter template. Each
            fires conditionally based on discovery answers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <PriceRow
            label="Marketing landing page + online booking (when no website / no online booking)"
            value={cfg.landingPagePrice ?? 0}
            onCommit={(v) => update({ landingPagePrice: v })}
          />
          <PriceRow
            label="Automated review request engine (when not collecting reviews routinely)"
            value={cfg.reviewsPrice ?? 0}
            onCommit={(v) => update({ reviewsPrice: v })}
          />
          <PriceRow
            label="Reporting dashboard (when 6+ employees)"
            value={cfg.reportingPrice ?? 0}
            onCommit={(v) => update({ reportingPrice: v })}
          />
          <PriceRow
            label="Calendar + dispatch board (when 6+ employees or multi-location)"
            value={cfg.calendarDispatchPrice ?? 0}
            onCommit={(v) => update({ calendarDispatchPrice: v })}
          />
        </CardContent>
      </Card>

      <IntegrationsCard
        value={cfg.integrations}
        onCommit={(next) => update({ integrations: next })}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cross-sells</CardTitle>
          <CardDescription>
            Suggested add-ons that fire automatically based on discovery
            answers. The line is added to the proposal — you can strike it
            before sending.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <PriceRow
            label="Voice AI receptionist (when missed-call or after-hours = AI)"
            value={cfg.voiceAiCrossSellPrice}
            onCommit={(v) => update({ voiceAiCrossSellPrice: v })}
          />
          <PriceRow
            label="Automations bundle (when client uses no automations today)"
            value={cfg.automationsCrossSellPrice}
            onCommit={(v) => update({ automationsCrossSellPrice: v })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rush fee</CardTitle>
          <CardDescription>
            Percentage added to the subtotal when the discovery says
            "desired launch: ASAP".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PercentInput
            value={cfg.rushFeePct}
            onCommit={(v) => update({ rushFeePct: v })}
          />
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// Building blocks
// ============================================================

interface DollarInputProps {
  value: number
  onCommit: (next: number) => void
}

function DollarInput({ value, onCommit }: DollarInputProps) {
  const [local, setLocal] = useState(value.toString())

  useEffect(() => {
    setLocal(value.toString())
  }, [value])

  return (
    <div className="relative max-w-xs">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        $
      </span>
      <Input
        type="number"
        min={0}
        step={100}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          const n = parseInt(local, 10)
          if (!Number.isFinite(n)) {
            setLocal(value.toString())
            return
          }
          if (n !== value) onCommit(n)
        }}
        className="pl-7"
      />
    </div>
  )
}

interface PercentInputProps {
  value: number // 0.20 = 20%
  onCommit: (next: number) => void
}

function PercentInput({ value, onCommit }: PercentInputProps) {
  const [local, setLocal] = useState((value * 100).toString())

  useEffect(() => {
    setLocal((value * 100).toString())
  }, [value])

  return (
    <div className="relative max-w-xs">
      <Input
        type="number"
        min={0}
        max={100}
        step={1}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          const n = parseFloat(local)
          if (!Number.isFinite(n)) {
            setLocal((value * 100).toString())
            return
          }
          const next = Math.max(0, Math.min(100, n)) / 100
          if (Math.abs(next - value) > 0.0001) onCommit(next)
        }}
        className="pr-8"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        %
      </span>
    </div>
  )
}

interface PriceRowProps {
  label: string
  value: number
  onCommit: (next: number) => void
}

function PriceRow({ label, value, onCommit }: PriceRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm font-normal flex-1">{label}</Label>
      <DollarInput value={value} onCommit={onCommit} />
    </div>
  )
}

interface ScaleCardProps {
  title: string
  description: string
  labels: Record<string, string>
  value: { key: string; price: number }[]
  onCommit: (next: { key: string; price: number }[]) => void
}

function ScaleCard({
  title,
  description,
  labels,
  value,
  onCommit,
}: ScaleCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {value.map((row) => (
          <PriceRow
            key={row.key}
            label={labels[row.key] ?? row.key}
            value={row.price}
            onCommit={(price) => {
              const next = value.map((r) =>
                r.key === row.key ? { ...r, price } : r,
              )
              onCommit(next)
            }}
          />
        ))}
      </CardContent>
    </Card>
  )
}

interface IntegrationRow {
  key: string
  label: string
  price: number
  customBuild?: boolean
}

interface IntegrationsCardProps {
  value: IntegrationRow[]
  onCommit: (next: IntegrationRow[]) => void
}

function IntegrationsCard({ value, onCommit }: IntegrationsCardProps) {
  // Track which integration is being newly added (so we don't focus-steal mid-edit).
  const integrationOptions = useMemo(
    () => value.map((v) => v.key),
    [value],
  )

  function updateLabel(i: number, label: string) {
    const next = value.slice()
    next[i] = { ...next[i], label }
    onCommit(next)
  }
  function updatePrice(i: number, price: number) {
    const next = value.slice()
    next[i] = { ...next[i], price }
    onCommit(next)
  }
  function remove(i: number) {
    onCommit(value.filter((_, idx) => idx !== i))
  }
  function add() {
    const next = [
      ...value,
      {
        key: `custom_${Date.now()}`,
        label: 'New integration',
        price: 0,
        customBuild: false,
      },
    ]
    onCommit(next)
  }

  function toggleCustomBuild(i: number, customBuild: boolean) {
    const next = value.slice()
    next[i] = { ...next[i], customBuild }
    onCommit(next)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base">Integrations</CardTitle>
          <CardDescription>
            Each integration appears as its own line item on the proposal
            when the discovery's "Required integrations" includes a matching
            key. The <strong>key</strong> must match the value sent from the
            discovery form (e.g., <code className="text-xs">QuickBooks</code>).
            Add new rows for integrations not in the form yet — they'll just
            sit dormant until the form sends a matching key.
          </CardDescription>
        </div>
        <Button onClick={add} size="sm" variant="outline">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        {value.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No integrations defined.
          </p>
        ) : (
          <div className="grid grid-cols-12 gap-2 items-start">
            <div className="col-span-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Key (form value)
            </div>
            <div className="col-span-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Line-item label
            </div>
            <div className="col-span-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Price
            </div>
            <div className="col-span-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Custom?
            </div>
            <div className="col-span-1" />
            {value.map((row, i) => (
              <IntegrationRow
                key={`${row.key}-${i}`}
                row={row}
                onKeyChange={(key) => {
                  const next = value.slice()
                  next[i] = { ...next[i], key }
                  onCommit(next)
                }}
                onLabelChange={(label) => updateLabel(i, label)}
                onPriceChange={(price) => updatePrice(i, price)}
                onCustomBuildChange={(cb) => toggleCustomBuild(i, cb)}
                onRemove={() => remove(i)}
                allKeys={integrationOptions}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface IntegrationRowProps {
  row: IntegrationRow
  onKeyChange: (k: string) => void
  onLabelChange: (l: string) => void
  onPriceChange: (p: number) => void
  onCustomBuildChange: (cb: boolean) => void
  onRemove: () => void
  allKeys: string[]
}

function IntegrationRow({
  row,
  onKeyChange,
  onLabelChange,
  onPriceChange,
  onCustomBuildChange,
  onRemove,
}: IntegrationRowProps) {
  const [localKey, setLocalKey] = useState(row.key)
  const [localLabel, setLocalLabel] = useState(row.label)
  const [localPrice, setLocalPrice] = useState(row.price.toString())

  useEffect(() => setLocalKey(row.key), [row.key])
  useEffect(() => setLocalLabel(row.label), [row.label])
  useEffect(() => setLocalPrice(row.price.toString()), [row.price])

  return (
    <>
      <div className="col-span-3">
        <Input
          value={localKey}
          onChange={(e) => setLocalKey(e.target.value)}
          onBlur={() => {
            if (localKey !== row.key) onKeyChange(localKey)
          }}
          className="h-9 text-sm"
          placeholder="e.g. QuickBooks"
        />
      </div>
      <div className="col-span-4">
        <Input
          value={localLabel}
          onChange={(e) => setLocalLabel(e.target.value)}
          onBlur={() => {
            if (localLabel !== row.label) onLabelChange(localLabel)
          }}
          className="h-9 text-sm"
          placeholder="Shown on the proposal"
        />
      </div>
      <div className="col-span-2">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <Input
            type="number"
            min={0}
            step={100}
            value={localPrice}
            onChange={(e) => setLocalPrice(e.target.value)}
            onBlur={() => {
              const n = parseInt(localPrice, 10)
              if (!Number.isFinite(n)) {
                setLocalPrice(row.price.toString())
                return
              }
              if (n !== row.price) onPriceChange(n)
            }}
            className="pl-6 h-9 text-sm"
          />
        </div>
      </div>
      <div className="col-span-2 flex items-center pt-2">
        <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={!!row.customBuild}
            onChange={(e) => onCustomBuildChange(e.target.checked)}
            className="rounded border-input"
          />
          <span className="text-muted-foreground">Custom</span>
        </label>
      </div>
      <div className="col-span-1 flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove integration"
          className="p-1.5 rounded hover:bg-destructive/10"
        >
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </button>
      </div>
    </>
  )
}
