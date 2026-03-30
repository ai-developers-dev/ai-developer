import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header.js'
import { FadeInView } from '@/components/animations/fade-in-view.js'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: 'Privacy Policy — AI Developer' },
      {
        name: 'description',
        content:
          'Learn how AI Developer collects, uses, and protects your personal information.',
      },
    ],
  }),
})

const sections = [
  {
    title: 'Information We Collect',
    content: [
      'We collect information you provide directly when you fill out our contact form, request a quote, or communicate with us. This may include your name, email address, phone number, company name, and project details.',
      'We also automatically collect certain technical information when you visit our website, including your IP address, browser type, operating system, referring URLs, and pages viewed. This data is collected through cookies and similar technologies.',
    ],
  },
  {
    title: 'How We Use Your Information',
    content: [
      'We use the information we collect to respond to your inquiries and provide the services you request. Your contact details allow us to follow up on project discussions, send quotes, and communicate project updates.',
      'We may also use aggregated, anonymized data to analyze website traffic, improve our services, and understand how visitors interact with our site. We do not sell your personal information to third parties.',
    ],
  },
  {
    title: 'Cookies & Tracking',
    content: [
      'Our website uses cookies and similar tracking technologies to enhance your browsing experience. These include essential cookies required for site functionality and analytics cookies that help us understand site usage.',
      'You can control cookie preferences through your browser settings. Disabling cookies may affect certain features of our website.',
    ],
  },
  {
    title: 'Third-Party Services',
    content: [
      'We may use third-party services for analytics, hosting, and communication. These services may collect information as described in their own privacy policies. Our third-party providers include website hosting platforms, analytics tools, and email services.',
      'We select third-party providers that maintain appropriate security measures and data protection practices.',
    ],
  },
  {
    title: 'Data Security',
    content: [
      'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption of data in transit and secure storage practices.',
      'While we strive to protect your information, no method of transmission over the internet is completely secure. We cannot guarantee absolute security but are committed to maintaining industry-standard protections.',
    ],
  },
  {
    title: 'Your Rights',
    content: [
      'You have the right to access, correct, or delete your personal information. You may also request that we restrict processing of your data or object to certain uses. To exercise any of these rights, please contact us using the information below.',
      'We will respond to your request within a reasonable timeframe and in accordance with applicable data protection laws.',
    ],
  },
  {
    title: 'Contact Us',
    content: [
      'If you have questions about this Privacy Policy or our data practices, please reach out to us at privacy@aideveloper.com or through our contact page.',
      'This Privacy Policy may be updated from time to time. We will notify you of any significant changes by posting the updated policy on this page with a revised effective date.',
    ],
  },
]

function PrivacyPage() {
  return (
    <>
      <PageHeader
        badge="Legal"
        title="Privacy Policy"
        highlightWord="Privacy"
        description="Last updated: February 2026. This policy describes how we collect, use, and protect your personal information."
      />

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {sections.map((section, index) => (
            <FadeInView key={section.title} delay={index * 0.05}>
              <div className="mb-12 last:mb-0">
                <h2
                  className="text-2xl font-bold text-foreground mb-4"

                >
                  {section.title}
                </h2>
                {section.content.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-muted-foreground leading-relaxed mb-4 last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </FadeInView>
          ))}
        </div>
      </section>
    </>
  )
}
