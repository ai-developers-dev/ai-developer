import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { SignedIn, SignedOut } from '@clerk/tanstack-react-start'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import {
  Menu,
  X,
  Globe,
  Code,
  Phone,
  MessageSquare,
  Brain,
  Zap,
  ChevronDown,
  LayoutDashboard,
  LogIn,
} from 'lucide-react'
import { GetStartedDialog } from '@/components/get-started-dialog'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useRef, useEffect } from 'react'

const services = [
  {
    icon: Globe,
    label: 'Websites',
    href: '/services/websites',
    description: 'Custom sites that convert',
  },
  {
    icon: Code,
    label: 'Web Apps',
    href: '/services/web-apps',
    description: 'Full-stack applications',
  },
  {
    icon: Phone,
    label: 'Voice AI Agents',
    href: '/services/voice-ai',
    description: 'AI that handles calls 24/7',
  },
  {
    icon: MessageSquare,
    label: 'Chat AI Agents',
    href: '/services/chat-ai',
    description: 'Chatbots for sales & support',
  },
  {
    icon: Brain,
    label: 'AI Assistants',
    href: '/services/ai-assistants',
    description: 'AI working alongside your team',
  },
  {
    icon: Zap,
    label: 'AI Automations',
    href: '/services/ai-automations',
    description: 'Automate repetitive workflows',
  },
]

