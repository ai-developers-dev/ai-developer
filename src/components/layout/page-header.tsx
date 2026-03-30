import { FadeInView } from '@/components/animations/fade-in-view.js'

interface PageHeaderProps {
  badge: string
  title: string
  highlightWord: string
  description: string
}

export function PageHeader({ badge, title, highlightWord, description }: PageHeaderProps) {
  const parts = title.split(highlightWord)

  return (
    <section className="relative pt-28 pb-16 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-tertiary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-brand-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeInView>
          <span className="font-label text-brand-tertiary tracking-[0.3em] uppercase text-xs mb-6 inline-block">
            {badge}
          </span>
        </FadeInView>

        <FadeInView delay={0.1}>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            {parts[0]}
            <span className="bg-gradient-to-r from-brand-primary to-brand-tertiary bg-clip-text text-transparent">
              {highlightWord}
            </span>
            {parts[1]}
          </h1>
        </FadeInView>

        <FadeInView delay={0.2}>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </FadeInView>
      </div>
    </section>
  )
}
