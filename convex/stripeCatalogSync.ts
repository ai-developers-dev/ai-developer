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

/** $1,500 / $7.99 — cents only when there are some. */
function usd(n: number): string {
  const cents = Math.round(n * 100);
  const whole = Math.floor(cents / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const frac = cents % 100;
  return `$${whole}${frac ? "." + String(frac).padStart(2, "0") : ""}`;
}

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

    // 2) Reconcile the Price (immutable — recreate if the amount OR the
    //    billing interval changed, e.g. a one-time service turned into a
    //    monthly retainer)
    const amountCents = Math.round(item.defaultPrice * 100);
    const isMonthly = item.billingInterval === "month";
    let priceId = item.stripePriceId;
    let needsNewPrice = !priceId;

    if (priceId) {
      try {
        const current = await stripeGet(`/prices/${priceId}`);
        const currentIsMonthly = current.recurring?.interval === "month";
        if (
          current.unit_amount !== amountCents ||
          current.currency !== "usd" ||
          currentIsMonthly !== isMonthly ||
          // Someone archived it in the Stripe dashboard — recreate rather
          // than keep selling against a dead price.
          current.active === false
        ) {
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
        // A recurring price is what makes Stripe bill this automatically
        // every month once someone subscribes.
        "recurring[interval]": isMonthly ? "month" : undefined,
      });
      priceId = price.id as string;
    }

    // 3) Payment Link — monthly retainers get a shareable subscribe URL
    //    (send it to the client; Stripe starts the monthly billing when they
    //    pay). Links are pinned to a specific price, so whenever the price is
    //    recreated the old link is deactivated and a fresh one minted. A
    //    one-time item keeps no link — if it used to be monthly, its link is
    //    shut off so nobody can subscribe to a retired retainer.
    let paymentLinkId = item.stripePaymentLinkId;
    let paymentLinkUrl = item.stripePaymentLinkUrl;

    // Markdown shown on the subscribe checkout, just above the Subscribe
    // button. Payment Links can't carry a pre-applied coupon (only a code the
    // client would have to type), so the deal is stated in text while the
    // Price stays at what's actually charged.
    const markdownMessage =
      item.compareAtPrice !== undefined && item.compareAtPrice > item.defaultPrice
        ? `Regularly ${usd(item.compareAtPrice)}/mo — you're saving ${usd(
            item.compareAtPrice - item.defaultPrice,
          )} every month.`
        : undefined;

    if (isMonthly && (needsNewPrice || !paymentLinkId)) {
      if (paymentLinkId) {
        try {
          await stripePost(`/payment_links/${paymentLinkId}`, { active: false });
        } catch (err) {
          console.error("Deactivate payment link failed:", paymentLinkId, err);
        }
      }
      const link = await stripePost("/payment_links", {
        "line_items[0][price]": priceId!,
        "line_items[0][quantity]": 1,
        "metadata[convex_item_id]": itemId,
        "custom_text[submit][message]": markdownMessage,
      });
      paymentLinkId = link.id as string;
      paymentLinkUrl = link.url as string;
    } else if (isMonthly && paymentLinkId) {
      // Same price, existing link: update the markdown IN PLACE so a URL
      // that's already been sent to clients keeps working. An empty value
      // is Stripe's way of unsetting the message when the markdown is removed.
      await stripePost(`/payment_links/${paymentLinkId}`, {
        ...(markdownMessage
          ? { "custom_text[submit][message]": markdownMessage }
          : { "custom_text[submit]": "" }),
      });
    } else if (!isMonthly && paymentLinkId) {
      try {
        await stripePost(`/payment_links/${paymentLinkId}`, { active: false });
      } catch (err) {
        console.error("Deactivate payment link failed:", paymentLinkId, err);
      }
      paymentLinkId = undefined;
      paymentLinkUrl = undefined;
    }

    await ctx.runMutation(internal.stripeCatalogSync._setItemStripeIds, {
      itemId,
      stripeProductId: productId!,
      stripePriceId: priceId!,
      stripePaymentLinkId: paymentLinkId,
      stripePaymentLinkUrl: paymentLinkUrl,
      clearPaymentLink: !isMonthly,
    });
  },
});

export const archiveStripeEntities = internalAction({
  args: {
    stripeProductId: v.string(),
    stripePriceId: v.optional(v.string()),
    stripePaymentLinkId: v.optional(v.string()),
  },
  handler: async (_ctx, { stripeProductId, stripePriceId, stripePaymentLinkId }) => {
    // Shut the subscribe link off FIRST — it's the only publicly reachable
    // surface, and a live link to an archived price is a broken checkout.
    if (stripePaymentLinkId) {
      try {
        await stripePost(`/payment_links/${stripePaymentLinkId}`, { active: false });
      } catch (err) {
        console.error("Archive payment link failed:", stripePaymentLinkId, err);
      }
    }
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
    stripePaymentLinkId: v.optional(v.string()),
    stripePaymentLinkUrl: v.optional(v.string()),
    // Optional args can't distinguish "absent" from "clear these fields", so
    // one-time items say so explicitly to drop a stale link off the row.
    clearPaymentLink: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { itemId, stripeProductId, stripePriceId, stripePaymentLinkId, stripePaymentLinkUrl, clearPaymentLink },
  ) => {
    const patch: Record<string, unknown> = { stripeProductId, stripePriceId };
    if (stripePaymentLinkId !== undefined) patch.stripePaymentLinkId = stripePaymentLinkId;
    if (stripePaymentLinkUrl !== undefined) patch.stripePaymentLinkUrl = stripePaymentLinkUrl;
    if (clearPaymentLink) {
      patch.stripePaymentLinkId = undefined;
      patch.stripePaymentLinkUrl = undefined;
    }
    await ctx.db.patch(itemId, patch);
  },
});
