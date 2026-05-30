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
}> = [];

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

// Flat list of active catalog items for the proposal builder's Service
// dropdown. Unlike listCategoriesWithItems (admin-only, nested), this is
// available to any authenticated user so non-admins can build proposals,
// and it returns each item flattened with its category name for grouping.
export const listItemsForProposals = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const categories = await ctx.db.query("serviceCategories").collect();
    const items = await ctx.db.query("serviceItems").collect();

    const categoryById = new Map(categories.map((c) => [c._id, c]));

    return items
      .filter((i) => i.isActive)
      .map((i) => {
        const cat = categoryById.get(i.categoryId);
        return {
          _id: i._id,
          name: i.name,
          description: i.description,
          defaultPrice: i.defaultPrice,
          categoryId: i.categoryId,
          categoryName: cat?.name ?? "Other",
          categoryOrder: cat?.displayOrder ?? 999,
          categoryActive: cat?.isActive ?? true,
          displayOrder: i.displayOrder,
        };
      })
      .filter((i) => i.categoryActive)
      .sort((a, b) =>
        a.categoryOrder !== b.categoryOrder
          ? a.categoryOrder - b.categoryOrder
          : a.displayOrder - b.displayOrder,
      );
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
