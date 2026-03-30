import { Search, Wrench, Rocket } from 'lucide-react'
import { FadeInView } from '@/components/animations/fade-in-view.js'
import {
  StaggerChildren,
  StaggerItem,
} from '@/components/animations/stagger-children.js'

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Discover & Plan',
    description:
      'We start by understanding your business, goals, and users. Together we define the scope, choose the right technology, and map out a clear project plan.',
  },
  {
    number: '02',
    icon: Wrench,
    title: 'Design & Build',
    description:
      'Our team designs and develops your solution using AI-accelerated workflows. You get regular updates, previews, and feedback opportunities at every stage.',
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Launch & Support',
    description:
      'We deploy to production, run final QA, and hand everything over. Post-launch, we provide ongoing support and iteration.',
  },
]

export function HowItWorks() {
  return (
    <section className="py-16 md:py-32 px-4 sm:px-6 md:px-12 max-w-screen-2xl mx-auto">
      <FadeInView>
        <div className="text-center mb-14">
          <h2 className="font-heading text-2xl sm:text-4xl md:text-6xl font-bold architectural-outline uppercase mb-6">
            Our Process
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A streamlined process that gets your project from idea to launch —
            fast.
          </p>
        </div>
      </FadeInView>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <StaggerItem key={step.number}>
            <div className="glass-card p-10 h-full group transition-all duration-500">
              <span className="font-label text-brand-tertiary text-xs tracking-widest uppercase mb-8 block">
                Step {step.number}
              </span>
              <div className="w-12 h-12 rounded-sm flex items-center justify-center mb-6 bg-surface-high group-hover:bg-surface-highest transition-colors">
                <step.icon className="w-6 h-6 text-brand-tertiary" strokeWidth={1.5} />
              </div>
              <h3 className="font-heading text-xl font-semibold text-brand-primary mb-3 uppercase tracking-tight">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </section>
  )
}
