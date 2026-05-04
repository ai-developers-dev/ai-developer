import { useEffect, useRef } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useConvexAuth, useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/post-login')({
  component: PostLoginPage,
})

function PostLoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const currentUser = useQuery(
    api.users.getCurrent,
    isAuthenticated ? {} : 'skip',
  )
  const ensureUser = useMutation(api.users.ensureCurrentUser)
  const ensured = useRef(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/sign-in/$', replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  useEffect(() => {
    if (isAuthenticated && currentUser === null && !ensured.current) {
      ensured.current = true
      ensureUser()
    }
  }, [isAuthenticated, currentUser, ensureUser])

  useEffect(() => {
    if (!currentUser) return
    const target = currentUser.role === 'admin' ? '/dashboard' : '/portal'
    navigate({ to: target, replace: true })
  }, [currentUser, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF]">
      <div className="text-sm text-muted-foreground">Signing you in…</div>
    </div>
  )
}
