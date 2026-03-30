import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") return [];

    return await ctx.db.query("clients").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("clients") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db.get(id);
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("clients")
      .withIndex("by_email", (q) => q.eq("contactEmail", email))
      .unique();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    contactEmail: v.string(),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") throw new Error("Not authorized");

    return await ctx.db.insert("clients", {
      ...args,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("clients"),
    name: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
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

export const remove = mutation({
  args: { id: v.id("clients") },
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

export const convertFromSubmission = mutation({
  args: {
    submissionId: v.id("contactSubmissions"),
  },
  handler: async (ctx, { submissionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") throw new Error("Not authorized");

    const submission = await ctx.db.get(submissionId);
    if (!submission) throw new Error("Submission not found");

    // Check if client already exists
    const existingClient = await ctx.db
      .query("clients")
      .withIndex("by_email", (q) => q.eq("contactEmail", submission.email))
      .unique();

    let clientId;
    if (existingClient) {
      clientId = existingClient._id;
    } else {
      clientId = await ctx.db.insert("clients", {
        name: submission.name,
        contactEmail: submission.email,
        company: submission.company,
        isActive: true,
      });
    }

    // Create a project from the submission
    const projectId = await ctx.db.insert("projects", {
      clientId,
      title: `${submission.service} project for ${submission.name}`,
      service: submission.service,
      description: submission.description,
      stage: "lead",
      budget: undefined,
    });

    // Mark submission as converted
    await ctx.db.patch(submissionId, { status: "converted" });

    return { clientId, projectId };
  },
});
