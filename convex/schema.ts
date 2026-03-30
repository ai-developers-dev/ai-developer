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
