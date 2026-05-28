import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";

// ============================================================
// Stripe catalog sync
//
// Mirrors serviceItems into Stripe Products + Prices so the Stripe
// dashboard shows everything we sell. Triggered automatically by the
// addItem / updateItem / removeItem mutations in serviceCatalog.ts,
// and on-demand by the admin "Sync to Stripe" button.
//
// Notes:
//  - Stripe Prices are IMMUTABLE. When defaultPrice changes we
//    archive the old Price and create a new one.
//  - Stripe Products can be updated freely (name/description/active).
//  - On item removal we archive both Price and Product. We don't
//    delete because Stripe forbids deleting anything that has ever
//    been used on a charge.
// ============================================================

const STRIPE_API = "https://api.stripe.com/v1";

async function stripePost(
  path: string,
  body: Record<string, string | number | boolean | undefined>,
): Promise<any> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY not set in Convex env");
  const params = new URLSearchParams();
  for (const [k, val] of Object.entries(body)) {
    if (val === undefined) continue;
    params.append(k, String(val));
  }
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe POST ${path} ${res.status}: ${text}`);
  }
  return await res.json();
}

async function stripeGet(path: string): Promise<any> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY not set in Convex env");
  const res = await fetch(`${STRIPE_API}${path}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe GET ${path} ${res.status}: ${text}`);
  }
  return await res.json();
}

// ============================================================
// Public-ish actions (called from scheduler only — internal)
// ============================================================

export const syncItem = internalAction({
  args: { itemId: v.id("serviceItems") },
  handler: async (ctx, { itemId }) => {
    const item = await ctx.runQuery(internal.stripeCatalogSync._getItem, {
      itemId,
    });
    if (!item) return;

    // 1) Upsert the Product
    let productId = item.stripeProductId;
    if (productId) {
      await stripePost(`/products/${productId}`, {
        name: item.name,
        description: item.description,
        active: item.isActive,
      });
    } else {
      const product = await stripePost("/products", {
        name: item.name,
        description: item.description,
        active: item.isActive,
        "metadata[convex_item_id]": itemId,
      });
      productId = product.id as string;
    }

    // 2) Reconcile the Price (immutable — recreate if amount changed)
    const amountCents = Math.round(item.defaultPrice * 100);
    let priceId = item.stripePriceId;
    let needsNewPrice = !priceId;

    if (priceId) {
      try {
        const current = await stripeGet(`/prices/${priceId}`);
        if (current.unit_amount !== amountCents || current.currency !== "usd") {
          needsNewPrice = true;
          await stripePost(`/prices/${priceId}`, { active: false });
        }
      } catch {
        needsNewPrice = true;
      }
    }

    if (needsNewPrice) {
      const price = await stripePost("/prices", {
        product: productId!,
        unit_amount: amountCents,
        currency: "usd",
      });
      priceId = price.id as string;
    }

    await ctx.runMutation(internal.stripeCatalogSync._setItemStripeIds, {
      itemId,
      stripeProductId: productId!,
      stripePriceId: priceId!,
    });
  },
});

export const archiveStripeEntities = internalAction({
  args: {
    stripeProductId: v.string(),
    stripePriceId: v.optional(v.string()),
  },
  handler: async (_ctx, { stripeProductId, stripePriceId }) => {
    if (stripePriceId) {
      try {
        await stripePost(`/prices/${stripePriceId}`, { active: false });
      } catch (err) {
        console.error("Archive price failed:", stripePriceId, err);
      }
    }
    try {
      await stripePost(`/products/${stripeProductId}`, { active: false });
    } catch (err) {
      console.error("Archive product failed:", stripeProductId, err);
    }
  },
});

export const syncAll = internalAction({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.runQuery(
      internal.stripeCatalogSync._listAllItems,
      {},
    );
    for (const item of items) {
      try {
        await ctx.runAction(internal.stripeCatalogSync.syncItem, {
          itemId: item._id,
        });
      } catch (err) {
        console.error("syncAll item failed:", item._id, err);
      }
    }
  },
});

// ============================================================
// Internal helpers
// ============================================================

export const _getItem = internalQuery({
  args: { itemId: v.id("serviceItems") },
  handler: async (ctx, { itemId }) => await ctx.db.get(itemId),
});

export const _listAllItems = internalQuery({
  args: {},
  handler: async (ctx) => await ctx.db.query("serviceItems").collect(),
});

export const _setItemStripeIds = internalMutation({
  args: {
    itemId: v.id("serviceItems"),
    stripeProductId: v.string(),
    stripePriceId: v.string(),
  },
  handler: async (ctx, { itemId, stripeProductId, stripePriceId }) => {
    await ctx.db.patch(itemId, { stripeProductId, stripePriceId });
  },
});
