import { createServerFn } from '@tanstack/react-start'

export const requireAuth = createServerFn({ method: 'GET' }).handler(async () => {
  return { authenticated: true }
})
