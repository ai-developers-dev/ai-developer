import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================================
// Default values — used when no settings row exists yet, or as
// targets for the "Reset to defaults" button on the admin page.
// Keep in sync with the constants in proposalGenerator.ts.
// ============================================================

export const DEFAULT_PRICING = {
  basePrice: 15_000,
  employeeScale: [
    { key: "1", price: 0 },
    { key: "2-5", price: 0 },
    { key: "6-10", price: 3_000 },
    { key: "11-20", price: 6_000 },
    { key: "21-50", price: 10_000 },
    { key: "50+", price: 15_000 },
  ],
  locationScale: [
    { key: "single", price: 0 },
    { key: "2-3", price: 2_000 },
    { key: "4+", price: 4_000 },
    { key: "multi-state", price: 6_000 },
  ],
  radiusScale: [
    { key: "under_25", price: 0 },
    { key: "25-50", price: 0 },
    { key: "50-100", price: 500 },
    { key: "100+", price: 1_500 },
  ],
  tradeScale: [
    { key: "electrician", price: 0 },
    { key: "plumber", price: 0 },
    { key: "hvac", price: 0 },
    { key: "multi-trade", price: 3_000 },
    { key: "other", price: 2_000 },
  ],
  onSiteQuotingPrice: 2_000,
  recurringContractsPrice: 3_000,
  photoDocsPrice: 1_000,
  voiceAiCrossSellPrice: 8_000,
  automationsCrossSellPrice: 3_000,
  rushFeePct: 0.2,
  integrations: [
    { key: "QuickBooks", label: "QuickBooks Online integration", price: 2_500 },
    {
      key: "Stripe / Square (card payments)",
      label: "Stripe / Square card processing",
      price: 1_000,
    },
    { key: "ACH payments", label: "ACH payments", price: 1_500 },
    {
      key: "Supplier catalog",
      label: "Supplier catalog integration",
      price: 3_000,
    },
    {
      key: "Google Maps routing",
      label: "Google Maps routing & ETAs",
      price: 1_500,
    },
    {
      key: "SMS reminders",
      label: "SMS reminders & notifications",
      price: 1_500,
    },
    {
      key: "Email marketing",
      label: "Email marketing integration",
      price: 1_500,
    },
    {
      key: "Calendar sync (Google/Outlook)",
      label: "Calendar sync (Google / Outlook)",
      price: 1_000,
    },
  ],
};

export type PricingConfig = typeof DEFAULT_PRICING;

// ============================================================
// Helper used by mutations to get the singleton row (or create it)
// ============================================================

async function getOrInit(ctx: any): Promise<{ _id: any; config: PricingConfig }> {
  const existing = await ctx.db.query("pricingSettings").first();
  if (existing) {
    const { _id, _creationTime, ...config } = existing;
    return { _id, config: config as PricingConfig };
  }
  const id = await ctx.db.insert("pricingSettings", DEFAULT_PRICING);
  return { _id: id, config: DEFAULT_PRICING };
}

// ============================================================
// Queries / mutations
// ============================================================

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .unique();
    if (!user || user.role !== "admin") return null;

    const existing = await ctx.db.query("pricingSettings").first();
    if (!existing) return DEFAULT_PRICING; // not yet initialized
    const { _id, _creationTime, ...config } = existing;
    return config as PricingConfig;
  },
});

// Single update mutation used by every input on the settings page.
// Patches only the fields you pass — leaves the rest untouched.
export const update = mutation({
  args: {
    basePrice: v.optional(v.number()),
    employeeScale: v.optional(
      v.array(v.object({ key: v.string(), price: v.number() }))
    ),
    locationScale: v.optional(
      v.array(v.object({ key: v.string(), price: v.number() }))
    ),
    radiusScale: v.optional(
      v.array(v.object({ key: v.string(), price: v.number() }))
    ),
    tradeScale: v.optional(
      v.array(v.object({ key: v.string(), price: v.number() }))
    ),
    onSiteQuotingPrice: v.optional(v.number()),
    recurringContractsPrice: v.optional(v.number()),
    photoDocsPrice: v.optional(v.number()),
    voiceAiCrossSellPrice: v.optional(v.number()),
    automationsCrossSellPrice: v.optional(v.number()),
    rushFeePct: v.optional(v.number()),
    integrations: v.optional(
      v.array(
        v.object({
          key: v.string(),
          label: v.string(),
          price: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .unique();
    if (!user || user.role !== "admin") throw new Error("Not authorized");

    const { _id } = await getOrInit(ctx);
    const patch = Object.fromEntries(
      Object.entries(args).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(_id, patch);
  },
});

export const resetToDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", identity.subject)
      )
      .unique();
    if (!user || user.role !== "admin") throw new Error("Not authorized");

    const existing = await ctx.db.query("pricingSettings").first();
    if (existing) {
      await ctx.db.replace(existing._id, DEFAULT_PRICING);
    } else {
      await ctx.db.insert("pricingSettings", DEFAULT_PRICING);
    }
  },
});
