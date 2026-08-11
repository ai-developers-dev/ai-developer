import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

interface EarlyAccessFormProps {
  /** Which page the signup came from — stored on the row for attribution. */
  source: string
  /** Compact drops the labels and stacks tighter (used inside CTA blocks). */
  compact?: boolean
}

/**
 * Name + email capture for the courses waitlist. Shared by /early-access and
 * the CTA at the bottom of /courses so both write the same row shape.
 */
export function EarlyAccessForm({ source, compact = false }: EarlyAccessFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submitSignup = useMutation(api.earlyAccess.submit)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await submitSignup({ name, email, source })
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to submit early access signup:', err)
      setError("That didn't go through. Please try again in a moment.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-8">
        <div className="w-14 h-14 rounded-full bg-brand-tertiary/10 flex items-center justify-center mb-5">
          <CheckCircle2 className="w-7 h-7 text-brand-tertiary" />
        </div>
        <h3 className="font-heading text-xl font-bold text-foreground mb-2">
          You're on the list
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          We'll email <span className="text-foreground">{email}</span> the moment
          the courses open — with your early-access founding price locked in.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? 'space-y-3' : 'space-y-5'}>
      <div className={compact ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-5'}>
        <div className="space-y-2">
          {!compact && <Label htmlFor={`ea-name-${source}`}>Name</Label>}
          <Input
            id={`ea-name-${source}`}
            placeholder="Your name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={compact ? 'h-11' : 'h-12'}
          />
        </div>
        <div className="space-y-2">
          {!compact && <Label htmlFor={`ea-email-${source}`}>Email</Label>}
          <Input
            id={`ea-email-${source}`}
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={compact ? 'h-11' : 'h-12'}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full bg-brand-primary hover:bg-brand-secondary text-black h-12 text-base font-semibold"
      >
        {submitting ? 'Adding you…' : 'Get Early Access'}
        {!submitting && <ArrowRight className="w-4 h-4 ml-1" />}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        No spam. One email when the courses launch — that's it.
      </p>
    </form>
  )
}
