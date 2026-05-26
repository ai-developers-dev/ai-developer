import { createServerFn } from '@tanstack/react-start'

export interface CreateEmbeddedCheckoutInput {
  proposalId: string
  proposalTitle: string
  totalAmount: number
  clientEmail: string
  returnUrl: string
  installmentId: string
  installmentLabel: string
  installmentPosition: { index: number; total: number }
}

export const createEmbeddedCheckoutSession = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateEmbeddedCheckoutInput) => data)
  .handler(async ({ data }) => {
    const Stripe = (await import('stripe')).default

    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }

    const stripe = new Stripe(secretKey)

    const positionSuffix =
      data.installmentPosition.total > 1
        ? ` (${data.installmentPosition.index}/${data.installmentPosition.total})`
        : ''
    const productName = `${data.proposalTitle} — ${data.installmentLabel}${positionSuffix}`
    const productDescription = `${data.installmentLabel} for: ${data.proposalTitle}`

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      customer_email: data.clientEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: Math.round(data.totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: data.returnUrl,
      metadata: {
        proposalId: data.proposalId,
        installmentId: data.installmentId,
      },
    })

    return { sessionId: session.id, clientSecret: session.client_secret }
  })
