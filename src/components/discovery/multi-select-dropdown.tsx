import { useId, useMemo, useState } from 'react'
import { Check, Search, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Props {
  options: string[]
  value: string[]
  onChange: (next: string[]) => void
  label?: string
  /** When the list is at least this long, render a filter input at the top. */
  filterThreshold?: number
}

/**
 * Inline checkbox panel — flat, scrollable, no floating overlay so it never
 * covers the next question on the form. Each option is a row with a
 * checkbox; click anywhere on the row to toggle. A filter input appears at
 * the top when the list is long enough to warrant it.
 *
 * Note: kept the file name `multi-select-dropdown` for import stability,
 * but the visual is intentionally NOT a dropdown.
 */
export function MultiSelectDropdown({
  options,
  value,
  onChange,
  label,
  filterThreshold = 10,
}: Props) {
  const id = useId()
  const [query, setQuery] = useState('')
  const showFilter = options.length >= filterThreshold

  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase()
    if (!lower) return options
    return options.filter((o) => o.toLowerCase().includes(lower))
  }, [options, query])

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
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </Label>
      )}

      <div
        id={id}
        className="rounded-lg border border-input bg-background overflow-hidden"
      >
        {showFilter && (
          <div className="relative border-b border-input">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter…"
              className="w-full pl-9 pr-9 py-2 text-sm bg-transparent outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear filter"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
        )}

        <div className="max-h-56 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground text-center">
              No matches for "{query}"
            </p>
          ) : (
            filtered.map((opt) => {
              const checked = value.includes(opt)
              return (
                <label
                  key={opt}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm cursor-pointer transition-colors',
                    checked
                      ? 'bg-brand-primary/5 text-foreground'
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors',
                      checked
                        ? 'border-brand-primary bg-brand-primary text-white'
                        : 'border-input bg-background',
                    )}
                  >
                    {checked && <Check className="w-3 h-3" strokeWidth={3} />}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => toggle(opt)}
                  />
                  <span className="flex-1">{opt}</span>
                </label>
              )
            })
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {value.length === 0
          ? 'Tap items to select. Multiple choices allowed.'
          : `${value.length} selected`}
      </p>
    </div>
  )
}
