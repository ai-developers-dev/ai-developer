// Static reference data for the discovery form. Kept separate from form
// component so future tweaks (new CRM, new integration) don't touch UI code.

export type Trade = 'electrician' | 'plumber' | 'hvac' | 'multi-trade' | 'other'

export const TRADE_OPTIONS: { value: Trade; label: string }[] = [
  { value: 'electrician', label: 'Electrician' },
  { value: 'plumber', label: 'Plumber' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'multi-trade', label: 'Multi-trade' },
  { value: 'other', label: 'Other' },
]

export const SERVICES_BY_TRADE: Record<Trade, string[]> = {
  electrician: [
    'Panel upgrades',
    'EV chargers',
    'New construction wiring',
    'Residential service',
    'Commercial service',
    'Generators',
    'Solar',
    'Smart home installs',
    'Inspections',
  ],
  plumber: [
    'Drain cleaning',
    'Water heater install/repair',
    'Repipes',
    'Backflow prevention',
    'Sewer line repair',
    'Gas line work',
    'Emergency service',
    'New construction',
  ],
  hvac: [
    'Install',
    'Service/repair',
    'Maintenance plans',
    'Refrigeration',
    'Ductwork',
    'Commercial HVAC',
    'Indoor air quality',
    'Heat pumps',
  ],
  'multi-trade': [
    'Electrical work',
    'Plumbing work',
    'HVAC work',
    'General maintenance',
    'Commercial contracts',
    'Residential service',
    'New construction',
    'Emergency service',
  ],
  other: [
    'General service work',
    'Installation work',
    'Maintenance contracts',
    'Commercial contracts',
    'Residential service',
    'Emergency service',
  ],
}

// 40 platforms, market-share ordered. "Other" is handled separately with a
// free-text field.
export const CRM_OPTIONS: string[] = [
  'ServiceTitan',
  'Jobber',
  'Housecall Pro',
  'Simpro',
  'FieldPulse',
  'Sera',
  'Kickserv',
  'GorillaDesk',
  'ServiceM8',
  'Workiz',
  'QuoteIQ',
  'FieldEdge',
  'BuildOps',
  'Synchroteam',
  'Dataforma',
  'Method CRM',
  'Planado',
  'SmartServ',
  'Pipeline CRM',
  'Repair CRM',
  'Tofu',
  'Markate',
  'Orcatec',
  'WEXFSM',
  'FieldBoss',
  'Zuper',
  'Zoho FSM',
  'QuickBooks (alone)',
  'Salesforce',
  'HubSpot',
  'Zoho CRM',
  'Pipedrive',
  'Samsara',
  'Verizon Connect',
  'Connecteam',
  'Zapier',
  'Google Sheets / Excel',
  'Paper / manual',
  'None',
]

export const OTHER_TOOLS_OPTIONS: string[] = [
  'QuickBooks',
  'Stripe',
  'Square',
  'Google Sheets / Excel',
  'Paper',
  'Mailchimp',
  'Calendly',
  'Twilio',
  'Slack',
]

export const BOTTLENECK_OPTIONS = [
  { value: 'scheduling', label: 'Scheduling / dispatch' },
  { value: 'quoting', label: 'Quoting & estimating' },
  { value: 'payment', label: 'Payment collection' },
  { value: 'job_tracking', label: 'Job tracking & follow-up' },
  { value: 'crew_coordination', label: 'Crew coordination' },
  { value: 'customer_communication', label: 'Customer communication' },
  { value: 'other', label: 'Other' },
] as const

export const EMPLOYEE_COUNT_OPTIONS = [
  { value: '1', label: '1 (solo)' },
  { value: '2-5', label: '2-5' },
  { value: '6-10', label: '6-10' },
  { value: '11-20', label: '11-20' },
  { value: '21-50', label: '21-50' },
  { value: '50+', label: '50+' },
] as const

export const LOCATION_COUNT_OPTIONS = [
  { value: 'single', label: 'Single location' },
  { value: '2-3', label: '2-3 service areas' },
  { value: '4+', label: '4+ service areas' },
  { value: 'multi-state', label: 'Multi-state' },
] as const

