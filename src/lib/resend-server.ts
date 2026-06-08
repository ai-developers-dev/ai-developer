import { createServerFn } from '@tanstack/react-start'

export interface LineItemInput {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface InstallmentInput {
  label: string
  percent: number
  amount: number
}

export interface SendProposalEmailInput {
  to: string
  clientName: string
  proposalTitle: string
  description?: string
  lineItems: LineItemInput[]
  totalAmount: number
  validUntil?: string
  payUrl: string
  signInUrl: string
  signUpUrl: string
  installments?: InstallmentInput[]
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function buildLineItemRows(lineItems: LineItemInput[]): string {
  return lineItems.map((item, i) => {
    const isDiscount = item.total < 0
    const isLast = i === lineItems.length - 1
    const textColor = isDiscount ? '#ef4444' : '#f4dddb'
    const displayTotal = Math.abs(item.total)
    const displayUnitPrice = Math.abs(item.unitPrice)

    return `
    <tr>
      <td style="padding:16px 20px;border-bottom:${isLast ? 'none' : '1px solid rgba(208,197,175,0.1)'};font-size:14px;color:#f4dddb;line-height:1.5;">${item.description}</td>
      <td style="padding:16px 12px;border-bottom:${isLast ? 'none' : '1px solid rgba(208,197,175,0.1)'};font-size:14px;color:#d0c5af;text-align:center;">${item.quantity}</td>
      <td style="padding:16px 12px;border-bottom:${isLast ? 'none' : '1px solid rgba(208,197,175,0.1)'};font-size:14px;color:#d0c5af;text-align:right;">${isDiscount ? '-' : ''}$${formatCurrency(displayUnitPrice)}</td>
      <td style="padding:16px 20px;border-bottom:${isLast ? 'none' : '1px solid rgba(208,197,175,0.1)'};font-size:14px;color:${textColor};text-align:right;font-weight:600;">${isDiscount ? '-' : ''}$${formatCurrency(displayTotal)}</td>
    </tr>
  `}).join('')
}

function buildPaymentScheduleSection(installments: InstallmentInput[] | undefined): string {
  if (!installments || installments.length === 0) return ''

  return `
    <!-- Payment Schedule -->
    <div style="margin:32px 0;">
      <p style="color:#d4cebb;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 16px;">Payment Schedule</p>
      <div style="background:#291d1b;border:1px solid rgba(208,197,175,0.15);border-radius:12px;overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;" cellpadding="0" cellspacing="0">
          <thead>
            <tr style="background:rgba(208,197,175,0.08);">
              <th style="padding:14px 20px;text-align:left;font-size:11px;font-weight:600;color:#d0c5af;text-transform:uppercase;letter-spacing:0.05em;">Payment</th>
              <th style="padding:14px 16px;text-align:center;font-size:11px;font-weight:600;color:#d0c5af;text-transform:uppercase;letter-spacing:0.05em;">Percentage</th>
              <th style="padding:14px 20px;text-align:right;font-size:11px;font-weight:600;color:#d0c5af;text-transform:uppercase;letter-spacing:0.05em;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${installments.map((inst, i) => `
              <tr>
                <td style="padding:16px 20px;font-size:14px;color:#f4dddb;border-top:1px solid rgba(208,197,175,0.1);">${inst.label}</td>
                <td style="padding:16px;font-size:14px;color:#d0c5af;text-align:center;border-top:1px solid rgba(208,197,175,0.1);">${inst.percent}%</td>
                <td style="padding:16px 20px;font-size:15px;color:#d4cebb;text-align:right;font-weight:700;border-top:1px solid rgba(208,197,175,0.1);">$${formatCurrency(inst.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

export const sendProposalEmail = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: SendProposalEmailInput) => data,
  )
  .handler(async ({ data }) => {
    const { Resend } = await import('resend')

    console.log('[sendProposalEmail] Installments received:', JSON.stringify(data.installments, null, 2))

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const resend = new Resend(apiKey)

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const validUntilFormatted = data.validUntil
      ? new Date(data.validUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : null

    const paymentScheduleHtml = buildPaymentScheduleSection(data.installments)

    const { data: result, error } = await resend.emails.send({
      from: 'AI Developer <onboarding@resend.dev>',
      to: data.to,
      subject: `Proposal: ${data.proposalTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
          </head>
          <body style="margin:0;padding:0;background-color:#1c1110;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
            <div style="max-width:640px;margin:0 auto;padding:40px 20px;">

              <!-- Main Card -->
              <div style="background:#251917;border-radius:16px;overflow:hidden;border:1px solid rgba(208,197,175,0.15);">

                <!-- Header -->
                <div style="background:linear-gradient(135deg,#d4cebb 0%,#b8b3a0 100%);padding:48px 40px;text-align:center;">
                  <div style="display:inline-block;width:56px;height:56px;border-radius:14px;background:rgba(51,49,35,0.2);line-height:56px;text-align:center;margin-bottom:16px;">
                    <span style="color:#333123;font-size:28px;font-weight:700;font-family:'Space Grotesk',sans-serif;">A</span>
                  </div>
                  <h1 style="color:#333123;font-size:24px;margin:0 0 6px;font-weight:700;font-family:'Space Grotesk',sans-serif;">AI Developer</h1>
                  <p style="color:rgba(51,49,35,0.7);font-size:14px;margin:0;font-weight:500;">Websites, Apps &amp; AI Solutions Built Faster</p>
                </div>

                <!-- Body -->
                <div style="padding:40px;">

                  <!-- Greeting -->
                  <p style="color:#f4dddb;font-size:18px;line-height:1.5;margin:0 0 8px;font-weight:500;">Hi ${data.clientName},</p>
                  <p style="color:#d0c5af;font-size:15px;line-height:1.6;margin:0 0 32px;">We've prepared a proposal for your review. Take a look at the details below.</p>

                  <!-- Proposal Title Card -->
                  <div style="background:#291d1b;border:1px solid rgba(208,197,175,0.15);border-radius:12px;padding:24px;margin-bottom:32px;">
                    <table style="width:100%;" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;">
                          <p style="color:#d0c5af;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px;font-weight:600;">Proposal</p>
                          <p style="color:#f4dddb;font-size:20px;font-weight:700;margin:0;font-family:'Space Grotesk',sans-serif;">${data.proposalTitle}</p>
                        </td>
                        <td style="vertical-align:top;text-align:right;width:120px;">
                          <p style="color:#d0c5af;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px;font-weight:600;">Date</p>
                          <p style="color:#f4dddb;font-size:14px;margin:0;">${today}</p>
                        </td>
                      </tr>
                    </table>
                    ${data.description ? `<p style="color:#d0c5af;font-size:14px;line-height:1.6;margin:20px 0 0;padding-top:16px;border-top:1px solid rgba(208,197,175,0.1);">${data.description}</p>` : ''}
                  </div>

                  <!-- Line Items -->
                  <p style="color:#d4cebb;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 16px;">Services</p>
                  <div style="background:#291d1b;border:1px solid rgba(208,197,175,0.15);border-radius:12px;overflow:hidden;margin-bottom:0;">
                    <table style="width:100%;border-collapse:collapse;" cellpadding="0" cellspacing="0">
                      <thead>
                        <tr style="background:rgba(208,197,175,0.08);">
                          <th style="padding:14px 20px;text-align:left;font-size:11px;font-weight:600;color:#d0c5af;text-transform:uppercase;letter-spacing:0.05em;">Description</th>
                          <th style="padding:14px 12px;text-align:center;font-size:11px;font-weight:600;color:#d0c5af;text-transform:uppercase;letter-spacing:0.05em;">Qty</th>
                          <th style="padding:14px 12px;text-align:right;font-size:11px;font-weight:600;color:#d0c5af;text-transform:uppercase;letter-spacing:0.05em;">Price</th>
                          <th style="padding:14px 20px;text-align:right;font-size:11px;font-weight:600;color:#d0c5af;text-transform:uppercase;letter-spacing:0.05em;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${buildLineItemRows(data.lineItems)}
                      </tbody>
                    </table>
                  </div>

                  <!-- Total -->
                  <div style="background:linear-gradient(135deg,#d4cebb 0%,#b8b3a0 100%);border-radius:12px;padding:24px 28px;margin-top:20px;text-align:right;">
                    <span style="color:rgba(51,49,35,0.6);font-size:12px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Total Amount</span>
                    <p style="color:#333123;font-size:36px;font-weight:800;margin:8px 0 0;font-family:'Space Grotesk',sans-serif;">$${formatCurrency(data.totalAmount)}</p>
                  </div>

                  ${paymentScheduleHtml}

                  ${validUntilFormatted ? `
                  <p style="color:#d0c5af;font-size:13px;text-align:center;margin:32px 0 0;">
                    This proposal is valid until <strong style="color:#f4dddb;">${validUntilFormatted}</strong>
                  </p>
                  ` : ''}

                  <!-- CTA Buttons -->
                  <div style="margin-top:40px;text-align:center;">
                    <a href="${data.payUrl}" style="display:inline-block;background:linear-gradient(135deg,#d4cebb 0%,#b8b3a0 100%);color:#333123;padding:16px 48px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;font-family:'Space Grotesk',sans-serif;">Accept & Pay</a>
                  </div>
                  <div style="margin-top:16px;text-align:center;">
                    <a href="${data.signInUrl}" style="display:inline-block;background:transparent;color:#d4cebb;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;border:2px solid rgba(212,206,187,0.4);">View in Portal</a>
                  </div>
                  <div style="margin-top:20px;text-align:center;">
                    <p style="color:#d0c5af;font-size:13px;margin:0 0 6px;">Don't have an account yet?</p>
                    <a href="${data.signUpUrl}" style="color:#d4cebb;font-size:14px;font-weight:600;text-decoration:none;">Create an Account →</a>
                  </div>

                </div>

                <!-- Footer -->
                <div style="background:#1c1110;border-top:1px solid rgba(208,197,175,0.1);padding:28px 40px;text-align:center;">
                  <p style="color:#d0c5af;font-size:12px;margin:0;">AI Developer — Websites, Apps & AI Solutions Built Faster</p>
                  <p style="color:rgba(208,197,175,0.5);font-size:11px;margin:10px 0 0;">You're receiving this because a proposal was created for ${data.to}</p>
                </div>

              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send proposal email:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return { success: true, emailId: result?.id }
  })

// Second payment invoice email
export interface SendSecondPaymentInvoiceInput {
  to: string
  clientName: string
  proposalTitle: string
  lineItems: LineItemInput[]
  totalAmount: number
  secondPaymentAmount: number
  payUrl: string
}

export const sendSecondPaymentInvoice = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: SendSecondPaymentInvoiceInput) => data,
  )
  .handler(async ({ data }) => {
    const { Resend } = await import('resend')

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const resend = new Resend(apiKey)
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const alreadyPaid = data.totalAmount - data.secondPaymentAmount

    const { data: result, error } = await resend.emails.send({
      from: 'AI Developer <onboarding@resend.dev>',
      to: data.to,
      subject: `Final Payment Due: ${data.proposalTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
          </head>
          <body style="margin:0;padding:0;background-color:#1c1110;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
            <div style="max-width:640px;margin:0 auto;padding:40px 20px;">

              <!-- Main Card -->
              <div style="background:#251917;border-radius:16px;overflow:hidden;border:1px solid rgba(208,197,175,0.15);">

                <!-- Header -->
                <div style="background:linear-gradient(135deg,#d4cebb 0%,#b8b3a0 100%);padding:48px 40px;text-align:center;">
                  <div style="display:inline-block;width:56px;height:56px;border-radius:14px;background:rgba(51,49,35,0.2);line-height:56px;text-align:center;margin-bottom:16px;">
                    <span style="color:#333123;font-size:28px;font-weight:700;font-family:'Space Grotesk',sans-serif;">A</span>
                  </div>
                  <h1 style="color:#333123;font-size:24px;margin:0 0 6px;font-weight:700;font-family:'Space Grotesk',sans-serif;">AI Developer</h1>
                  <p style="color:rgba(51,49,35,0.7);font-size:14px;margin:0;font-weight:500;">Websites, Apps &amp; AI Solutions Built Faster</p>
                </div>

                <!-- Body -->
                <div style="padding:40px;">

                  <p style="color:#f4dddb;font-size:18px;line-height:1.5;margin:0 0 8px;font-weight:500;">Hi ${data.clientName},</p>
                  <p style="color:#d0c5af;font-size:15px;line-height:1.6;margin:0 0 32px;">Great news — your project is complete! Here's your final payment invoice.</p>

                  <!-- Project Info -->
                  <div style="background:#291d1b;border:1px solid rgba(208,197,175,0.15);border-radius:12px;padding:24px;margin-bottom:32px;">
                    <table style="width:100%;" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;">
                          <p style="color:#d0c5af;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px;font-weight:600;">Project</p>
                          <p style="color:#f4dddb;font-size:20px;font-weight:700;margin:0;font-family:'Space Grotesk',sans-serif;">${data.proposalTitle}</p>
                        </td>
                        <td style="vertical-align:top;text-align:right;width:120px;">
                          <p style="color:#d0c5af;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px;font-weight:600;">Date</p>
                          <p style="color:#f4dddb;font-size:14px;margin:0;">${today}</p>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Line Items -->
                  <p style="color:#d4cebb;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 16px;">Services</p>
                  <div style="background:#291d1b;border:1px solid rgba(208,197,175,0.15);border-radius:12px;overflow:hidden;">
                    <table style="width:100%;border-collapse:collapse;" cellpadding="0" cellspacing="0">
                      <thead>
                        <tr style="background:rgba(208,197,175,0.08);">
                          <th style="padding:14px 20px;text-align:left;font-size:11px;font-weight:600;color:#d0c5af;text-transform:uppercase;letter-spacing:0.05em;">Description</th>
                          <th style="padding:14px 12px;text-align:center;font-size:11px;font-weight:600;color:#d0c5af;text-transform:uppercase;letter-spacing:0.05em;">Qty</th>
                          <th style="padding:14px 12px;text-align:right;font-size:11px;font-weight:600;color:#d0c5af;text-transform:uppercase;letter-spacing:0.05em;">Price</th>
                          <th style="padding:14px 20px;text-align:right;font-size:11px;font-weight:600;color:#d0c5af;text-transform:uppercase;letter-spacing:0.05em;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${buildLineItemRows(data.lineItems)}
                      </tbody>
                    </table>
                  </div>

                  <!-- Payment Summary -->
                  <div style="background:#291d1b;border:1px solid rgba(208,197,175,0.15);border-radius:12px;padding:24px;margin-top:20px;">
                    <table style="width:100%;" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#d0c5af;font-size:14px;padding:8px 0;">Project Total</td>
                        <td style="color:#f4dddb;font-size:14px;font-weight:600;text-align:right;padding:8px 0;">$${formatCurrency(data.totalAmount)}</td>
                      </tr>
                      <tr>
                        <td style="color:#d0c5af;font-size:14px;padding:8px 0;">Already Paid</td>
                        <td style="color:#22c55e;font-size:14px;font-weight:600;text-align:right;padding:8px 0;">-$${formatCurrency(alreadyPaid)}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- Amount Due -->
                  <div style="background:linear-gradient(135deg,#d4cebb 0%,#b8b3a0 100%);border-radius:12px;padding:24px 28px;margin-top:20px;text-align:right;">
                    <span style="color:rgba(51,49,35,0.6);font-size:12px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Amount Due Now</span>
                    <p style="color:#333123;font-size:36px;font-weight:800;margin:8px 0 0;font-family:'Space Grotesk',sans-serif;">$${formatCurrency(data.secondPaymentAmount)}</p>
                  </div>

                  <!-- CTA -->
                  <div style="margin-top:40px;text-align:center;">
                    <a href="${data.payUrl}" style="display:inline-block;background:linear-gradient(135deg,#d4cebb 0%,#b8b3a0 100%);color:#333123;padding:16px 48px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;font-family:'Space Grotesk',sans-serif;">Pay Final Balance</a>
                  </div>

                </div>

                <!-- Footer -->
                <div style="background:#1c1110;border-top:1px solid rgba(208,197,175,0.1);padding:28px 40px;text-align:center;">
                  <p style="color:#d0c5af;font-size:12px;margin:0;">AI Developer — Websites, Apps & AI Solutions Built Faster</p>
                  <p style="color:rgba(208,197,175,0.5);font-size:11px;margin:10px 0 0;">You're receiving this because your project has been completed</p>
                </div>

              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send second payment invoice:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return { success: true, emailId: result?.id }
  })
