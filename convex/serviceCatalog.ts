import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// ============================================================
// Default catalog — seeded once on first load of /dashboard/services
// when the table is empty. Pulled from pricingSettings + the marketing
// site so /dashboard/services starts populated with everything we
// already sell.
// ============================================================

const DEFAULTS: Array<{
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  items: { name: string; price: number; description?: string }[];
}> = [
  {
    name: "Custom CRM",
    slug: "custom-crm",
    description: "A bespoke CRM that the client owns forever.",
    icon: "Users",
    items: [
      { name: "Base CRM platform — core build", price: 15_000 },
      { name: "On-site mobile quoting + deposits", price: 2_000 },
      { name: "Recurring maintenance contract engine", price: 3_000 },
      { name: "Photo documentation & job timeline", price: 1_000 },
      { name: "Marketing landing page + online booking", price: 2_500 },
      { name: "Automated review request engine", price: 1_500 },
      { name: "Reporting dashboard", price: 2_000 },
      { name: "Calendar + dispatch board", price: 2_500 },
      { name: "QuickBooks Online integration", price: 2_500 },
      { name: "Stripe / Square card processing", price: 1_000 },
      { name: "ACH payments", price: 1_500 },
      { name: "Supplier catalog integration", price: 3_000 },
      { name: "Google Maps routing & ETAs", price: 1_500 },
      { name: "SMS reminders & notifications", price: 1_500 },
      { name: "Email marketing integration", price: 1_500 },
      { name: "Calendar sync (Google / Outlook)", price: 1_000 },
    ],
  },
  {
    name: "AI Voice",
    slug: "ai-voice",
    description: "Phone agents that answer calls, book, and triage 24/7.",
    icon: "Phone",
    items: [
      { name: "SMS setup (Twilio)", price: 1_500 },
      { name: "Inbound call agent (24/7 receptionist)", price: 8_000 },
      { name: "Outbound call agent", price: 7_500 },
      { name: "Voicemail-to-text + auto-followup", price: 2_000 },
      { name: "After-hours emergency triage", price: 4_000 },
      { name: "Voice-to-CRM auto-logging", price: 3_000 },
    ],
  },
  {
    name: "AI Chat",
    slug: "ai-chat",
    description: "Chatbots across website, SMS, and social channels.",
    icon: "MessageSquare",
    items: [
      { name: "Website chat agent", price: 3_500 },
      { name: "SMS chat agent", price: 3_000 },
      { name: "Social DMs chat agent", price: 2_500 },
      { name: "Multi-channel chat hub", price: 5_000 },
    ],
  },
  {
    name: "Web Apps",
    slug: "web-apps",
    description: "Custom dashboards, portals, and marketing sites.",
    icon: "AppWindow",
    items: [
      { name: "Marketing landing page", price: 2_500 },
      { name: "Customer portal", price: 4_000 },
      { name: "Online booking widget", price: 1_500 },
      { name: "Reviews & marketing automation", price: 1_500 },
      { name: "Reporting dashboard", price: 2_000 },
    ],
  },
  {
    name: "AI Assistants",
    slug: "ai-assistants",
    description: "Internal AI tools that augment your team.",
    icon: "Brain",
    items: [
      { name: "Document processing AI", price: 4_000 },
      { name: "Quote estimation AI", price: 5_000 },
      { name: "Lead-scoring AI", price: 3_500 },
      { name: "Internal search / knowledge assistant", price: 2_500 },
    ],
  },
  {
    name: "AI Automations",
    slug: "ai-automations",
    description: "Workflow plumbing that eliminates manual busywork.",
    icon: "Zap",
    items: [
      { name: "Zapier / Make wiring", price: 1_500 },
      { name: "Email sequences", price: 1_500 },
      { name: "Review-request automation", price: 1_500 },
      { name: "Job-status notifications", price: 1_500 },
      { name: "Custom n8n pipeline", price: 3_000 },
    ],
  },
  {
    name: "SEO",
    slug: "seo",
    description:
      "Local and global SEO with AI-assisted content writing. Built to rank and convert.",
    icon: "Search",
    items: [
      {
        name: "Local SEO setup (GBP + citations + map pack)",
        price: 2_500,
      },
      {
        name: "National / global SEO program (technical + on-page)",
        price: 4_000,
      },
      {
        name: "Technical SEO audit + fixes (Core Web Vitals, schema, crawl)",
        price: 2_000,
      },
      {
        name: "Keyword research + content strategy",
        price: 1_500,
      },
      {
        name: "AI-assisted long-form article (1,500–3,000 words, human-edited)",
        price: 350,
      },
      {
        name: "Service + location landing page",
        price: 500,
      },
      {
        name: "Monthly SEO retainer — Local (4 articles + GBP management)",
        price: 1_500,
      },
      {
        name: "Monthly SEO retainer — Growth (8 articles + link-building + reporting)",
        price: 3_500,
      },
      {
        name: "Monthly SEO retainer — Authority (12+ articles + digital PR)",
        price: 6_500,
      },
      {
        name: "Backlink outreach campaign",
        price: 2_000,
      },
      {
        name: "Rank tracking + monthly reporting dashboard",
        price: 750,
      },
    ],
  },
];

