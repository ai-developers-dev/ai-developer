import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Label } from '@/components/ui/label'
import { X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  options: string[]
  value: string[]
  onChange: (next: string[]) => void
  label?: string
  placeholder?: string
}

/**
 * Tag-input style multi-select. Always-visible chips with an inline filter.
 *
 * UX: focus the input → suggestion list appears below; type to filter; click
 * an option to add it as a chip; click X on a chip to remove it; Backspace
 * on empty input removes the last chip; Escape closes the suggestion list.
 *
 * This avoids the floating-dropdown trap where users couldn't tell how to
 * close the menu or scroll its options.
 */
export function MultiSelectDropdown({
  options,
  value,
  onChange,
  label,
  placeholder = 'Type to search…',
}: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()

  const remaining = useMemo(() => {
    const lower = query.trim().toLowerCase()
    return options
      .filter((o) => !value.includes(o))
      .filter((o) => !lower || o.toLowerCase().includes(lower))
  }, [options, value, query])

  function add(opt: string) {
    if (!value.includes(opt)) onChange([...value, opt])
    setQuery('')
    inputRef.current?.focus()
  }

  function remove(opt: string) {
    onChange(value.filter((v) => v !== opt))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && query === '' && value.length > 0) {
      e.preventDefault()
      onChange(value.slice(0, -1))
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    } else if (e.key === 'Enter' && remaining.length > 0) {
      e.preventDefault()
      add(remaining[0])
    }
  }

  // Close on outside click.
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div className="space-y-2" ref={wrapperRef}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </Label>
      )}

      <div className="relative">
        {/* Tag input bar */}
        <div
          className={cn(
            'flex flex-wrap gap-1.5 items-center min-h-10 w-full rounded-md border bg-background px-2 py-1.5 text-sm transition-colors cursor-text',
            'focus-within:ring-2 focus-within:ring-brand-primary/40 focus-within:border-brand-primary',
            open ? 'border-brand-primary' : 'border-input',
          )}
          onClick={() => {
            inputRef.current?.focus()
            setOpen(true)
          }}
        >
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded bg-brand-primary/10 text-brand-primary text-xs font-medium px-2 py-1 border border-brand-primary/20"
            >
              {v}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  remove(v)
                }}
                aria-label={`Remove ${v}`}
                className="rounded-full hover:bg-brand-primary/20 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-32 bg-transparent outline-none text-sm py-0.5"
          />
          <ChevronDown
            className={cn(
              'w-4 h-4 opacity-50 shrink-0 transition-transform',
              open && 'rotate-180',
            )}
          />
        </div>

        {/* Suggestion list */}
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-popover text-popover-foreground shadow-md overflow-hidden">
            {remaining.length === 0 ? (
              <div className="px-3 py-2.5 text-sm text-muted-foreground">
                {value.length === options.length
                  ? 'All options selected'
                  : query
                    ? `No matches for "${query}"`
                    : 'No options available'}
              </div>
            ) : (
              <ul className="max-h-60 overflow-y-auto py-1">
                {remaining.map((opt) => (
                  <li key={opt}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        add(opt)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {opt}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {value.length} selected · click an item or press Backspace to remove
        </p>
      )}
    </div>
  )
}
