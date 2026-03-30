import { createFileRoute, Outlet } from '@tanstack/react-router'
import { PortalLayout } from '@/components/layout/portal-layout'

export const Route = createFileRoute('/portal')({
  component: PortalLayoutRoute,
})

function PortalLayoutRoute() {
  return (
    <PortalLayout>
      <Outlet />
    </PortalLayout>
  )
}