function AuthDashboardLink() {
  const currentUser = useQuery(api.users.getCurrent)
  const dashboardPath = currentUser?.role === 'admin' ? '/dashboard' : '/portal'
  const label = currentUser?.role === 'admin' ? 'Dashboard' : 'Portal'

  return (
    <Button asChild variant="ghost" size="sm" className="text-nav-text hover:text-nav-text-hover">
      <Link to={dashboardPath} className="flex items-center gap-1.5">
        <LayoutDashboard className="w-4 h-4" />
        {label}
      </Link>
    </Button>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [expertiseOpen, setExpertiseOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })

  // Position dropdown below trigger
  useEffect(() => {
    if (expertiseOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownPos({ top: rect.bottom + 8, left: rect.left })
    }
  }, [expertiseOpen])

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      ) return
      setExpertiseOpen(false)
    }
    if (expertiseOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [expertiseOpen])

  // Close on scroll/resize
  useEffect(() => {
    if (!expertiseOpen) return
    const close = () => setExpertiseOpen(false)
    window.addEventListener('scroll', close, { passive: true })
    window.addEventListener('resize', close)
    return () => { window.removeEventListener('scroll', close); window.removeEventListener('resize', close) }
  }, [expertiseOpen])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-md border-b border-subtle-border shadow-sm dark:shadow-[0_8px_32px_rgba(28,17,16,0.5)]">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tighter text-foreground font-heading">
              AI_DEVELOPER
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Expertise trigger */}
            <button
              ref={triggerRef}
              onClick={() => setExpertiseOpen(!expertiseOpen)}
              className="inline-flex items-center gap-1 font-label uppercase tracking-[0.2em] text-xs text-nav-text/60 hover:text-nav-text-hover transition-colors py-2"
            >
              Expertise
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${expertiseOpen ? 'rotate-180' : ''}`} />
            </button>

            <Link
              to="/about"
              className="font-label uppercase tracking-[0.2em] text-xs text-nav-text/60 hover:text-nav-text-hover transition-colors py-2"
            >
              Process
            </Link>

            <Link
              to="/contact"
              className="font-label uppercase tracking-[0.2em] text-xs text-nav-text/60 hover:text-nav-text-hover transition-colors py-2"
            >
              Contact
            </Link>
          </div>

          {/* Desktop CTA + Auth */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <SignedIn>
              <AuthDashboardLink />
            </SignedIn>
            <SignedOut>
              <Button asChild variant="ghost" size="sm" className="text-nav-text/60 hover:text-nav-text-hover">
                <Link to="/sign-in/$" className="flex items-center gap-1.5">
                  <LogIn className="w-4 h-4" />
                  <span className="font-label uppercase tracking-[0.2em] text-xs">Sign In</span>
                </Link>
              </Button>
            </SignedOut>
            <button
              className="gradient-btn font-label text-xs tracking-[0.2em] font-bold py-2 px-6 rounded-sm transition-all uppercase"
              onClick={() => setDialogOpen(true)}
            >
              START_PROJECT
            </button>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center gap-1">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-nav-text">
                  {open ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-card border-subtle-border">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-foreground font-heading">
                    AI_DEVELOPER
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-1 mt-8">
                  <button
                    onClick={() => setServicesOpen(!servicesOpen)}
                    className="flex items-center justify-between font-label uppercase tracking-[0.2em] text-xs text-nav-text hover:text-brand-tertiary transition-colors px-2 py-2 rounded-sm"
                  >
                    Expertise
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {servicesOpen && (
                    <div className="flex flex-col gap-1 pl-2 mb-2">
                      {services.map((service) => (
                        <Link
                          key={service.href}
                          to={service.href}
                          className="flex items-center gap-2.5 text-sm text-nav-text/60 hover:text-brand-tertiary transition-colors px-2 py-1.5 rounded-sm"
                          onClick={() => setOpen(false)}
                        >
                          <service.icon className="w-4 h-4 text-brand-tertiary shrink-0" />
                          {service.label}
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link
                    to="/about"
                    className="font-label uppercase tracking-[0.2em] text-xs text-nav-text hover:text-brand-tertiary transition-colors px-2 py-2"
                    onClick={() => setOpen(false)}
                  >
                    Process
                  </Link>

                  <Link
                    to="/contact"
                    className="font-label uppercase tracking-[0.2em] text-xs text-nav-text hover:text-brand-tertiary transition-colors px-2 py-2"
                    onClick={() => setOpen(false)}
                  >
                    Contact
                  </Link>

                  <SignedIn>
                    <AuthDashboardLink />
                  </SignedIn>
                  <SignedOut>
                    <Link
                      to="/sign-in/$"
                      className="flex items-center gap-2 font-label uppercase tracking-[0.2em] text-xs text-nav-text hover:text-brand-tertiary transition-colors px-2 py-2"
                      onClick={() => setOpen(false)}
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Link>
                  </SignedOut>

                  <button
                    className="mt-4 gradient-btn font-label text-xs tracking-[0.2em] font-bold py-3 px-6 rounded-sm uppercase w-full"
                    onClick={() => {
                      setOpen(false)
                      setDialogOpen(true)
                    }}
                  >
                    START_PROJECT
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <GetStartedDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* Expertise dropdown — fixed position, outside nav overflow context */}
      {expertiseOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-[100] glass-card p-4 xl:p-6 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: `min(calc(100vw - 2rem), 640px)`,
            maxWidth: `calc(100vw - ${dropdownPos.left}px - 1rem)`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-nav-text/50">
              Our Expertise
            </p>
            <Link
              to="/about"
              onClick={() => setExpertiseOpen(false)}
              className="font-label text-[10px] uppercase tracking-[0.2em] text-brand-tertiary hover:text-brand-tertiary/80 transition-colors"
            >
              View All →
            </Link>
          </div>
          <ul className="grid grid-cols-2 xl:grid-cols-3 gap-1">
            {services.map((service) => (
              <li key={service.href}>
                <Link
                  to={service.href}
                  onClick={() => setExpertiseOpen(false)}
                  className="flex items-center gap-3 rounded-sm p-3 hover:bg-secondary/50 transition-all duration-200 group"
                >
                  <div className="w-9 h-9 rounded-sm bg-surface-high/50 flex items-center justify-center group-hover:bg-brand-tertiary/10 transition-colors shrink-0">
                    <service.icon className="w-4 h-4 text-brand-tertiary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-xs xl:text-sm font-heading font-semibold text-foreground">
                      {service.label}
                    </div>
                    <p className="text-[10px] xl:text-xs text-nav-text/60 leading-snug">
                      {service.description}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
