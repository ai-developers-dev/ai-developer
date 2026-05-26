import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface Props {
  options: string[]
  value: string[]
  onChange: (next: string[]) => void
  /** Optional label shown above the chip group */
  label?: string
}

/**
 * Pill-style multi-select. Each chip toggles independently — no dropdown,
 * no overflow, great on mobile. Designed for sets of ~5–15 options.
 */
export function MultiSelectChips({ options, value, onChange, label }: Props) {
  function toggle(opt: string) {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt))
    } else {
      onChange([...value, opt])
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-medium text-foreground">{label}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm border transition-all',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40',
                active
                  ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                  : 'bg-surface border-subtle-border text-muted-foreground hover:border-brand-primary/40 hover:text-foreground',
              )}
            >
              {active && <Check className="w-3.5 h-3.5" />}
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}
