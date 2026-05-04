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

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'AI Developer — Websites, Apps & AI Solutions Built Faster' },
      {
        name: 'description',
        content:
          'AI Developer builds custom websites, web apps, voice AI agents, chat AI agents, AI assistants, and AI automations — faster and cheaper with AI.',
      },
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
