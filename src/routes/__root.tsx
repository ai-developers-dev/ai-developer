import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from '@tanstack/react-router'
import { ClerkProvider, useAuth } from '@clerk/tanstack-react-start'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { convex, queryClient } from '@/router'

import { Navbar } from '@/components/layout/navbar.js'
import { Footer } from '@/components/layout/footer.js'
import appCss from '../styles.css?url'

const SITE_URL = 'https://aideveloper.dev'
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/hero-robot.png`
const DEFAULT_TITLE =
  'AI Developer — Custom AI Software & CRMs Built Faster'
const DEFAULT_DESCRIPTION =
  'AI Developer builds custom websites, web apps, voice AI agents, and home service CRMs — owned forever, no monthly SaaS fees.'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#1c1110' },
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
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=Manrope:wght@300;400;500;600&display=swap',
      },
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
  const hideNavFooter = hiddenLayoutPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  )

  if (hideNavFooter) {
    return <Outlet />
  }

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');var d=t==='dark'||!t;if(d)document.documentElement.classList.add('dark')})()` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
        />
        <HeadContent />
      </head>
      <body className="antialiased">
        <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                {children}
              </TooltipProvider>
            </QueryClientProvider>
          </ConvexProviderWithClerk>
        </ClerkProvider>
        <Scripts />
      </body>
    </html>
  )
}