export const SERVICE_RADIUS_OPTIONS = [
  { value: 'under_25', label: 'Under 25 miles' },
  { value: '25-50', label: '25-50 miles' },
  { value: '50-100', label: '50-100 miles' },
  { value: '100+', label: '100+ miles' },
] as const

export const QUOTE_ON_SITE_OPTIONS = [
  { value: 'always', label: 'Always' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'never', label: 'Never' },
] as const

export const CHANGE_ORDER_OPTIONS = [
  { value: 'rarely', label: 'Rarely' },
  { value: 'sometimes_30', label: 'Sometimes (~30%)' },
  { value: 'often_50', label: 'Often (50%+)' },
] as const

export const RECURRING_CONTRACTS_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'under_20', label: '<20% of revenue' },
  { value: '20-50', label: '20-50% of revenue' },
  { value: 'over_50', label: '>50% of revenue' },
] as const

export const ACCOUNTING_OPTIONS = [
  'QuickBooks Online',
  'QuickBooks Desktop',
  'Xero',
  'FreshBooks',
  'Manual / Excel',
  'None',
]

export const INTEGRATIONS_OPTIONS: string[] = [
  'QuickBooks',
  'Stripe / Square (card payments)',
  'ACH payments',
  'Supplier catalog',
  'Google Maps routing',
  'SMS reminders',
  'Email marketing',
  'Calendar sync (Google/Outlook)',
]

// Where do leads currently come from? Multi-select.
export const LEAD_SOURCES_OPTIONS: string[] = [
  'Google (organic search)',
  'Google Ads',
  'Google Local Services Ads',
  'Facebook',
  'Facebook Ads',
  'Instagram',
  'Angi (formerly Angie’s List)',
  'Yelp',
  'HomeAdvisor',
  'Thumbtack',
  'Nextdoor',
  'Bing',
  'YouTube',
  'Customer referrals (word-of-mouth)',
  'Repeat customers',
  'Direct mail / mailers',
  'Local TV / radio',
  'Truck wraps / vehicle signage',
  'Yard signs',
  'Door knocking',
  'Trade shows / events',
  'BBB / Better Business Bureau',
  'Local chamber of commerce',
  'Networking groups (BNI, etc.)',
]

// Yes/No options for the website-feature follow-ups.
export const YES_NO_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
] as const

export const MISSED_CALL_OPTIONS = [
  { value: 'voicemail', label: 'Goes to voicemail' },
  { value: 'answering_service', label: 'Answering service' },
  { value: 'ai_receptionist', label: 'AI receptionist' },
  { value: 'callback_later', label: 'We call back later' },
  { value: 'unanswered', label: 'Calls go unanswered' },
  { value: 'other', label: 'Other' },
] as const

export const AFTER_HOURS_OPTIONS = [
  { value: 'staff_on_call', label: 'Staff on-call rotation' },
  { value: 'answering_service', label: 'Answering service' },
  { value: 'ai_agent', label: 'AI agent' },
  { value: 'voicemail', label: 'Voicemail only' },
  { value: 'no_after_hours', label: 'No after-hours service' },
  { value: 'other', label: 'Other' },
] as const

// Single-select radio for collectGoogleReviews
export const GOOGLE_REVIEWS_OPTIONS = [
  { value: 'yes_routinely', label: 'Yes — routinely (after most jobs)' },
  { value: 'occasionally', label: 'Sometimes (when we remember)' },
  { value: 'no', label: 'No, not currently' },
] as const

// Multi-select for current AI / automations in use
export const CURRENT_AUTOMATIONS_OPTIONS: string[] = [
  'Zapier / Make',
  'ChatGPT / Claude (manual use)',
  'AI chatbot on website',
  'AI voice receptionist',
  'AI scheduling assistant',
  'Email automation (Mailchimp, Klaviyo, etc.)',
  'SMS automation',
  'Review-request automation',
  'Lead scoring / qualification AI',
  'Custom AI agent (built in-house or by a vendor)',
  'Nothing yet',
]

export const LAUNCH_OPTIONS = [
  { value: 'asap', label: 'ASAP' },
  { value: '3_months', label: 'Within 3 months' },
  { value: '3-6_months', label: '3-6 months' },
  { value: '6-12_months', label: '6-12 months' },
  { value: 'flexible', label: 'Flexible' },
] as const
