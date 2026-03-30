import { useState } from 'react'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import { CheckCircle } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { FormEvent } from 'react'

export function CTASection() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [service, setService] = useState('Automation Strategy')
  const [submitted, setSubmitted] = useState(false)
  const submitContact = useMutation(api.contactSubmissions.submit)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await submitContact({
        name,
        email,
        service,
        description: `Interested in: ${service}`,
      })
      setSubmitted(true)
      setName('')
      setEmail('')
    } catch {
      // fallback silently
    }
  }

  return (
    <section className="py-32 px-6 md:px-12 max-w-screen-2xl mx-auto">
      <FadeInView>
        <div className="glass-card p-12 md:p-20 relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-tertiary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-40 relative z-10">
            {/* Left: heading */}
            <div>
              <h2 className="font-heading text-5xl md:text-7xl font-bold architectural-outline uppercase mb-8">
                Ready for<br />Optimization?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Schedule a technical discovery session. We'll audit your current
                infrastructure and map out a bespoke AI transformation blueprint.
              </p>
              <div className="flex items-center gap-4 text-brand-tertiary">
                <CheckCircle className="w-5 h-5" />
                <span className="font-label text-xs tracking-widest uppercase">
                  No-commitment technical audit
                </span>
              </div>
            </div>

            {/* Right: form */}
            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-brand-tertiary/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-brand-tertiary" />
                </div>
                <p className="font-heading text-xl font-bold text-foreground">Request Received</p>
                <p className="text-muted-foreground text-sm text-center">
                  We'll be in touch within 24 hours to schedule your audit.
                </p>
              </div>
            ) : (
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="font-label text-[10px] uppercase tracking-widest text-muted-foreground">
                    Entity Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    required
                    className="w-full bg-transparent border-0 border-b-2 border-decoration focus:border-brand-primary focus:ring-0 text-foreground py-3 transition-all placeholder:text-surface-highest font-body outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label text-[10px] uppercase tracking-widest text-muted-foreground">
                    Contact Channel
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. architect@acme.com"
                    required
                    className="w-full bg-transparent border-0 border-b-2 border-decoration focus:border-brand-primary focus:ring-0 text-foreground py-3 transition-all placeholder:text-surface-highest font-body outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label text-[10px] uppercase tracking-widest text-muted-foreground">
                    Primary Objective
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full bg-transparent border-0 border-b-2 border-decoration focus:border-brand-primary focus:ring-0 text-foreground py-3 transition-all outline-none"
                  >
                    <option className="bg-surface">Automation Strategy</option>
                    <option className="bg-surface">Custom AI Application</option>
                    <option className="bg-surface">Intelligent Web Interface</option>
                    <option className="bg-surface">Voice AI Agent</option>
                    <option className="bg-surface">Chat AI Agent</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full gradient-btn text-primary-foreground font-label py-5 font-bold tracking-[0.2em] uppercase transition-all hover:tracking-[0.3em]"
                >
                  Request AI Audit
                </button>
              </form>
            )}
          </div>
        </div>
      </FadeInView>
    </section>
  )
}
