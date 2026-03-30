import { createServerFn } from '@tanstack/react-start'

export interface LineItemInput {
  description: string
  quantity: number
  unitPrice: number
  total: number
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
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function buildLineItemRows(lineItems: LineItemInput[]): string {
  return lineItems.map((item) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #F3F4F6;font-size:14px;color:#374151;">${item.description}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #F3F4F6;font-size:14px;color:#374151;text-align:center;">${item.quantity}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #F3F4F6;font-size:14px;color:#374151;text-align:right;">$${formatCurrency(item.unitPrice)}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #F3F4F6;font-size:14px;color:#333123;text-align:right;font-weight:600;">$${formatCurrency(item.total)}</td>
    </tr>
  `).join('')
}

export const sendProposalEmail = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: SendProposalEmailInput) => data,
  )
  .handler(async ({ data }) => {
    const { Resend } = await import('resend')

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const resend = new Resend(apiKey)

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const validUntilFormatted = data.validUntil
      ? new Date(data.validUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : null

    const { data: result, error } = await resend.emails.send({
      from: 'AI Developer <onboarding@resend.dev>',
      to: data.to,
      subject: `New Proposal: ${data.proposalTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin:0;padding:0;background-color:#1c1110;font-family:'Helvetica Neue',Arial,sans-serif;">
            <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
              <div style="background:white;border-radius:12px;padding:0;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden;">

                <!-- Header -->
                <div style="background:linear-gradient(135deg,#d4cebb 0%,#b8b3a0 100%);padding:40px 40px 32px;text-align:center;">
                  <div style="display:inline-block;width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,0.2);line-height:52px;text-align:center;">
                    <span style="color:white;font-size:26px;font-weight:bold;">A</span>
                  </div>
                  <h1 style="color:white;font-size:22px;margin:14px 0 4px;font-weight:700;">AI Developer</h1>
                  <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0;">Websites, Apps &amp; AI Solutions Built Faster</p>
                </div>

                <!-- Body -->
                <div style="padding:36px 40px 40px;">

                  <!-- Greeting -->
                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 6px;">Hi ${data.clientName},</p>
                  <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 28px;">We've prepared the following proposal for your review.</p>

                  <!-- Proposal Info -->
                  <div style="background:#FAFAFA;border:1px solid #F3F4F6;border-radius:10px;padding:24px;margin-bottom:28px;">
                    <table style="width:100%;" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;">
                          <p style="color:#9CA3AF;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 4px;">Proposal</p>
                          <p style="color:#333123;font-size:18px;font-weight:700;margin:0;">${data.proposalTitle}</p>
                        </td>
                        <td style="vertical-align:top;text-align:right;">
                          <p style="color:#9CA3AF;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 4px;">Date</p>
                          <p style="color:#374151;font-size:14px;margin:0;">${today}</p>
                        </td>
                      </tr>
                    </table>
                    ${data.description ? `<p style="color:#6B7280;font-size:14px;line-height:1.6;margin:16px 0 0;">${data.description}</p>` : ''}
                  </div>

                  <!-- Line Items -->
                  <table style="width:100%;border-collapse:collapse;margin-bottom:4px;" cellpadding="0" cellspacing="0">
                    <thead>
                      <tr style="background:#F9FAFB;">
                        <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #E5E7EB;">Description</th>
                        <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #E5E7EB;">Qty</th>
                        <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #E5E7EB;">Unit Price</th>
                        <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #E5E7EB;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${buildLineItemRows(data.lineItems)}
                    </tbody>
                  </table>

                  <!-- Total -->
                  <div style="text-align:right;padding:16px;background:#251917;border-radius:0 0 8px 8px;margin-bottom:28px;">
                    <span style="color:#6B7280;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">Total Amount</span>
                    <p style="color:#d4cebb;font-size:28px;font-weight:800;margin:4px 0 0;">$${formatCurrency(data.totalAmount)}</p>
                  </div>

                  ${validUntilFormatted ? `
                  <p style="color:#9CA3AF;font-size:13px;text-align:center;margin:0 0 28px;">
                    This proposal is valid until <strong style="color:#374151;">${validUntilFormatted}</strong>
                  </p>
                  ` : ''}

                  <!-- CTA Buttons -->
                  <div style="text-align:center;margin:32px 0 16px;">
                    <a href="${data.payUrl}" style="display:inline-block;background:#d4cebb;color:white;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Pay Now</a>
                  </div>
                  <div style="text-align:center;margin:0 0 16px;">
                    <a href="${data.signInUrl}" style="display:inline-block;background:white;color:#d4cebb;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;border:2px solid #d4cebb;">View in Portal</a>
                  </div>
                  <div style="text-align:center;margin-bottom:24px;">
                    <p style="color:#9CA3AF;font-size:13px;margin:0 0 8px;">Don't have an account yet?</p>
                    <a href="${data.signUpUrl}" style="color:#d4cebb;font-size:14px;font-weight:600;text-decoration:underline;">Create an Account</a>
                  </div>

                </div>

                <!-- Footer -->
                <div style="background:#FAFAFA;border-top:1px solid #F3F4F6;padding:24px 40px;text-align:center;">
                  <p style="color:#9CA3AF;font-size:12px;margin:0;">AI Developer &mdash; Websites, Apps &amp; AI Solutions Built Faster</p>
                  <p style="color:#D1D5DB;font-size:11px;margin:8px 0 0;">You're receiving this because a proposal was created for ${data.to}</p>
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
          </head>
          <body style="margin:0;padding:0;background-color:#1c1110;font-family:'Helvetica Neue',Arial,sans-serif;">
            <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
              <div style="background:white;border-radius:12px;padding:0;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden;">

                <!-- Header -->
                <div style="background:linear-gradient(135deg,#d4cebb 0%,#b8b3a0 100%);padding:40px 40px 32px;text-align:center;">
                  <div style="display:inline-block;width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,0.2);line-height:52px;text-align:center;">
                    <span style="color:white;font-size:26px;font-weight:bold;">A</span>
                  </div>
                  <h1 style="color:white;font-size:22px;margin:14px 0 4px;font-weight:700;">AI Developer</h1>
                  <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0;">Websites, Apps &amp; AI Solutions Built Faster</p>
                </div>

                <!-- Body -->
                <div style="padding:36px 40px 40px;">

                  <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 6px;">Hi ${data.clientName},</p>
                  <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 28px;">Great news — your project is complete! Here's your final payment invoice.</p>

                  <!-- Project Info -->
                  <div style="background:#FAFAFA;border:1px solid #F3F4F6;border-radius:10px;padding:24px;margin-bottom:28px;">
                    <table style="width:100%;" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;">
                          <p style="color:#9CA3AF;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 4px;">Project</p>
                          <p style="color:#333123;font-size:18px;font-weight:700;margin:0;">${data.proposalTitle}</p>
                        </td>
                        <td style="vertical-align:top;text-align:right;">
                          <p style="color:#9CA3AF;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 4px;">Date</p>
                          <p style="color:#374151;font-size:14px;margin:0;">${today}</p>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Line Items -->
                  <table style="width:100%;border-collapse:collapse;margin-bottom:4px;" cellpadding="0" cellspacing="0">
                    <thead>
                      <tr style="background:#F9FAFB;">
                        <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #E5E7EB;">Description</th>
                        <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #E5E7EB;">Qty</th>
                        <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #E5E7EB;">Unit Price</th>
                        <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #E5E7EB;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${buildLineItemRows(data.lineItems)}
                    </tbody>
                  </table>

                  <!-- Payment Summary -->
                  <div style="padding:16px;background:#251917;border-radius:0 0 8px 8px;margin-bottom:28px;">
                    <table style="width:100%;" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#6B7280;font-size:14px;padding:4px 0;">Project Total</td>
                        <td style="color:#374151;font-size:14px;font-weight:600;text-align:right;padding:4px 0;">$${formatCurrency(data.totalAmount)}</td>
                      </tr>
                      <tr>
                        <td style="color:#6B7280;font-size:14px;padding:4px 0;">Already Paid (50%)</td>
                        <td style="color:#16A34A;font-size:14px;font-weight:600;text-align:right;padding:4px 0;">-$${formatCurrency(alreadyPaid)}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding:8px 0 0;border-top:2px solid #E5E7EB;"></td>
                      </tr>
                      <tr>
                        <td style="color:#333123;font-size:16px;font-weight:700;padding:4px 0;">Amount Due Now</td>
                        <td style="color:#d4cebb;font-size:24px;font-weight:800;text-align:right;padding:4px 0;">$${formatCurrency(data.secondPaymentAmount)}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- CTA -->
                  <div style="text-align:center;margin:32px 0 24px;">
                    <a href="${data.payUrl}" style="display:inline-block;background:#d4cebb;color:white;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Pay Final Balance</a>
                  </div>

                </div>

                <!-- Footer -->
                <div style="background:#FAFAFA;border-top:1px solid #F3F4F6;padding:24px 40px;text-align:center;">
                  <p style="color:#9CA3AF;font-size:12px;margin:0;">AI Developer &mdash; Websites, Apps &amp; AI Solutions Built Faster</p>
                  <p style="color:#D1D5DB;font-size:11px;margin:8px 0 0;">You're receiving this because your project has been completed</p>
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
