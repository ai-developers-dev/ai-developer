import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

const statusValidator = v.union(
  v.literal("draft"),
  v.literal("sent"),
  v.literal("viewed"),
  v.literal("accepted"),
  v.literal("rejected"),
  v.literal("expired")
);

const lineItemValidator = v.object({
  description: v.string(),
  quantity: v.number(),
  unitPrice: v.number(),
  total: v.number(),
});

export const list = query({
  args: {
    status: v.optional(statusValidator),
  },
  handler: async (ctx, { status }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") return [];

    let proposals;
    if (status) {
      proposals = await ctx.db
        .query("proposals")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .collect();
    } else {
      proposals = await ctx.db.query("proposals").order("desc").collect();
    }

    return await Promise.all(
      proposals.map(async (proposal) => {
        const client = await ctx.db.get(proposal.clientId);
        const project = proposal.projectId
          ? await ctx.db.get(proposal.projectId)
          : null;
        return { ...proposal, client, project };
      })
    );
  },
});

export const getById = query({
  args: { id: v.id("proposals") },
  handler: async (ctx, { id }) => {
    const proposal = await ctx.db.get(id);
    if (!proposal) return null;

    const client = await ctx.db.get(proposal.clientId);
    const project = proposal.projectId
      ? await ctx.db.get(proposal.projectId)
      : null;

    return { ...proposal, client, project };
  },
});

export const getByClient = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) return [];

    const client = await ctx.db
      .query("clients")
      .withIndex("by_email", (q) => q.eq("contactEmail", user.email))
      .unique();

    if (!client) return [];

    const proposals = await ctx.db
      .query("proposals")
      .withIndex("by_clientId", (q) => q.eq("clientId", client._id))
      .order("desc")
      .collect();

    return await Promise.all(
      proposals.map(async (proposal) => {
        const project = proposal.projectId
          ? await ctx.db.get(proposal.projectId)
          : null;
        return { ...proposal, project };
      })
    );
  },
});

export const create = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    clientId: v.id("clients"),
    title: v.string(),
    description: v.optional(v.string()),
    service: v.optional(v.string()),
    lineItems: v.array(lineItemValidator),
    totalAmount: v.number(),
    validUntil: v.optional(v.number()),
    paymentMode: v.optional(v.union(v.literal("full"), v.literal("split"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") throw new Error("Not authorized");

    // Auto-create a project in "proposal" stage if none is linked
    let projectId = args.projectId;
    if (!projectId) {
      projectId = await ctx.db.insert("projects", {
        clientId: args.clientId,
        title: args.title,
        service: args.service || "General",
        stage: "proposal",
        budget: args.totalAmount,
      });
    }

    const mode = args.paymentMode || "full";
    const splitFields =
      mode === "split"
        ? {
            paymentMode: "split" as const,
            firstPaymentAmount: Math.ceil((args.totalAmount * 100) / 2) / 100,
            secondPaymentAmount: Math.floor((args.totalAmount * 100) / 2) / 100,
            firstPaymentStatus: "pending" as const,
            secondPaymentStatus: "pending" as const,
          }
        : { paymentMode: "full" as const };

    return await ctx.db.insert("proposals", {
      ...args,
      projectId,
      status: "draft",
      ...splitFields,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("proposals"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    service: v.optional(v.string()),
    lineItems: v.optional(v.array(lineItemValidator)),
    totalAmount: v.optional(v.number()),
    validUntil: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") throw new Error("Not authorized");

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(id, cleanUpdates);
  },
});

export const markSent = mutation({
  args: { id: v.id("proposals") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") throw new Error("Not authorized");

    await ctx.db.patch(id, {
      status: "sent",
      sentAt: Date.now(),
    });
  },
});

export const markViewed = mutation({
  args: { id: v.id("proposals") },
  handler: async (ctx, { id }) => {
    const proposal = await ctx.db.get(id);
    if (proposal && proposal.status === "sent") {
      await ctx.db.patch(id, {
        status: "viewed",
        viewedAt: Date.now(),
      });

      // Move linked project to "review" when client opens the proposal
      if (proposal.projectId) {
        const project = await ctx.db.get(proposal.projectId);
        if (project && (project.stage === "lead" || project.stage === "proposal")) {
          await ctx.db.patch(proposal.projectId, { stage: "review" });
        }
      }
    }
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("proposals"),
    status: statusValidator,
  },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status });
  },
});

