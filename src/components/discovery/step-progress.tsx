import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  label: string
}

interface Props {
  steps: Step[]
  currentStep: number // 1-based
}

export function StepProgress({ steps, currentStep }: Props) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <p className="font-label text-[11px] tracking-[0.25em] uppercase text-brand-tertiary">
          Step {currentStep} of {steps.length}
        </p>
        <p className="text-sm font-medium text-foreground">
          {steps[currentStep - 1]?.label}
        </p>
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((step, i) => {
          const idx = i + 1
          const status =
            idx < currentStep ? 'done' : idx === currentStep ? 'active' : 'pending'
          return (
            <div
              key={step.label}
              className={cn(
                'h-1.5 rounded-full transition-colors',
                status === 'done' && 'bg-brand-primary',
                status === 'active' && 'bg-brand-primary/60',
                status === 'pending' && 'bg-muted',
              )}
            />
          )
        })}
      </div>
    </div>
  )
}

interface DoneBadgeProps {
  done: boolean
}

export function StepDoneBadge({ done }: DoneBadgeProps) {
  if (!done) return null
  return (
    <span className="inline-flex items-center gap-1 text-xs text-brand-primary font-medium">
      <Check className="w-3.5 h-3.5" />
      Saved
    </span>
  )
}
