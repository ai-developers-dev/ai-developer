import { createServerFn } from '@tanstack/react-start'

export const getGeminiKey = createServerFn({ method: 'GET' }).handler(
  async () => {
    const key = process.env.GEMINI_API_KEY
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is not set')
    }
    return { key }
  },
)

export const submitBooking = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { name: string; email: string; preferredTime: string }) => data,
  )
  .handler(async ({ data }) => {
    // Save to Convex via the HTTP API
    const convexUrl = process.env.VITE_CONVEX_URL
    if (convexUrl) {
      try {
        await fetch(`${convexUrl}/api/mutation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: 'contactSubmissions:submit',
            args: {
              name: data.name,
              email: data.email,
              service: 'Discovery Call (Voice AI)',
              description: `Voice AI booking — Preferred time: ${data.preferredTime}`,
            },
          }),
        })
      } catch (err) {
        console.error('Failed to save booking to Convex:', err)
      }
    }

    console.log('--- Discovery Call Booking ---')
    console.log(`Name: ${data.name}`)
    console.log(`Email: ${data.email}`)
    console.log(`Preferred Time: ${data.preferredTime}`)
    console.log('-----------------------------')

    return { success: true }
  })
