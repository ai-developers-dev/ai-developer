import { useState, useRef, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronDown, Menu, X } from 'lucide-react'
import { GetStartedDialog } from '@/components/get-started-dialog'
import { Logo, LogoMark } from '@/components/layout/logo'

const services = [
  { label: 'Custom CRM', href: '/services/custom-crm' },
  { label: 'Custom Websites', href: '/services/websites' },
  { label: 'Web Applications', href: '/services/web-apps' },
  { label: 'Voice AI Agents', href: '/services/voice-ai' },
  { label: 'Chat AI Agents', href: '/services/chat-ai' },
  { label: 'AI Assistants', href: '/services/ai-assistants' },
  { label: 'AI Automations', href: '/services/ai-automations' },
  { label: 'SEO', href: '/services/seo' },
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

  // Expertise opens on hover. The close is delayed so travelling from the
  // trigger down to the panel doesn't snap it shut mid-move.
  const openExpertise = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
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
              {expertiseOpen && (
                // The outer wrapper's pt-2 is a transparent bridge across the
                // gap below the trigger, so the pointer never leaves the
                // hoverable area on its way to the panel.
                <div className="absolute top-full -left-4 z-[60] pt-2">
                  <div className="flex min-w-[230px] flex-col border border-white/[0.14] bg-[#0B0B0B]/80 py-2 backdrop-blur-xl">
                    {services.map((service) => (
                      <Link
                        key={service.href}
                        to={service.href}
                        onClick={() => setExpertiseOpen(false)}
                        className="px-[18px] py-2.5 text-sm text-white/85 hover:bg-white/[0.07] hover:text-white transition-colors duration-200"
                      >
                        {service.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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
