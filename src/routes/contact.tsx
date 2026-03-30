import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { PageHeader } from '@/components/layout/page-header.js'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { ArrowRight, CheckCircle2, Clock, Mail, Rocket } from 'lucide-react'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: 'Contact AI Developer — Get a Free Quote' },
      {
        name: 'description',
        content:
          'Get in touch with AI Developer for a free project quote. We respond within 24 hours and most projects kick off within one week.',
      },
    ],
  }),
})

function ContactPage() {
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
    <>
      <PageHeader
        badge="Get In Touch"
        title="Let's Build Something Together"
        highlightWord="Together"
        description="Tell us about your project and we'll get back to you within 24 hours with a free quote."
      />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <FadeInView>
                <Card className="border-subtle-border">
                  <CardContent className="pt-6">
                    {submitted ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-brand-tertiary/10 flex items-center justify-center mb-6">
                          <CheckCircle2 className="w-8 h-8 text-brand-tertiary" />
                        </div>
                        <h3
                          className="text-2xl font-bold text-foreground mb-3"

                        >
                          Thank you!
                        </h3>
                        <p className="text-muted-foreground max-w-md">
                          We've received your message and will get back to you within
                          24 hours.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              placeholder="Your name"
                              value={form.name}
                              onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
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
                          <Label htmlFor="company">Company (optional)</Label>
                          <Input
                            id="company"
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
                          <Label htmlFor="description">Project Description</Label>
                          <Textarea
                            id="description"
                            rows={5}
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

                        <Button
                          type="submit"
                          size="lg"
                          disabled={submitting}
                          className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white h-12 text-base font-semibold"
                        >
                          {submitting ? 'Sending...' : 'Send Message'}
                          {!submitting && <ArrowRight className="w-4 h-4 ml-1" />}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </FadeInView>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <FadeInView delay={0.1}>
                <Card className="border-subtle-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-surface-low flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-brand-primary" />
                      </div>
                      <div>
                        <h3
                          className="font-semibold text-foreground mb-1"

                        >
                          Response Time
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          We respond within 24 hours.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeInView>

              <FadeInView delay={0.2}>
                <Card className="border-subtle-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-surface-low flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-brand-primary" />
                      </div>
                      <div>
                        <h3
                          className="font-semibold text-foreground mb-1"

                        >
                          Email
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          hello@aideveloper.com
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeInView>

              <FadeInView delay={0.3}>
                <Card className="border-subtle-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-surface-low flex items-center justify-center shrink-0">
                        <Rocket className="w-5 h-5 text-brand-primary" />
                      </div>
                      <div>
                        <h3
                          className="font-semibold text-foreground mb-1"

                        >
                          Quick Start
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Most projects kick off within one week of our initial
                          conversation.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeInView>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
