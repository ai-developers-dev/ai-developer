import { FadeInView } from '@/components/animations/fade-in-view.js'

interface PageHeaderProps {
  badge: string
  title: string
  highlightWord: string
  description: string
}

export function PageHeader({
  badge,
  title,
  highlightWord,
  description,
}: PageHeaderProps) {
  // Split on the FIRST occurrence only and keep the remainder, so a highlight
  // word that also appears later in the title doesn't truncate the headline.
  const at = title.indexOf(highlightWord)
  const before = at === -1 ? title : title.slice(0, at)
  const after = at === -1 ? '' : title.slice(at + highlightWord.length)

  return (
    <section className="relative overflow-hidden pt-32 pb-16 side-pad">
      {/* Ambient orange glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 top-0 h-[420px] w-[620px] max-w-full -translate-x-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(239,106,0,0.12) 0%, rgba(239,106,0,0) 70%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-[1320px]">
        <FadeInView>
          <div className="eyebrow">{badge}</div>
        </FadeInView>

        <FadeInView delay={0.1}>
          <h1 className="display-h2 mt-5 max-w-[900px]">
            {before}
            {at !== -1 && <span className="pixel-word">{highlightWord}</span>}
            {after}
          </h1>
        </FadeInView>

        <FadeInView delay={0.2}>
          <p className="mt-6 max-w-[620px] text-base leading-[1.65] text-white/60">
            {description}
          </p>
        </FadeInView>
      </div>
    </section>
  )
}
