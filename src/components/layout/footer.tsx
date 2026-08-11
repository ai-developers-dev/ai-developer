import { Link } from '@tanstack/react-router'
import { Logo } from '@/components/layout/logo'

const footerLinks = {
  Services: [
    { label: 'Custom CRM', href: '/services/custom-crm' },
    { label: 'CRM for Electricians', href: '/services/custom-crm/electricians' },
    { label: 'CRM for Plumbers', href: '/services/custom-crm/plumbers' },
    { label: 'CRM for HVAC', href: '/services/custom-crm/hvac' },
    { label: 'Custom Websites', href: '/services/websites' },
    { label: 'Web Applications', href: '/services/web-apps' },
    { label: 'Voice AI Agents', href: '/services/voice-ai' },
    { label: 'Chat AI Agents', href: '/services/chat-ai' },
    { label: 'AI Assistants', href: '/services/ai-assistants' },
    { label: 'AI Automations', href: '/services/ai-automations' },
    { label: 'SEO Services', href: '/services/seo' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
  Resources: [
    { label: 'Courses', href: '/courses' },
    { label: 'Early Access', href: '/early-access' },
    { label: 'Blog', href: '/blog' },
    { label: 'Case Studies', href: '/case-studies' },
  ],
}

const socials = [
  {
    label: 'Facebook',
    path: 'M13.5 21v-7.5h2.5l.5-3h-3V8.6c0-.9.3-1.6 1.7-1.6H16.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.4H8v3h2.5V21h3z',
    size: 15,
  },
  {
    label: 'X',
    path: 'M17.8 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.2 21H2.1l7.3-8.3L2 3h6.4l4.4 5.9L17.8 3zm-1.1 16.2h1.7L7.5 4.7H5.7l11 14.5z',
    size: 14,
  },
  {
    label: 'LinkedIn',
    path: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm6.5 0H13.3v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.2 8.65 22 11.1 22 14.3V21h-4v-5.9c0-1.4-.03-3.2-2-3.2s-2.3 1.5-2.3 3.1V21h-4.2V9z',
    size: 15,
  },
]

export function Footer() {
  return (
    <footer className="border-t border-white/10 pt-16 side-pad">
      <div className="mx-auto max-w-[1320px] grid grid-cols-1 md:grid-cols-[1.3fr_1fr_0.8fr_0.8fr] gap-8 md:gap-[clamp(32px,4vw,64px)]">
        {/* Brand */}
        <div>
          <Logo size={24} />
          <p className="mt-[18px] max-w-[300px] text-sm leading-[1.65] text-white/60">
            Engineering bespoke AI solutions and web experiences for the modern
            enterprise. Precision-crafted, neural-powered.
          </p>
          <div className="mt-5 flex gap-3.5">
            {socials.map((social) => (
              <a
                key={social.label}
                href="#"
                aria-label={social.label}
                className="flex h-[34px] w-[34px] items-center justify-center border border-white/20 text-white/70 hover:border-white hover:text-white transition-colors duration-200"
              >
                <svg
                  width={social.size}
                  height={social.size}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <div className="eyebrow mb-4 text-[13px]">{title}</div>
            <div className="grid gap-2.5 text-sm">
              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-white/70 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 flex max-w-[1320px] flex-wrap items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-white/50">
        <div className="tracking-[0.08em]">
          © {new Date().getFullYear()} AI DEVELOPER. ENGINEERED FOR PRECISION.
        </div>
        <Link
          to="/about"
          className="text-white/50 hover:text-white transition-colors duration-200"
        >
          Founded by Doug Allen
        </Link>
      </div>
    </footer>
  )
}
