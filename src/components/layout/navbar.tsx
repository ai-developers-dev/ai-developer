import { useState, useRef, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Bot,
  ChevronDown,
  Code2,
  Globe,
  Menu,
  MessageSquare,
  Radar,
  Users,
  Waypoints,
  X,
  Zap,
} from 'lucide-react'
import { GetStartedDialog } from '@/components/get-started-dialog'
import { Logo, LogoMark } from '@/components/layout/logo'

const services = [
  {
    label: 'Custom CRM',
    href: '/services/custom-crm',
    desc: 'Built for how your trade runs',
    icon: Users,
  },
  {
    label: 'Custom Websites',
    href: '/services/websites',
    desc: 'Fast sites that convert',
    icon: Globe,
  },
  {
    label: 'Web Applications',
    href: '/services/web-apps',
    desc: 'Full-stack builds you own',
    icon: Code2,
  },
  {
    label: 'Voice AI Agents',
    href: '/services/voice-ai',
    desc: 'Answers calls 24/7',
    icon: Waypoints,
  },
  {
    label: 'Chat AI Agents',
    href: '/services/chat-ai',
    desc: 'Qualifies leads on your site',
    icon: MessageSquare,
  },
  {
    label: 'AI Assistants',
    href: '/services/ai-assistants',
    desc: 'Works alongside your team',
    icon: Bot,
  },
  {
    label: 'AI Automations',
    href: '/services/ai-automations',
    desc: 'Kills the busywork',
    icon: Zap,
  },
  {
    label: 'SEO',
    href: '/services/seo',
    desc: 'Local + national search',
    icon: Radar,
  },
]

