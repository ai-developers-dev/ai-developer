import { Globe, Code, Phone, MessageSquare, Brain, Zap } from 'lucide-react'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

const services = [
  {
    icon: Globe,
    title: 'Custom Websites',
    href: '/services/websites',
    description:
      'High-performance, responsive websites designed to convert visitors into customers. SEO-optimized and built to last.',
  },
  {
    icon: Code,
    title: 'Web Applications',
    href: '/services/web-apps',
    description:
      'Full-stack web apps with real-time features, authentication, dashboards, and the integrations your business demands.',
  },
  {
    icon: Phone,
    title: 'Voice AI Agents',
    href: '/services/voice-ai',
    description:
      'AI-powered phone agents that answer calls, book appointments, qualify leads, and handle inquiries 24/7.',
  },
  {
    icon: MessageSquare,
    title: 'Chat AI Agents',
    href: '/services/chat-ai',
    description:
      'Intelligent chatbots on your website, SMS, or social channels — handling support and sales around the clock.',
  },
  {
    icon: Brain,
    title: 'AI Assistants',
    href: '/services/ai-assistants',
    description:
      'Custom AI assistants that summarize data, draft documents, and accelerate decisions across your organization.',
  },
  {
    icon: Zap,
    title: 'AI Automations',
    href: '/services/ai-automations',
    description:
      'Automate repetitive workflows — from lead routing and data entry to report generation and email sequences.',
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-32 px-6 md:px-12 max-w-screen-2xl mx-auto">
      <FadeInView>
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="max-w-xl">
            <h2 className="font-heading text-4xl md:text-6xl font-bold architectural-outline uppercase mb-6">
              Our Specializations
            </h2>
            <p className="text-muted-foreground">
              Modular AI architecture designed to scale with your operational complexity.
            </p>
          </div>
          <div className="h-px w-full md:w-1/3 bg-decoration hidden md:block mb-4" />
        </div>
      </FadeInView>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, i) => (
          <FadeInView key={service.title} delay={i * 0.08}>
            <Link to={service.href} className="block h-full">
              <div className="glass-card p-10 flex flex-col h-full group transition-all duration-500">
                <div className="mb-12">
                  <service.icon className="w-9 h-9 text-brand-tertiary" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-2xl font-bold text-brand-primary mb-6 uppercase tracking-tight">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-10 flex-grow">
                  {service.description}
                </p>
                <span className="font-label text-xs tracking-widest text-brand-secondary flex items-center gap-2 group-hover:gap-4 transition-all uppercase">
                  View Specification <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </FadeInView>
        ))}
      </div>
    </section>
  )
}
