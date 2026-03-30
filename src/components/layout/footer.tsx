import { Link } from '@tanstack/react-router'
import { Github, Twitter, Linkedin } from 'lucide-react'

const footerLinks = {
  Services: [
    { label: 'Custom Websites', href: '/services/websites' },
    { label: 'Web Applications', href: '/services/web-apps' },
    { label: 'Voice AI Agents', href: '/services/voice-ai' },
    { label: 'Chat AI Agents', href: '/services/chat-ai' },
    { label: 'AI Assistants', href: '/services/ai-assistants' },
    { label: 'AI Automations', href: '/services/ai-automations' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
  Resources: [
    { label: 'Blog', href: '/blog' },
    { label: 'Case Studies', href: '/case-studies' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-surface-low w-full py-16 px-6 md:px-12 mt-20">
      <div className="max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="font-heading text-lg text-foreground font-bold mb-6">
              AI_DEVELOPER
            </div>
            <p className="font-label text-[10px] tracking-[0.2em] uppercase font-light text-nav-text/50 mb-8 max-w-xs leading-relaxed">
              Engineering bespoke AI solutions and web experiences for the modern enterprise. Precision-crafted, neural-powered.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-nav-text/40 hover:text-brand-secondary transition-colors duration-300"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="text-nav-text/40 hover:text-brand-secondary transition-colors duration-300"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="text-nav-text/40 hover:text-brand-secondary transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-label text-[10px] tracking-[0.3em] uppercase font-semibold text-nav-text/80 mb-6">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="font-label text-[10px] tracking-[0.2em] uppercase font-light text-nav-text/50 hover:text-brand-secondary transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8">
          <p className="font-label text-[10px] tracking-[0.2em] uppercase font-light text-brand-tertiary/80 hover:text-brand-tertiary transition-opacity">
            &copy; {new Date().getFullYear()} AI DEVELOPER. ENGINEERED FOR PRECISION.
          </p>
        </div>
      </div>
    </footer>
  )
}
