/**
 * Renders a proposal description the way clients should read it: blank-line
 * separated paragraphs, "•"/"-" lines as a bulleted list, **bold** runs.
 *
 * The builder writes the added services as "• Service" lines, and the
 * discovery generator writes **bold** + bullets — a plain <p> collapses all of
 * that into one run-on line, so every surface that shows a description
 * (pay page, portal, admin detail, PDF export) goes through here.
 */
export function ProposalDescription({
  text,
  className = '',
}: {
  text: string
  className?: string
}) {
  const blocks = text.split(/\n{2,}/)
  return (
    <div className={`space-y-4 text-muted-foreground leading-relaxed ${className}`}>
      {blocks.map((block, i) => {
        const lines = block.split('\n')
        const isList = lines.every(
          (l) => l.trim().startsWith('•') || l.trim().startsWith('-'),
        )
        if (isList && lines.length > 1) {
          return (
            <ul key={i} className="list-disc pl-5 space-y-1.5">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.trim().replace(/^[•\-]\s*/, ''))}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} className="whitespace-pre-line">
            {renderInline(block)}
          </p>
        )
      })}
    </div>
  )
}

function renderInline(s: string): React.ReactNode {
  const parts = s.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}
