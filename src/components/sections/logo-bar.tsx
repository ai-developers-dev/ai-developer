import { FadeInView } from '@/components/animations/fade-in-view.js'

const logos = [
  'Claude Code',
  'Codex',
  'Gemini',
  'Grok',
  'Antigravity',
  'Cursor',
  'Windsurf',
]

export function LogoBar() {
  return (
    <section className="py-12 md:py-24 px-4 sm:px-6 md:px-12 max-w-screen-2xl mx-auto border-t border-decoration/30 overflow-hidden">
      <FadeInView>
        <p className="font-label text-center text-muted-foreground text-[10px] tracking-[0.4em] uppercase mb-12">
          Trusted by Next-Gen Entities
        </p>
      </FadeInView>
      <FadeInView delay={0.15}>
        <div className="relative">
          <div
            className="flex w-max gap-x-12 md:gap-x-24 justify-center items-center opacity-40 hover:opacity-70 transition-all"
            style={{ animation: 'marquee 25s linear infinite' }}
          >
            {[...logos, ...logos].map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="flex items-center shrink-0"
              >
                <span className="text-xl font-heading font-bold tracking-tighter text-foreground whitespace-nowrap">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </FadeInView>
    </section>
  )
}
