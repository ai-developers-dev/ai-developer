import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { StepProgress } from './step-progress'
import { MultiSelectDropdown } from './multi-select-dropdown'
import {
  ACCOUNTING_OPTIONS,
  AFTER_HOURS_OPTIONS,
  BOTTLENECK_OPTIONS,
  CHANGE_ORDER_OPTIONS,
  CRM_OPTIONS,
  CURRENT_AUTOMATIONS_OPTIONS,
  EMPLOYEE_COUNT_OPTIONS,
  GOOGLE_REVIEWS_OPTIONS,
  INTEGRATIONS_OPTIONS,
  LAUNCH_OPTIONS,
  LEAD_SOURCES_OPTIONS,
  LOCATION_COUNT_OPTIONS,
  MISSED_CALL_OPTIONS,
  OTHER_TOOLS_OPTIONS,
  QUOTE_ON_SITE_OPTIONS,
  RECURRING_CONTRACTS_OPTIONS,
  SERVICE_RADIUS_OPTIONS,
  SERVICES_BY_TRADE,
  TRADE_OPTIONS,
  WEBSITE_FEATURES_OPTIONS,
  type Trade,
} from '@/lib/discovery-data'

// Bumped to v3 — schema reshaped: dropped budget, added website URL +
// features + missed-call + after-hours + lead sources + Google reviews +
// current AI/automations. Old drafts are now discarded on load.
const DRAFT_KEY = 'discovery_form_draft_v3'

interface FormState {
  // Step 1 — business basics
  businessName: string
  websiteUrl: string
  businessAddress: string
  businessPhone: string
  businessEmail: string
  employeeCount: string
  // Step 2 — what you do & where it hurts
  primaryTrade: Trade | ''
  servicesOffered: string[]
  leadSources: string[]
  locationCount: string
  serviceRadiusMiles: string
  topBottleneck: string
  // Step 3 — customers, calls & jobs
  websiteFeatures: string[]
  collectsGoogleReviews: string
  techsQuoteOnSite: string
  missedCallHandling: string
  afterHoursHandling: string
  recurringContracts: string
  changeOrderFrequency: string
  // Step 4 — tools, tech & project
  currentCrm: string
  currentCrmOther: string
  otherTools: string[]
  currentAutomations: string[]
  accountingSystem: string
  requiredIntegrations: string[]
  desiredLaunch: string
  successDefinition: string
}

const INITIAL: FormState = {
  businessName: '',
  websiteUrl: '',
  businessAddress: '',
  businessPhone: '',
  businessEmail: '',
  employeeCount: '',
  primaryTrade: '',
  servicesOffered: [],
  leadSources: [],
  locationCount: '',
  serviceRadiusMiles: '',
  topBottleneck: '',
  websiteFeatures: [],
  collectsGoogleReviews: '',
  techsQuoteOnSite: '',
  missedCallHandling: '',
  afterHoursHandling: '',
  recurringContracts: '',
  changeOrderFrequency: '',
  currentCrm: '',
  currentCrmOther: '',
  otherTools: [],
  currentAutomations: [],
  accountingSystem: '',
  requiredIntegrations: [],
  desiredLaunch: '',
  successDefinition: '',
}

const STEPS = [
  { label: 'Business basics' },
  { label: 'What you do' },
  { label: 'Customers & calls' },
  { label: 'Tools & project' },
]

