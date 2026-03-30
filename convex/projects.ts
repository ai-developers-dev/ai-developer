import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const stageValidator = v.union(
  v.literal("lead"),
  v.literal("proposal"),
  v.literal("contracted"),
  v.literal("in_progress"),
  v.literal("review"),
  v.literal("completed")
);

export const list = query({
  args: {
    stage: v.optional(stageValidator),
  },
  handler: async (ctx, { stage }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") return [];

    let projects;
    if (stage) {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_stage", (q) => q.eq("stage", stage))
        .collect();
    } else {
      projects = await ctx.db.query("projects").collect();
    }

    // Attach client info and proposals
    const result = await Promise.all(
      projects.map(async (project) => {
        const client = await ctx.db.get(project.clientId);

        // Get proposals linked directly to this project
        const linkedProposals = await ctx.db
          .query("proposals")
          .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
          .collect();

        // Also get proposals for the same client that have no project link
        const clientProposals = await ctx.db
          .query("proposals")
          .withIndex("by_clientId", (q) => q.eq("clientId", project.clientId))
          .collect();
        const unlinkedProposals = clientProposals.filter(
          (p) => !p.projectId
        );

        // Combine and dedupe
        const seenIds = new Set(linkedProposals.map((p) => p._id));
        const proposals = [...linkedProposals];
        for (const p of unlinkedProposals) {
          if (!seenIds.has(p._id)) {
            proposals.push(p);
          }
        }

        return { ...project, client, proposals };
      })
    );

    return result;
  },
});

export const getById = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const project = await ctx.db.get(id);
    if (!project) return null;

    const client = await ctx.db.get(project.clientId);

    const proposals = await ctx.db
      .query("proposals")
      .withIndex("by_projectId", (q) => q.eq("projectId", id))
      .collect();

    const timeEntries = await ctx.db
      .query("timeEntries")
      .withIndex("by_projectId", (q) => q.eq("projectId", id))
      .collect();

    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const billableHours = timeEntries
      .filter((e) => e.billable)
      .reduce((sum, entry) => sum + entry.hours, 0);

    return {
      ...project,
      client,
      proposals,
      timeEntries,
      totalHours,
      billableHours,
    };
  },
});

export const getByClient = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, { clientId }) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
      .collect();
  },
});

export const getByClientEmail = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) return [];

    // Find client by user email
    const client = await ctx.db
      .query("clients")
      .withIndex("by_email", (q) => q.eq("contactEmail", user.email))
      .unique();

    if (!client) return [];

    return await ctx.db
      .query("projects")
      .withIndex("by_clientId", (q) => q.eq("clientId", client._id))
      .collect();
  },
});

export const create = mutation({
  args: {
    clientId: v.id("clients"),
    title: v.string(),
    service: v.string(),
    description: v.optional(v.string()),
    stage: v.optional(stageValidator),
    budget: v.optional(v.number()),
    assignedTo: v.optional(v.string()),
    startDate: v.optional(v.string()),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") throw new Error("Not authorized");

    return await ctx.db.insert("projects", {
      ...args,
      stage: args.stage || "lead",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    title: v.optional(v.string()),
    service: v.optional(v.string()),
    description: v.optional(v.string()),
    budget: v.optional(v.number()),
    assignedTo: v.optional(v.string()),
    startDate: v.optional(v.string()),
    dueDate: v.optional(v.string()),
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

export const updateStage = mutation({
  args: {
    id: v.id("projects"),
    stage: stageValidator,
  },
  handler: async (ctx, { id, stage }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") throw new Error("Not authorized");

    await ctx.db.patch(id, { stage });

    // When moving to completed, check for split-payment proposals needing a second invoice
    if (stage === "completed") {
      const proposals = await ctx.db
        .query("proposals")
        .withIndex("by_projectId", (q) => q.eq("projectId", id))
        .collect();

      const splitProposal = proposals.find(
        (p) =>
          p.paymentMode === "split" &&
          p.firstPaymentStatus === "paid" &&
          p.secondPaymentStatus !== "paid" &&
          p.secondPaymentStatus !== "invoiced"
      );

      if (splitProposal) {
        await ctx.db.patch(splitProposal._id, {
          secondPaymentStatus: "invoiced",
          secondInvoiceSentAt: Date.now(),
        });
        return { sendSecondInvoiceFor: splitProposal._id };
      }
    }

    return { sendSecondInvoiceFor: null };
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
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
