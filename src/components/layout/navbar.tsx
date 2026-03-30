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
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

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
          <div className="hidden md:flex items-center gap-8">
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent font-label uppercase tracking-[0.2em] text-xs text-nav-text/60 hover:text-nav-text-hover data-[state=open]:text-nav-text-hover">
                    Expertise
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-180 glass-card p-6">
                      <div className="flex items-center justify-between mb-5">
                        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-nav-text/50">
                          Our Expertise
                        </p>
                        <Link to="/about" className="font-label text-[10px] uppercase tracking-[0.2em] text-brand-tertiary hover:text-brand-tertiary/80 transition-colors">
                          View All →
                        </Link>
                      </div>
                      <ul className="grid grid-cols-3 gap-2">
                        {services.map((service) => (
                          <li key={service.href}>
                            <NavigationMenuLink asChild>
                              <Link
                                to={service.href}
                                className="flex flex-col gap-3 rounded-sm p-4 hover:bg-secondary/50 transition-all duration-300 group h-full"
                              >
                                <div className="w-10 h-10 rounded-sm bg-surface-high/50 flex items-center justify-center group-hover:bg-brand-tertiary/10 transition-colors">
                                  <service.icon className="w-5 h-5 text-brand-tertiary" strokeWidth={1.5} />
                                </div>
                                <div>
                                  <div className="text-sm font-heading font-semibold text-foreground mb-1">
                                    {service.label}
                                  </div>
                                  <p className="text-xs text-nav-text/60 leading-relaxed">
                                    {service.description}
                                  </p>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/about"
                      className={navigationMenuTriggerStyle() + ' bg-transparent font-label uppercase tracking-[0.2em] text-xs text-nav-text/60 hover:text-nav-text-hover'}
                    >
                      Process
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/contact"
                      className={navigationMenuTriggerStyle() + ' bg-transparent font-label uppercase tracking-[0.2em] text-xs text-nav-text/60 hover:text-nav-text-hover'}
                    >
                      Contact
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Desktop CTA + Auth */}
          <div className="hidden md:flex items-center gap-3">
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
          <div className="md:hidden flex items-center gap-1">
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
    </nav>
  )
}
