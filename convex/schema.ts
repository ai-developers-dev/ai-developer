import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("user")),
    isActive: v.boolean(),
    linkedClientId: v.optional(v.id("clients")),
    // Extended user fields
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(
      v.object({
        street: v.string(),
        city: v.string(),
        state: v.string(),
        zip: v.string(),
      })
    ),
    billableRate: v.optional(v.number()),
  })
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  discoverySubmissions: defineTable({
    // Step 1 — business basics
    businessName: v.string(),
    businessAddress: v.optional(v.string()),
    hasWebsite: v.union(v.literal("yes"), v.literal("no")),
    businessPhone: v.string(),
    businessEmail: v.string(),
    employeeCount: v.union(
      v.literal("1"),
      v.literal("2-5"),
      v.literal("6-10"),
      v.literal("11-20"),
      v.literal("21-50"),
      v.literal("50+")
    ),
    // Step 2 — what you do + current tools
    primaryTrade: v.union(
      v.literal("electrician"),
      v.literal("plumber"),
      v.literal("hvac"),
      v.literal("multi-trade"),
      v.literal("other")
    ),
    servicesOffered: v.array(v.string()),
    currentCrm: v.string(),
    otherTools: v.array(v.string()),
    leadSources: v.array(v.string()),
    // Legacy single-value field — kept optional so older rows still validate.
    topBottleneck: v.optional(
      v.union(
        v.literal("scheduling"),
        v.literal("quoting"),
        v.literal("payment"),
        v.literal("job_tracking"),
        v.literal("crew_coordination"),
        v.literal("customer_communication"),
        v.literal("other")
      )
    ),
    topBottlenecks: v.optional(v.array(v.string())),
    // Step 3 — operations complexity
    locationCount: v.union(
      v.literal("single"),
      v.literal("2-3"),
      v.literal("4+"),
      v.literal("multi-state")
    ),
    serviceRadiusMiles: v.union(
      v.literal("under_25"),
      v.literal("25-50"),
      v.literal("50-100"),
      v.literal("100+")
    ),
    techsQuoteOnSite: v.union(
      v.literal("always"),
      v.literal("sometimes"),
      v.literal("never")
    ),
    changeOrderFrequency: v.union(
      v.literal("rarely"),
      v.literal("sometimes_30"),
      v.literal("often_50")
    ),
    recurringContracts: v.union(
      v.literal("none"),
      v.literal("under_20"),
      v.literal("20-50"),
      v.literal("over_50")
    ),
    collectsGoogleReviews: v.union(
      v.literal("yes_routinely"),
      v.literal("occasionally"),
      v.literal("no")
    ),
    websiteHasChat: v.optional(v.union(v.literal("yes"), v.literal("no"))),
    websiteHasOnlineBooking: v.optional(
      v.union(v.literal("yes"), v.literal("no"))
    ),
    missedCallHandling: v.union(
      v.literal("voicemail"),
      v.literal("answering_service"),
      v.literal("ai_receptionist"),
      v.literal("callback_later"),
      v.literal("unanswered"),
      v.literal("other")
    ),
    afterHoursHandling: v.union(
      v.literal("staff_on_call"),
      v.literal("answering_service"),
      v.literal("ai_agent"),
      v.literal("voicemail"),
      v.literal("no_after_hours"),
      v.literal("other")
    ),
    // Step 4 — tech + project
    accountingSystem: v.string(),
    requiredIntegrations: v.array(v.string()),
    currentAutomations: v.array(v.string()),
    desiredLaunch: v.union(
      v.literal("asap"),
      v.literal("3_months"),
      v.literal("3-6_months"),
      v.literal("6-12_months"),
      v.literal("flexible")
    ),
    successDefinition: v.optional(v.string()),
    // Source attribution (which page they came from)
    source: v.optional(v.string()),
    // Triage
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("quoted"),
      v.literal("converted"),
      v.literal("archived")
    ),
    notes: v.optional(v.string()),
  }).index("by_status", ["status"]),

  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    service: v.string(),
    description: v.string(),
    budget: v.optional(v.string()),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("converted"),
      v.literal("archived")
    ),
    notes: v.optional(v.string()),
  }).index("by_status", ["status"]),

  clients: defineTable({
    name: v.string(),
    contactEmail: v.string(),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    isActive: v.boolean(),
    // Extended client fields
    ownerFirstName: v.optional(v.string()),
    ownerLastName: v.optional(v.string()),
    businessName: v.optional(v.string()),
    businessPhone: v.optional(v.string()),
    businessAddress: v.optional(
      v.object({
        street: v.string(),
        city: v.string(),
        state: v.string(),
        zip: v.string(),
      })
    ),
    businessEmail: v.optional(v.string()),
    ownerEmail: v.optional(v.string()),
    howHeardOfUs: v.optional(v.string()),
  }).index("by_email", ["contactEmail"]),

  projects: defineTable({
    clientId: v.id("clients"),
    title: v.string(),
    service: v.string(),
    description: v.optional(v.string()),
    stage: v.union(
      v.literal("lead"),
      v.literal("proposal"),
      v.literal("contracted"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("completed")
    ),
    budget: v.optional(v.number()),
    assignedTo: v.optional(v.string()),
    startDate: v.optional(v.string()),
    dueDate: v.optional(v.string()),
  })
    .index("by_clientId", ["clientId"])
    .index("by_stage", ["stage"])
    .index("by_assignedTo", ["assignedTo"]),

  proposals: defineTable({
    projectId: v.optional(v.id("projects")),
    clientId: v.id("clients"),
    title: v.string(),
    description: v.optional(v.string()),
    service: v.optional(v.string()),
    lineItems: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        total: v.number(),
      })
    ),
    totalAmount: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("viewed"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("expired")
    ),
    sentAt: v.optional(v.number()),
    viewedAt: v.optional(v.number()),
    acceptedAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    stripeSessionId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    validUntil: v.optional(v.number()),
    // Split payment fields
    paymentMode: v.optional(v.union(v.literal("full"), v.literal("split"))),
    firstPaymentAmount: v.optional(v.number()),
    secondPaymentAmount: v.optional(v.number()),
    firstPaymentStatus: v.optional(v.union(v.literal("pending"), v.literal("paid"))),
    secondPaymentStatus: v.optional(
      v.union(v.literal("pending"), v.literal("paid"), v.literal("invoiced"))
    ),
    firstPaidAt: v.optional(v.number()),
    secondPaidAt: v.optional(v.number()),
    secondStripeSessionId: v.optional(v.string()),
    secondStripePaymentIntentId: v.optional(v.string()),
    secondInvoiceSentAt: v.optional(v.number()),
    // Flexible N-part payment schedule (supersedes paymentMode/first*/second*).
    // Legacy fields above kept optional for historical reads; migration backfills installments.
    installments: v.optional(
      v.array(
        v.object({
          id: v.string(),
          label: v.string(),
          percent: v.number(),
          order: v.number(),
          trigger: v.union(
            v.object({ type: v.literal("on_acceptance") }),
            v.object({
              type: v.literal("net_days_after_previous"),
              days: v.number(),
            }),
            v.object({ type: v.literal("on_completion") }),
            v.object({
              type: v.literal("on_stage"),
              stage: v.union(
                v.literal("lead"),
                v.literal("proposal"),
                v.literal("review"),
                v.literal("contracted"),
                v.literal("in_progress"),
                v.literal("completed")
              ),
            })
          ),
          status: v.union(
            v.literal("pending"),
            v.literal("invoiced"),
            v.literal("paid"),
            v.literal("skipped")
          ),
          stripeSessionId: v.optional(v.string()),
          stripePaymentIntentId: v.optional(v.string()),
          dueAt: v.optional(v.number()),
          invoicedAt: v.optional(v.number()),
          paidAt: v.optional(v.number()),
          scheduledJobId: v.optional(v.id("_scheduled_functions")),
        })
      )
    ),
  })
    .index("by_clientId", ["clientId"])
    .index("by_projectId", ["projectId"])
    .index("by_status", ["status"])
    .index("by_stripeSessionId", ["stripeSessionId"])
    .index("by_secondStripeSessionId", ["secondStripeSessionId"]),

  services: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    defaultRate: v.optional(v.number()),
    isActive: v.boolean(),
  }).index("by_name", ["name"]),

  timeEntries: defineTable({
    projectId: v.id("projects"),
    userId: v.string(),
    description: v.string(),
    hours: v.number(),
    date: v.string(),
    billable: v.boolean(),
    hourlyRate: v.optional(v.number()),
  })
    .index("by_projectId", ["projectId"])
    .index("by_userId", ["userId"])
    .index("by_date", ["date"])
    .index("by_projectId_date", ["projectId", "date"]),
});