function isEmailValid(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

export interface DiscoveryFormProps {
  /** Optional referrer source (e.g. "electricians") to pre-select trade and persist for analytics. */
  source?: string
}

export function DiscoveryForm({ source }: DiscoveryFormProps) {
  const submit = useMutation(api.discoverySubmissions.submit)
  const containerRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const draft = JSON.parse(raw) as {
          form: FormState
          step: number
        }
        setForm({ ...INITIAL, ...draft.form })
        setStep(draft.step ?? 1)
      } else if (source && ['electrician', 'plumber', 'hvac'].includes(source)) {
        setForm((f) => ({ ...f, primaryTrade: source as Trade }))
      }
    } catch {
      // ignore
    }
  }, [source])

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step }))
    } catch {
      // ignore
    }
  }, [form, step])

  // Scroll to the top of the form whenever the user advances/goes back a
  // step, so they see the new step's heading and progress bar immediately.
  // Skip on initial mount — they're naturally already at the top.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (typeof window === 'undefined') return
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  // Per-step validation. Each step returns null when valid or a string error.
  const stepErrors = useMemo(() => {
    const errs: Record<number, string | null> = {
      1: null,
      2: null,
      3: null,
      4: null,
    }

    if (!form.businessName.trim()) errs[1] = 'Business name is required.'
    else if (!form.businessPhone.trim()) errs[1] = 'Business phone is required.'
    else if (!isEmailValid(form.businessEmail))
      errs[1] = 'A valid email is required.'
    else if (!form.employeeCount) errs[1] = 'Pick the employee count.'
    // Website URL + address are both optional. If both blank, that's allowed
    // but worth flagging — let it through, we can ask in the email.

    if (!form.primaryTrade) errs[2] = 'Pick your primary trade.'
    else if (form.servicesOffered.length === 0)
      errs[2] = 'Select at least one service you offer.'
    else if (form.leadSources.length === 0)
      errs[2] = 'Pick at least one place your leads come from.'
    else if (!form.locationCount) errs[2] = 'Pick your location count.'
    else if (!form.serviceRadiusMiles) errs[2] = 'Pick your service radius.'
    else if (!form.topBottleneck) errs[2] = 'Pick your biggest bottleneck.'

    // Step 3: website features only required when websiteUrl is present.
    if (!form.collectsGoogleReviews)
      errs[3] = 'Pick your Google reviews answer.'
    else if (!form.techsQuoteOnSite)
      errs[3] = 'Pick your on-site quoting answer.'
    else if (!form.missedCallHandling)
      errs[3] = 'Pick how missed calls are handled.'
    else if (!form.afterHoursHandling)
      errs[3] = 'Pick how after-hours calls are handled.'
    else if (!form.recurringContracts)
      errs[3] = 'Pick your recurring contracts answer.'
    else if (!form.changeOrderFrequency)
      errs[3] = 'Pick your change-order frequency.'

    if (!form.currentCrm) errs[4] = 'Pick your current CRM (or "None").'
    else if (form.currentCrm === 'Other' && !form.currentCrmOther.trim())
      errs[4] = 'Tell us which CRM you use.'
    else if (!form.accountingSystem) errs[4] = 'Pick your accounting system.'
    else if (!form.desiredLaunch) errs[4] = 'Pick a target launch window.'

    return errs
  }, [form])

  const currentStepValid = stepErrors[step] === null

  async function handleSubmit() {
    setError(null)
    if (!currentStepValid) {
      setError(stepErrors[step] ?? 'Please complete this step.')
      return
    }
    setSubmitting(true)
    try {
      const resolvedCrm =
        form.currentCrm === 'Other'
          ? `Other: ${form.currentCrmOther.trim()}`
          : form.currentCrm
      await submit({
        businessName: form.businessName.trim(),
        businessAddress: form.businessAddress.trim() || undefined,
        websiteUrl: form.websiteUrl.trim() || undefined,
        businessPhone: form.businessPhone.trim(),
        businessEmail: form.businessEmail.trim(),
        employeeCount: form.employeeCount as any,
        primaryTrade: form.primaryTrade as any,
        servicesOffered: form.servicesOffered,
        currentCrm: resolvedCrm,
        otherTools: form.otherTools,
        leadSources: form.leadSources,
        topBottleneck: form.topBottleneck as any,
        locationCount: form.locationCount as any,
        serviceRadiusMiles: form.serviceRadiusMiles as any,
        techsQuoteOnSite: form.techsQuoteOnSite as any,
        changeOrderFrequency: form.changeOrderFrequency as any,
        recurringContracts: form.recurringContracts as any,
        collectsGoogleReviews: form.collectsGoogleReviews as any,
        websiteFeatures: form.websiteFeatures,
        missedCallHandling: form.missedCallHandling as any,
        afterHoursHandling: form.afterHoursHandling as any,
        accountingSystem: form.accountingSystem,
        requiredIntegrations: form.requiredIntegrations,
        currentAutomations: form.currentAutomations,
        desiredLaunch: form.desiredLaunch as any,
        successDefinition: form.successDefinition.trim() || undefined,
        source: source || undefined,
      })
      localStorage.removeItem(DRAFT_KEY)
      setSubmitted(true)
    } catch (err: any) {
      console.error('Discovery submit failed:', err)
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto border-subtle-border bg-surface">
        <CardContent className="py-16 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-brand-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Thanks — we got it.
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            I'll review your discovery and email you a scope + price range
            within 24 hours. If anything's urgent, reply to that email and
            we'll set up a call.
          </p>
          <p className="text-xs text-muted-foreground/70 pt-4">— Doug</p>
        </CardContent>
      </Card>
    )
  }

  const servicesList = form.primaryTrade
    ? SERVICES_BY_TRADE[form.primaryTrade]
    : []
  const hasWebsite = form.websiteUrl.trim().length > 0

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto space-y-6 scroll-mt-8">
      <StepProgress steps={STEPS} currentStep={step} />

      <Card className="border-subtle-border bg-surface">
        <CardContent className="pt-8 space-y-6">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-foreground">
                Tell us about your business
              </h2>

              <div className="space-y-2">
                <Label htmlFor="businessName">Business name</Label>
                <Input
                  id="businessName"
                  autoFocus
                  value={form.businessName}
                  onChange={(e) => set('businessName', e.target.value)}
                  placeholder="Smith Electrical Services"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">
                  Website URL{' '}
                  <span className="text-xs text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={form.websiteUrl}
                  onChange={(e) => set('websiteUrl', e.target.value)}
                  placeholder="https://yourbusiness.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAddress">
                  Business address{' '}
                  <span className="text-xs text-muted-foreground font-normal">
                    {hasWebsite ? '(optional — your website covers it)' : '(optional)'}
                  </span>
                </Label>
                <Input
                  id="businessAddress"
                  value={form.businessAddress}
                  onChange={(e) => set('businessAddress', e.target.value)}
                  placeholder="123 Main St, Springfield, IL"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Phone</Label>
                  <Input
                    id="businessPhone"
                    type="tel"
                    value={form.businessPhone}
                    onChange={(e) => set('businessPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={form.businessEmail}
                    onChange={(e) => set('businessEmail', e.target.value)}
                    placeholder="owner@business.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Number of employees</Label>
                <RadioGroup
                  value={form.employeeCount}
                  onValueChange={(v) => set('employeeCount', v)}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                >
                  {EMPLOYEE_COUNT_OPTIONS.map((opt) => (
                    <RadioOption
                      key={opt.value}
                      value={opt.value}
                      label={opt.label}
                      selected={form.employeeCount === opt.value}
                    />
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-foreground">
                What you do, who you serve, where it hurts
              </h2>

              <div className="space-y-2">
                <Label>Primary trade</Label>
                <RadioGroup
                  value={form.primaryTrade}
                  onValueChange={(v) => {
                    set('primaryTrade', v as Trade)
                    set('servicesOffered', [])
                  }}
                  className="grid grid-cols-2 sm:grid-cols-5 gap-2"
                >
                  {TRADE_OPTIONS.map((opt) => (
                    <RadioOption
                      key={opt.value}
                      value={opt.value}
                      label={opt.label}
                      selected={form.primaryTrade === opt.value}
                    />
                  ))}
                </RadioGroup>
              </div>

              {form.primaryTrade && (
                <MultiSelectDropdown
                  label="Services you offer (pick all that apply)"
                  options={servicesList}
                  value={form.servicesOffered}
                  onChange={(v) => set('servicesOffered', v)}
                />
              )}

              <MultiSelectDropdown
                label="Where do your leads come from today? (pick all that apply)"
                options={LEAD_SOURCES_OPTIONS}
                value={form.leadSources}
                onChange={(v) => set('leadSources', v)}
              />

              <div className="space-y-2">
                <Label>Number of service locations</Label>
                <RadioGroup
                  value={form.locationCount}
                  onValueChange={(v) => set('locationCount', v)}
                  className="grid grid-cols-2 gap-2"
                >
                  {LOCATION_COUNT_OPTIONS.map((opt) => (
                    <RadioOption
                      key={opt.value}
                      value={opt.value}
                      label={opt.label}
                      selected={form.locationCount === opt.value}
                    />
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Service radius from your main location</Label>
                <RadioGroup
                  value={form.serviceRadiusMiles}
                  onValueChange={(v) => set('serviceRadiusMiles', v)}
                  className="grid grid-cols-2 gap-2"
                >
                  {SERVICE_RADIUS_OPTIONS.map((opt) => (
                    <RadioOption
                      key={opt.value}
                      value={opt.value}
                      label={opt.label}
                      selected={form.serviceRadiusMiles === opt.value}
                    />
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Biggest operational bottleneck today</Label>
                <RadioGroup
                  value={form.topBottleneck}
                  onValueChange={(v) => set('topBottleneck', v)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  {BOTTLENECK_OPTIONS.map((opt) => (
                    <RadioOption
                      key={opt.value}
                      value={opt.value}
                      label={opt.label}
                      selected={form.topBottleneck === opt.value}
                    />
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-foreground">
                How customers reach you — and what happens when they do
              </h2>

              {hasWebsite && (
                <MultiSelectDropdown
                  label="What features does your website have today? (pick all that apply)"
                  options={WEBSITE_FEATURES_OPTIONS}
                  value={form.websiteFeatures}
                  onChange={(v) => set('websiteFeatures', v)}
                />
              )}

              <div className="space-y-2">
                <Label>Do you collect Google reviews from your customers?</Label>
                <RadioGroup
                  value={form.collectsGoogleReviews}
                  onValueChange={(v) => set('collectsGoogleReviews', v)}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                >
                  {GOOGLE_REVIEWS_OPTIONS.map((opt) => (
                    <RadioOption
                      key={opt.value}
                      value={opt.value}
                      label={opt.label}
                      selected={form.collectsGoogleReviews === opt.value}
                    />
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Do techs quote on-site?</Label>
                <RadioGroup
                  value={form.techsQuoteOnSite}
                  onValueChange={(v) => set('techsQuoteOnSite', v)}
                  className="grid grid-cols-3 gap-2"
                >
                  {QUOTE_ON_SITE_OPTIONS.map((opt) => (
                    <RadioOption
                      key={opt.value}
                      value={opt.value}
                      label={opt.label}
                      selected={form.techsQuoteOnSite === opt.value}
                    />
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>
                  What happens when you (or your staff) can't answer the
                  phone during business hours?
                </Label>
                <RadioGroup
                  value={form.missedCallHandling}
                  onValueChange={(v) => set('missedCallHandling', v)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  {MISSED_CALL_OPTIONS.map((opt) => (
                    <RadioOption
                      key={opt.value}
                      value={opt.value}
                      label={opt.label}
                      selected={form.missedCallHandling === opt.value}
                    />
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>
                  What happens after hours if someone calls for emergency
                  service?
                </Label>
                <RadioGroup
                  value={form.afterHoursHandling}
                  onValueChange={(v) => set('afterHoursHandling', v)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  {AFTER_HOURS_OPTIONS.map((opt) => (
                    <RadioOption
                      key={opt.value}
                      value={opt.value}
                      label={opt.label}
                      selected={form.afterHoursHandling === opt.value}
                    />
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Recurring maintenance contracts / service agreements?</Label>
                <RadioGroup
                  value={form.recurringContracts}
                  onValueChange={(v) => set('recurringContracts', v)}
                  className="grid grid-cols-2 gap-2"
                >
                  {RECURRING_CONTRACTS_OPTIONS.map((opt) => (
                    <RadioOption
                      key={opt.value}
                      value={opt.value}
                      label={opt.label}
                      selected={form.recurringContracts === opt.value}
                    />
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>How often do jobs run over the initial estimate?</Label>
                <RadioGroup
                  value={form.changeOrderFrequency}
                  onValueChange={(v) => set('changeOrderFrequency', v)}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                >
                  {CHANGE_ORDER_OPTIONS.map((opt) => (
                    <RadioOption
                      key={opt.value}
                      value={opt.value}
                      label={opt.label}
                      selected={form.changeOrderFrequency === opt.value}
                    />
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-foreground">
                What you use today, and what you want to build
              </h2>

              <div className="space-y-2">
                <Label htmlFor="currentCrm">
                  Current CRM / field service software
                </Label>
                <Select
                  value={form.currentCrm}
                  onValueChange={(v) => set('currentCrm', v)}
                >
                  <SelectTrigger id="currentCrm">
                    <SelectValue placeholder="Select your current platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {CRM_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                    <SelectItem value="Other">Other (specify)</SelectItem>
                  </SelectContent>
                </Select>
                {form.currentCrm === 'Other' && (
                  <Input
                    placeholder="Which platform?"
                    value={form.currentCrmOther}
                    onChange={(e) => set('currentCrmOther', e.target.value)}
                  />
                )}
              </div>

              <MultiSelectDropdown
                label="Other tools you rely on (optional)"
                options={OTHER_TOOLS_OPTIONS}
                value={form.otherTools}
                onChange={(v) => set('otherTools', v)}
              />

              <MultiSelectDropdown
                label="Are you currently using any automations or AI? (pick all that apply)"
                options={CURRENT_AUTOMATIONS_OPTIONS}
                value={form.currentAutomations}
                onChange={(v) => set('currentAutomations', v)}
              />

              <div className="space-y-2">
                <Label htmlFor="accountingSystem">
                  Accounting / bookkeeping system
                </Label>
                <Select
                  value={form.accountingSystem}
                  onValueChange={(v) => set('accountingSystem', v)}
                >
                  <SelectTrigger id="accountingSystem">
                    <SelectValue placeholder="Select your accounting system" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNTING_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <MultiSelectDropdown
                label="Required integrations for the new CRM (pick all that apply)"
                options={INTEGRATIONS_OPTIONS}
                value={form.requiredIntegrations}
                onChange={(v) => set('requiredIntegrations', v)}
              />

              <div className="space-y-2">
                <Label>When do you want to be live?</Label>
                <RadioGroup
                  value={form.desiredLaunch}
                  onValueChange={(v) => set('desiredLaunch', v)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  {LAUNCH_OPTIONS.map((opt) => (
                    <RadioOption
                      key={opt.value}
                      value={opt.value}
                      label={opt.label}
                      selected={form.desiredLaunch === opt.value}
                    />
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="successDefinition">
                  What would success look like 6 months after launch?{' '}
                  <span className="text-xs text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="successDefinition"
                  rows={4}
                  value={form.successDefinition}
                  onChange={(e) => set('successDefinition', e.target.value)}
                  placeholder="e.g. We've cancelled ServiceTitan, techs love the mobile app, and our office manager has gotten her phone-time back."
                />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm p-3">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setError(null)
                setStep((s) => Math.max(1, s - 1))
              }}
              disabled={step === 1 || submitting}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            {step < STEPS.length ? (
              <Button
                onClick={() => {
                  if (!currentStepValid) {
                    setError(stepErrors[step] ?? 'Please complete this step.')
                    return
                  }
                  setError(null)
                  setStep((s) => Math.min(STEPS.length, s + 1))
                }}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send Discovery
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground">
        Your answers are saved as you go — close the tab and your progress
        stays put.
      </p>
    </div>
  )
}

function RadioOption({
  value,
  label,
  selected,
}: {
  value: string
  label: string
  selected: boolean
}) {
  return (
    <label
      className={
        'flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors text-sm ' +
        (selected
          ? 'border-brand-primary bg-brand-primary/5 text-foreground'
          : 'border-subtle-border bg-surface text-muted-foreground hover:border-brand-primary/40 hover:text-foreground')
      }
    >
      <RadioGroupItem value={value} />
      <span>{label}</span>
    </label>
  )
}
