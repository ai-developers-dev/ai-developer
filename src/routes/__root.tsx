import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from '@tanstack/react-router'
import { ClerkProvider, useAuth } from '@clerk/tanstack-react-start'
import { ConvexProvider } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'
import { convex, queryClient } from '@/router'
import { clerkAppearance } from '@/lib/clerk-appearance'

import { Navbar } from '@/components/layout/navbar.js'
import { Footer } from '@/components/layout/footer.js'
// Import the compiled CSS as a string and inline it into the SSR <head>.
// This removes the render-blocking stylesheet request from the critical path,
// so first paint isn't gated on a second round-trip (no external CSS fetch,
// no FOUC — the document arrives fully styled).
import appCss from '../styles.css?inline'

const SITE_URL = 'https://aideveloper.dev'
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/hero-robot.png`
const DEFAULT_TITLE =
  'AI Developer — Custom AI Software & CRMs Built Faster'
const DEFAULT_DESCRIPTION =
  'AI Developer builds custom websites, web apps, voice AI agents, and home service CRMs — owned forever, no monthly SaaS fees.'
// Inter only — the design uses it for everything except the basis33 pixel
// words, and basis33 is self-hosted from /fonts.
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#000000' },
      { title: DEFAULT_TITLE },
      { name: 'description', content: DEFAULT_DESCRIPTION },
      { name: 'robots', content: 'index, follow' },
      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'AI Developer' },
      { property: 'og:title', content: DEFAULT_TITLE },
      { property: 'og:description', content: DEFAULT_DESCRIPTION },
      { property: 'og:image', content: DEFAULT_OG_IMAGE },
      { property: 'og:url', content: SITE_URL },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: DEFAULT_TITLE },
      { name: 'twitter:description', content: DEFAULT_DESCRIPTION },
      { name: 'twitter:image', content: DEFAULT_OG_IMAGE },
    ],
  }),
  component: RootLayout,
  shellComponent: RootDocument,
})

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AI Developer',
  url: SITE_URL,
  logo: `${SITE_URL}/logo512.png`,
  description: DEFAULT_DESCRIPTION,
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'doug@aideveloper.dev',
    contactType: 'sales',
    areaServed: 'US',
    availableLanguage: 'English',
  },
}

const hiddenLayoutPrefixes = ['/dashboard', '/portal', '/sign-in', '/sign-up', '/pay', '/post-login']

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isAppRoute = hiddenLayoutPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  )

  // App routes (dashboard, portal, sign-in/up, pay, post-login) need Clerk-backed
  // Convex auth. We mount Clerk ONLY here so the public marketing pages never load
  // Clerk's third-party cookies or its ~310KB of auth JS — keeping them fast and
  // free of third-party-cookie violations.
  if (isAppRoute) {
    return (
      <ClerkProvider
        publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
        appearance={clerkAppearance}
      >
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <Outlet />
          {/* App-wide toast notifications (e.g. proposal email sent/failed) */}
          <Toaster position="top-center" richColors closeButton theme="dark" />
        </ConvexProviderWithClerk>
      </ClerkProvider>
    )
  }

  // Public marketing pages: plain (unauthenticated) Convex — the contact form and
  // other public mutations/queries still work, no Clerk.
  return (
    <ConvexProvider client={convex}>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </ConvexProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    /* Single dark theme — `dark` is static so existing `dark:` variants keep
       resolving; there is no light mode and no theme toggle. */
    <html lang="en" className="dark">
      <head>
        {/* App CSS inlined into the document — no render-blocking stylesheet request */}
        <style dangerouslySetInnerHTML={{ __html: appCss }} />
        {/* basis33 (pixel type) is self-hosted and tiny — preload so headline
            words don't swap in late. */}
        <link
          rel="preload"
          href="/fonts/basis33.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Favicons — the Arch mark. SVG first for modern browsers, .ico as the
            legacy fallback, apple-touch-icon for iOS home screens. */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16.png" type="image/png" sizes="16x16" />
        <link rel="shortcut icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />
        {/* Early connection to font origins (non-blocking) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Load font CSS without blocking first paint: attach as media="print", flip to "all" once loaded. display=swap keeps text visible in the fallback meanwhile. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href=${JSON.stringify(FONT_HREF)};l.media='print';l.onload=function(){l.media='all'};document.head.appendChild(l);})()` }} />
        <noscript>
          <link rel="stylesheet" href={FONT_HREF} />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
        />
        <HeadContent />
      </head>
      <body className="antialiased">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
