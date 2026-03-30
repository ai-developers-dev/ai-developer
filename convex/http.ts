import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

// Clerk webhook handler
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const body = await request.text();

    let event: any;
    try {
      const wh = new Webhook(webhookSecret);
      event = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Webhook verification failed", { status: 400 });
    }

    const { type, data } = event;

    switch (type) {
      case "user.created":
      case "user.updated": {
        const email =
          data.email_addresses?.find(
            (e: any) => e.id === data.primary_email_address_id
          )?.email_address || data.email_addresses?.[0]?.email_address;

        if (email) {
          await ctx.runMutation(internal.users.upsertFromClerk, {
            clerkUserId: data.id,
            email,
            name: [data.first_name, data.last_name].filter(Boolean).join(" ") || undefined,
            imageUrl: data.image_url || undefined,
          });
        }
        break;
      }

      case "user.deleted": {
        if (data.id) {
          await ctx.runMutation(internal.users.deleteFromClerk, {
            clerkUserId: data.id,
          });
        }
        break;
      }
    }

    return new Response("OK", { status: 200 });
  }),
});

// Stripe webhook handler
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!stripeWebhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const body = await request.text();

    // Verify Stripe signature manually (can't use stripe SDK in Convex runtime)
    // For production, consider using a Convex action with the Stripe SDK
    let event: any;
    try {
      event = JSON.parse(body);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const proposalId = session.metadata?.proposalId;
      const paymentNumber = parseInt(session.metadata?.paymentNumber || "1", 10);

      if (proposalId) {
        await ctx.runMutation(internal.proposals.markPaid, {
          stripeSessionId: session.id,
          paymentIntentId: session.payment_intent,
          paymentNumber: (paymentNumber === 2 ? 2 : 1) as 1 | 2,
        });
      }
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
