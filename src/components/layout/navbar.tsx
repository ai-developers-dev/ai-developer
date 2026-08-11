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

const mobileLinks = [
  { label: 'COURSES', to: '/courses', delay: 100 },
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

  // Transparent over the hero, solid black once the page moves under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Click-outside closes the Expertise dropdown
  useEffect(() => {
    if (!expertiseOpen) return
    const onDown = (e: MouseEvent) => {
      if (!expertiseRef.current?.contains(e.target as Node)) setExpertiseOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
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
          scrolled ? 'bg-black border-b border-white/10' : 'bg-transparent'
        }`}
      >
        <div className="flex items-center justify-between pt-6 pb-5">
          <Link to="/" aria-label="AI Developer — home">
            <Logo />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8 text-sm tracking-[0.025em]">
            <div className="relative" ref={expertiseRef}>
              <button
                type="button"
                onClick={() => setExpertiseOpen((o) => !o)}
                aria-expanded={expertiseOpen}
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
                <div className="absolute top-8 -left-4 z-[60] min-w-[230px] bg-[#0B0B0B] border border-white/[0.14] py-2 flex flex-col">
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
              )}
            </div>

            <Link
              to="/courses"
              className="text-white hover:opacity-70 transition-opacity duration-200"
            >
              Courses
            </Link>
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
            className="lg:hidden p-2 text-white hover:opacity-70 transition-opacity duration-200"
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
