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
    console.log('--- Discovery Call Booking ---')
    console.log(`Name: ${data.name}`)
    console.log(`Email: ${data.email}`)
    console.log(`Preferred Time: ${data.preferredTime}`)
    console.log('-----------------------------')

    // TODO: Send confirmation email or push to CRM
    return { success: true }
  })