export const markPaid = internalMutation({
  args: {
    stripeSessionId: v.string(),
    paymentIntentId: v.optional(v.string()),
    paymentNumber: v.union(v.literal(1), v.literal(2)),
  },
  handler: async (ctx, { stripeSessionId, paymentIntentId, paymentNumber }) => {
    // Find proposal by first or second stripe session ID
    let proposal;
    if (paymentNumber === 2) {
      proposal = await ctx.db
        .query("proposals")
        .withIndex("by_secondStripeSessionId", (q) =>
          q.eq("secondStripeSessionId", stripeSessionId)
        )
        .unique();
    } else {
      proposal = await ctx.db
        .query("proposals")
        .withIndex("by_stripeSessionId", (q) =>
          q.eq("stripeSessionId", stripeSessionId)
        )
        .unique();
    }

    if (!proposal) return;

    if (proposal.paymentMode === "split") {
      if (paymentNumber === 1 && proposal.firstPaidAt === undefined) {
        await ctx.db.patch(proposal._id, {
          status: "accepted",
          acceptedAt: Date.now(),
          paidAt: Date.now(),
          stripePaymentIntentId: paymentIntentId,
          firstPaymentStatus: "paid",
          firstPaidAt: Date.now(),
        });
        // Move project to "contracted"
        if (proposal.projectId) {
          const project = await ctx.db.get(proposal.projectId);
          if (project && (project.stage === "lead" || project.stage === "proposal")) {
            await ctx.db.patch(proposal.projectId, { stage: "contracted" });
          }
        }
      } else if (paymentNumber === 2 && proposal.secondPaidAt === undefined) {
        await ctx.db.patch(proposal._id, {
          secondPaymentStatus: "paid",
          secondPaidAt: Date.now(),
          secondStripePaymentIntentId: paymentIntentId,
        });
        // Move project to "contracted" if still in an earlier stage
        if (proposal.projectId) {
          const project = await ctx.db.get(proposal.projectId);
          if (project && (project.stage === "lead" || project.stage === "proposal")) {
            await ctx.db.patch(proposal.projectId, { stage: "contracted" });
          }
        }
      }
    } else {
      // Full payment — existing behavior
      await ctx.db.patch(proposal._id, {
        status: "accepted",
        acceptedAt: Date.now(),
        paidAt: Date.now(),
        stripePaymentIntentId: paymentIntentId,
      });
      if (proposal.projectId) {
        const project = await ctx.db.get(proposal.projectId);
        if (project && (project.stage === "lead" || project.stage === "proposal")) {
          await ctx.db.patch(proposal.projectId, { stage: "contracted" });
        }
      }
    }
  },
});

export const setStripeSessionId = mutation({
  args: {
    id: v.id("proposals"),
    stripeSessionId: v.string(),
    paymentNumber: v.optional(v.union(v.literal(1), v.literal(2))),
  },
  handler: async (ctx, { id, stripeSessionId, paymentNumber }) => {
    if (paymentNumber === 2) {
      await ctx.db.patch(id, { secondStripeSessionId: stripeSessionId });
    } else {
      await ctx.db.patch(id, { stripeSessionId });
    }
  },
});

export const getPublic = query({
  args: { id: v.id("proposals") },
  handler: async (ctx, { id }) => {
    const proposal = await ctx.db.get(id);
    if (!proposal) return null;
    const client = await ctx.db.get(proposal.clientId);
    return {
      _id: proposal._id,
      title: proposal.title,
      description: proposal.description,
      lineItems: proposal.lineItems,
      totalAmount: proposal.totalAmount,
      status: proposal.status,
      paidAt: proposal.paidAt,
      validUntil: proposal.validUntil,
      clientName: client?.name || client?.businessName,
      clientEmail: client?.contactEmail,
      paymentMode: proposal.paymentMode,
      firstPaymentAmount: proposal.firstPaymentAmount,
      secondPaymentAmount: proposal.secondPaymentAmount,
      firstPaymentStatus: proposal.firstPaymentStatus,
      secondPaymentStatus: proposal.secondPaymentStatus,
      firstPaidAt: proposal.firstPaidAt,
      secondPaidAt: proposal.secondPaidAt,
      secondInvoiceSentAt: proposal.secondInvoiceSentAt,
    };
  },
});

export const backfillProjects = internalMutation({
  args: {},
  handler: async (ctx) => {
    const proposals = await ctx.db.query("proposals").collect();
    let created = 0;
    for (const proposal of proposals) {
      if (!proposal.projectId) {
        const projectId = await ctx.db.insert("projects", {
          clientId: proposal.clientId,
          title: proposal.title,
          service: proposal.service || "General",
          stage: "proposal",
          budget: proposal.totalAmount,
        });
        await ctx.db.patch(proposal._id, { projectId });
        created++;
      }
    }
    return { created };
  },
});

export const remove = mutation({
  args: { id: v.id("proposals") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") throw new Error("Not authorized");

    await ctx.db.delete(id);
  },
});
