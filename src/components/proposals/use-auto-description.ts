import { useEffect, useState } from 'react'

export interface DescribableLine {
  description: string
  unitPrice: number
}

/**
 * The proposal description's service list: one "• " line per line item, in
 * order. Client pages render "•" lines as a bulleted list. Blank rows and
 * negative (discount) lines are left out.
 */
export function describeLineItems(items: DescribableLine[]): string {
  return items
    .filter((li) => li.description.trim() !== '' && li.unitPrice >= 0)
    .map((li) => `• ${li.description.trim()}`)
    .join('\n')
}

/**
 * A proposal description that fills itself in from the line items until the
 * user edits it.
 *
 * - auto: mirrors the line items — adds, removals and renames all show up.
 * - edited: the first keystroke hands it to the user. Newly added services
 *   are appended to the end; nothing the user wrote is ever overwritten.
 * - rebuild(): back to auto, regenerated from the current line items.
 */
export function useAutoDescription(lineItems: DescribableLine[]) {
  const [description, setDescription] = useState('')
  const [isAuto, setIsAuto] = useState(true)

  useEffect(() => {
    if (isAuto) setDescription(describeLineItems(lineItems))
  }, [lineItems, isAuto])

  return {
    description,
    isAuto,
    /** The user typed in the field. */
    edit(value: string) {
      setDescription(value)
      setIsAuto(false)
    },
    /** Lines were just added to the proposal. */
    append(added: DescribableLine[]) {
      if (isAuto) return // the effect picks them up
      const lines = describeLineItems(added)
      if (!lines) return
      setDescription((prev) =>
        prev.trim() ? `${prev.replace(/\s+$/, '')}\n${lines}` : lines,
      )
    },
    /** Opening a saved proposal: its description is the user's — never rewrite it. */
    load(value: string) {
      setDescription(value)
      setIsAuto(false)
    },
    /** A brand-new proposal. */
    reset() {
      setDescription('')
      setIsAuto(true)
    },
    rebuild() {
      setIsAuto(true)
    },
  }
}
