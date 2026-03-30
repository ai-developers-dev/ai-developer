import { createServerFn } from '@tanstack/react-start'

export interface CreateEmbeddedCheckoutInput {
  proposalId: string
  proposalTitle: string
  totalAmount: number
  clientEmail: string
  returnUrl: string
  paymentNumber?: number
}

export const createEmbeddedCheckoutSession = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: CreateEmbeddedCheckoutInput) => data,
  )
  .handler(async ({ data }) => {
    const Stripe = (await import('stripe')).default

    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }

    const stripe = new Stripe(secretKey)
    const paymentNumber = data.paymentNumber || 1

    const isSecondPayment = paymentNumber === 2
    const isSplit = paymentNumber === 1 && data.paymentNumber === 1

    let productName = data.proposalTitle
    let productDescription = `Proposal acceptance payment for: ${data.proposalTitle}`

    if (isSecondPayment) {
      productName = `${data.proposalTitle} - Final Payment (2/2)`
      productDescription = `Final payment for: ${data.proposalTitle}`
    } else if (isSplit) {
      productName = `${data.proposalTitle} - Initial Payment (1/2)`
      productDescription = `Initial payment for: ${data.proposalTitle}`
    }

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
        paymentNumber: String(paymentNumber),
      },
    })

    return { sessionId: session.id, clientSecret: session.client_secret }
  })
