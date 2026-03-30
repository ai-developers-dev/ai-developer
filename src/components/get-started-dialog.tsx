import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export function GetStartedDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const submitContact = useMutation(api.contactSubmissions.submit)
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    service: '',
    description: '',
    budget: '',
  })

  function resetForm() {
    setForm({
      name: '',
      email: '',
      company: '',
      service: '',
      description: '',
      budget: '',
    })
    setSubmitted(false)
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      resetForm()
    }
    onOpenChange(value)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await submitContact({
        name: form.name,
        email: form.email,
        company: form.company || undefined,
        service: form.service,
        description: form.description,
        budget: form.budget || undefined,
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to submit contact form:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-foreground">
            Get Started
          </DialogTitle>
          <DialogDescription>
            Tell us about your project and we'll get back to you within 24 hours
            with a free quote.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-tertiary/10 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-brand-tertiary" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
              Thank you!
            </h3>
            <p className="text-muted-foreground max-w-md">
              We've received your message and will get back to you within 24
              hours.
            </p>
            <button
              className="mt-6 gradient-btn text-primary-foreground font-label px-8 py-3 font-bold tracking-widest uppercase transition-all"
              onClick={() => handleOpenChange(false)}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dialog-name">Name</Label>
                <Input
                  id="dialog-name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dialog-email">Email</Label>
                <Input
                  id="dialog-email"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dialog-company">Company (optional)</Label>
              <Input
                id="dialog-company"
                placeholder="Your company name"
                value={form.company}
                onChange={(e) =>
                  setForm({ ...form, company: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Service</Label>
              <Select
                value={form.service}
                onValueChange={(value) =>
                  setForm({ ...form, service: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Custom Website</SelectItem>
                  <SelectItem value="web-app">Web Application</SelectItem>
                  <SelectItem value="voice-ai">Voice AI Agent</SelectItem>
                  <SelectItem value="chat-ai">Chat AI Agent</SelectItem>
                  <SelectItem value="ai-assistant">AI Assistant</SelectItem>
                  <SelectItem value="ai-automation">AI Automation</SelectItem>
                  <SelectItem value="other">Other / Not Sure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dialog-description">Project Description</Label>
              <Textarea
                id="dialog-description"
                rows={4}
                placeholder="Tell us about your project, goals, and any specific requirements..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Budget Range</Label>
              <Select
                value={form.budget}
                onValueChange={(value) =>
                  setForm({ ...form, budget: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-5k">Under $5,000</SelectItem>
                  <SelectItem value="5k-15k">$5,000 - $15,000</SelectItem>
                  <SelectItem value="15k-50k">$15,000 - $50,000</SelectItem>
                  <SelectItem value="50k-plus">$50,000+</SelectItem>
                  <SelectItem value="not-sure">Not sure yet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full gradient-btn text-primary-foreground font-label py-4 font-bold tracking-[0.2em] uppercase transition-all hover:shadow-[0_0_40px_rgba(212,206,187,0.3)] disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Message'}
              {!submitting && <ArrowRight className="w-4 h-4 ml-2 inline" />}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