// NOTE: /courses is deliberately unlisted until its real prices are set —
// the page still exists at its URL. Re-add { label: 'COURSES', to: '/courses',
// delay: 100 } here (and the desktop link + footer entry) to relist it.
const mobileLinks = [
  { label: 'ABOUT', to: '/about', delay: 160 },
  { label: 'CONTACT', to: '/contact', delay: 220 },
  { label: 'SIGN IN', to: '/sign-in/$', delay: 280 },
]

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [expertiseOpen, setExpertiseOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const expertiseRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Transparent over the hero, translucent black once the page moves under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Where to pin the dropdown. It renders OUTSIDE <nav> (see the panel's own
  // comment), so it needs the trigger's viewport position rather than CSS
  // `absolute` positioning.
  const [panelPos, setPanelPos] = useState({ left: 0, top: 0 })
  const measurePanel = () => {
    const el = expertiseRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const width = Math.min(600, window.innerWidth - 32)
    const half = width / 2
    // Clamp the centre so a 600px panel can't hang off either edge.
    const centre = Math.min(
      Math.max(r.left + r.width / 2, 16 + half),
      window.innerWidth - 16 - half,
    )
    setPanelPos({ left: centre, top: r.bottom })
  }

  // Expertise opens on hover. The close is delayed so travelling from the
  // trigger down to the panel doesn't snap it shut mid-move.
  const openExpertise = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    measurePanel()
    setExpertiseOpen(true)
  }
  const closeExpertise = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setExpertiseOpen(false), 160)
  }
  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  // Escape closes it (hover menus still need a keyboard way out)
  useEffect(() => {
    if (!expertiseOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpertiseOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [expertiseOpen])

  // Lock body scroll while the mobile overlay is open
  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 side-pad transition-colors duration-200 ${
          scrolled
            ? 'bg-black/80 backdrop-blur-xl border-b border-white/10'
            : 'bg-transparent'
        }`}
      >
        <div className="flex items-center justify-between pt-6 pb-5">
          <Link to="/" aria-label="AI Developer — home">
            <Logo />
          </Link>

          {/* Desktop nav */}
          {/* Desktop nav survives down to ~768px, but the logo and links start
              crowding below 840px (28px gap at 840, 10px at 800, touching at
              768). 840 is the last comfortable width — keep both this and the
              hamburger's min-[840px]:hidden in sync if you retune it. */}
          <div className="hidden min-[840px]:flex items-center gap-8 text-sm tracking-[0.025em]">
            <div
              className="relative"
              ref={expertiseRef}
              onMouseEnter={openExpertise}
              onMouseLeave={closeExpertise}
              onFocus={openExpertise}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setExpertiseOpen(false)
                }
              }}
            >
              <button
                type="button"
                // Hover drives this on desktop; the click toggle stays so touch
                // and keyboard users can still open it.
                onClick={() => setExpertiseOpen((o) => !o)}
                aria-expanded={expertiseOpen}
                aria-haspopup="true"
                className="flex items-center gap-1.5 text-white hover:opacity-70 transition-opacity duration-200"
              >
                Expertise
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    expertiseOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            <Link
              to="/about"
              className="text-white hover:opacity-70 transition-opacity duration-200"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-white hover:opacity-70 transition-opacity duration-200"
            >
              Contact
            </Link>
            <Link
              to="/sign-in/$"
              className="text-white hover:opacity-70 transition-opacity duration-200"
            >
              Sign In
            </Link>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="border border-white/30 bg-white/5 px-5 py-2.5 text-[13px] font-bold tracking-[0.1em] text-white hover:bg-white/[0.12] transition-colors duration-200"
            >
              START_PROJECT
            </button>
          </div>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="min-[840px]:hidden p-2 text-white hover:opacity-70 transition-opacity duration-200"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Expertise panel — deliberately rendered OUTSIDE <nav>.
          Once scrolled, the nav carries its own backdrop-filter, which makes it
          a backdrop root: a descendant's backdrop-filter can then only sample
          what's painted inside the nav, so the panel's blur silently did
          nothing and the page showed through unblurred. As a sibling it samples
          the page directly. Cost: it can't use CSS `absolute` off the trigger,
          hence the measured fixed position. */}
      {expertiseOpen && (
        <div
          className="fixed z-[60] -translate-x-1/2 pt-2"
          style={{ left: panelPos.left, top: panelPos.top }}
          onMouseEnter={openExpertise}
          onMouseLeave={closeExpertise}
        >
          {/* Deliberately see-through — you should be able to read the hero
              through it. */}
          <div className="w-[600px] max-w-[calc(100vw-2rem)] border border-white/[0.14] bg-[#0B0B0B]/60 backdrop-blur-3xl">
            <div className="grid grid-cols-2 gap-1 p-3">
              {services.map((service) => (
                <Link
                  key={service.href}
                  to={service.href}
                  onClick={() => setExpertiseOpen(false)}
                  className="group flex items-center gap-3 p-3 transition-colors duration-200 hover:bg-white/[0.05]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 bg-white/[0.03] transition-colors duration-200 group-hover:border-[#EF6A00]/60 group-hover:bg-[#EF6A00]/10">
                    <service.icon className="h-4 w-4 text-[#EF6A00]" strokeWidth={1.5} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-white/90 group-hover:text-white">
                      {service.label}
                    </span>
                    <span className="block truncate text-xs text-white/45">
                      {service.desc}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-white/10 px-6 py-3">
              <span className="eyebrow text-[11px]">All expertise</span>
              <Link
                to="/about"
                onClick={() => setExpertiseOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs text-[#EF6A00] transition-colors duration-200 hover:text-[#FF8A2B]"
              >
                How we work
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile fullscreen overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[70] flex flex-col bg-black/95 backdrop-blur-xl"
          style={{ animation: 'overlay-in 500ms cubic-bezier(0.16,1,0.3,1) both' }}
        >
          <div className="flex items-center justify-between p-6">
            <span className="flex items-center gap-3">
              <LogoMark />
              <span className="text-[13px] font-bold tracking-[0.16em] text-white">
                AI_DEVELOPER
              </span>
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="p-2 text-white hover:opacity-70 transition-opacity duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col items-center justify-center gap-8">
            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="text-2xl tracking-[0.1em] text-white"
              style={{
                animation: 'link-in 500ms cubic-bezier(0.16,1,0.3,1) 40ms both',
              }}
            >
              EXPERTISE
            </Link>
            {mobileLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="text-2xl tracking-[0.1em] text-white"
                style={{
                  animation: `link-in 500ms cubic-bezier(0.16,1,0.3,1) ${link.delay}ms both`,
                }}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                setDialogOpen(true)
              }}
              className="text-2xl tracking-[0.1em] text-white"
              style={{
                animation: 'link-in 500ms cubic-bezier(0.16,1,0.3,1) 340ms both',
              }}
            >
              START_PROJECT
            </button>
          </nav>
        </div>
      )}

      <GetStartedDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
