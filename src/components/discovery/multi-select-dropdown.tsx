import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, X } from 'lucide-react'

interface Props {
  options: string[]
  value: string[]
  onChange: (next: string[]) => void
  label?: string
  placeholder?: string
}

/**
 * Dropdown variant of MultiSelectChips. Click trigger → checkboxes for each
 * option. Selected items render as small removable badges underneath the
 * trigger. Designed to handle 5–30 options without sprawling the form.
 */
export function MultiSelectDropdown({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select…',
}: Props) {
  const [open, setOpen] = useState(false)

  function toggle(opt: string) {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt))
    } else {
      onChange([...value, opt])
    }
  }

  function remove(opt: string) {
    onChange(value.filter((v) => v !== opt))
  }

  const triggerLabel =
    value.length === 0
      ? placeholder
      : `${value.length} selected`

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium text-foreground">{label}</Label>
      )}

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal text-left"
          >
            <span
              className={
                value.length === 0
                  ? 'text-muted-foreground'
                  : 'text-foreground'
              }
            >
              {triggerLabel}
            </span>
            <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="w-(--radix-dropdown-menu-trigger-width) max-h-72 overflow-y-auto"
        >
          {value.length > 0 && (
            <>
              <DropdownMenuCheckboxItem
                checked={false}
                onSelect={(e) => {
                  e.preventDefault()
                  onChange([])
                }}
                className="text-muted-foreground text-xs"
              >
                Clear selection
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
            </>
          )}
          {options.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt}
              checked={value.includes(opt)}
              onSelect={(e) => {
                e.preventDefault()
                toggle(opt)
              }}
            >
              {opt}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <Badge
              key={v}
              variant="secondary"
              className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 pl-2 pr-1 py-0.5 gap-1 font-normal"
            >
              {v}
              <button
                type="button"
                onClick={() => remove(v)}
                aria-label={`Remove ${v}`}
                className="rounded-full hover:bg-brand-primary/20 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