// ============================================================
// Helpers
// ============================================================

async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkUserId", (q: any) =>
      q.eq("clerkUserId", identity.subject),
    )
    .unique();
  if (!user || user.role !== "admin") throw new Error("Not authorized");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// ============================================================
// Queries
// ============================================================

export const listCategoriesWithItems = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) =>
        q.eq("clerkUserId", identity.subject),
      )
      .unique();
    if (!user || user.role !== "admin") return [];

    const categories = await ctx.db.query("serviceCategories").collect();
    const items = await ctx.db.query("serviceItems").collect();

    return categories
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((cat) => ({
        ...cat,
        items: items
          .filter((i) => i.categoryId === cat._id)
          .sort((a, b) => a.displayOrder - b.displayOrder),
      }));
  },
});

// ============================================================
// Mutations
// ============================================================

export const seedDefaultsIfEmpty = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.query("serviceCategories").first();
    if (existing) return { seeded: false };

    for (let ci = 0; ci < DEFAULTS.length; ci++) {
      const def = DEFAULTS[ci];
      const categoryId = await ctx.db.insert("serviceCategories", {
        name: def.name,
        slug: def.slug,
        description: def.description,
        icon: def.icon,
        displayOrder: ci,
        isActive: true,
      });
      for (let i = 0; i < def.items.length; i++) {
        const it = def.items[i];
        await ctx.db.insert("serviceItems", {
          categoryId,
          name: it.name,
          description: it.description,
          defaultPrice: it.price,
          isActive: true,
          displayOrder: i,
        });
      }
    }
    // Push everything to Stripe in the background once the seed lands.
    await ctx.scheduler.runAfter(0, internal.stripeCatalogSync.syncAll, {});
    return { seeded: true, categoryCount: DEFAULTS.length };
  },
});

// Admin-triggered: re-sync the whole catalog into Stripe.
// Used by the "Sync to Stripe" button on /dashboard/services.
export const backfillStripeCatalog = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    await ctx.scheduler.runAfter(0, internal.stripeCatalogSync.syncAll, {});
  },
});

// --- Categories ---

export const addCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.query("serviceCategories").collect();
    const maxOrder = existing.reduce(
      (m, c) => Math.max(m, c.displayOrder),
      -1,
    );
    return await ctx.db.insert("serviceCategories", {
      name: args.name,
      slug: slugify(args.name),
      description: args.description,
      icon: args.icon,
      displayOrder: maxOrder + 1,
      isActive: true,
    });
  },
});

export const updateCategory = mutation({
  args: {
    id: v.id("serviceCategories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...rest }) => {
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) patch[k] = v;
    }
    if (patch.name) patch.slug = slugify(patch.name as string);
    await ctx.db.patch(id, patch);
  },
});

export const removeCategory = mutation({
  args: { id: v.id("serviceCategories") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    // Cascade — delete all items under this category first.
    const items = await ctx.db
      .query("serviceItems")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", id))
      .collect();
    for (const item of items) {
      if (item.stripeProductId) {
        await ctx.scheduler.runAfter(
          0,
          internal.stripeCatalogSync.archiveStripeEntities,
          {
            stripeProductId: item.stripeProductId,
            stripePriceId: item.stripePriceId,
          },
        );
      }
      await ctx.db.delete(item._id);
    }
    await ctx.db.delete(id);
  },
});

// --- Items ---

export const addItem = mutation({
  args: {
    categoryId: v.id("serviceCategories"),
    name: v.string(),
    description: v.optional(v.string()),
    defaultPrice: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const siblings = await ctx.db
      .query("serviceItems")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId))
      .collect();
    const maxOrder = siblings.reduce(
      (m, s) => Math.max(m, s.displayOrder),
      -1,
    );
    const itemId = await ctx.db.insert("serviceItems", {
      categoryId: args.categoryId,
      name: args.name,
      description: args.description,
      defaultPrice: args.defaultPrice,
      isActive: true,
      displayOrder: maxOrder + 1,
    });
    await ctx.scheduler.runAfter(0, internal.stripeCatalogSync.syncItem, {
      itemId,
    });
    return itemId;
  },
});

export const updateItem = mutation({
  args: {
    id: v.id("serviceItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    defaultPrice: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...rest }) => {
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) patch[k] = v;
    }
    await ctx.db.patch(id, patch);
    await ctx.scheduler.runAfter(0, internal.stripeCatalogSync.syncItem, {
      itemId: id,
    });
  },
});

export const removeItem = mutation({
  args: { id: v.id("serviceItems") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(id);
    if (item?.stripeProductId) {
      await ctx.scheduler.runAfter(
        0,
        internal.stripeCatalogSync.archiveStripeEntities,
        {
          stripeProductId: item.stripeProductId,
          stripePriceId: item.stripePriceId,
        },
      );
    }
    await ctx.db.delete(id);
  },
});
