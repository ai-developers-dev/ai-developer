import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    description: v.string(),
    hours: v.number(),
    date: v.string(),
    billable: v.boolean(),
    hourlyRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Auto-fill hourly rate from user's billable rate if not provided
    let hourlyRate = args.hourlyRate;
    if (hourlyRate === undefined && args.billable) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
        .unique();
      if (user?.billableRate) {
        hourlyRate = user.billableRate;
      }
    }

    const entryId = await ctx.db.insert("timeEntries", {
      ...args,
      hourlyRate,
      userId: identity.subject,
    });

    // Auto-advance project to "in_progress" when first time entry is logged
    const project = await ctx.db.get(args.projectId);
    if (
      project &&
      (project.stage === "lead" ||
        project.stage === "proposal" ||
        project.stage === "contracted")
    ) {
      await ctx.db.patch(args.projectId, { stage: "in_progress" });
    }

    return entryId;
  },
});

export const update = mutation({
  args: {
    id: v.id("timeEntries"),
    description: v.optional(v.string()),
    hours: v.optional(v.number()),
    date: v.optional(v.string()),
    billable: v.optional(v.boolean()),
    hourlyRate: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const entry = await ctx.db.get(id);
    if (!entry || entry.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(id, cleanUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("timeEntries") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const entry = await ctx.db.get(id);
    if (!entry) throw new Error("Not found");

    // Admins can delete any entry, users can only delete their own
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (user?.role !== "admin" && entry.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(id);
  },
});

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("timeEntries")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("timeEntries")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const listByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, { startDate, endDate }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    // Get all entries and filter by date range
    let entries;
    if (user?.role === "admin") {
      entries = await ctx.db.query("timeEntries").collect();
    } else {
      entries = await ctx.db
        .query("timeEntries")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .collect();
    }

    return entries.filter((e) => e.date >= startDate && e.date <= endDate);
  },
});

export const getWeekEntries = query({
  args: {
    weekStart: v.string(),
  },
  handler: async (ctx, { weekStart }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Calculate week end (7 days later)
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const weekEnd = end.toISOString().split("T")[0];

    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    return entries.filter((e) => e.date >= weekStart && e.date <= weekEnd);
  },
});

export const getSummaryByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();

    const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
    const billableHours = entries
      .filter((e) => e.billable)
      .reduce((sum, e) => sum + e.hours, 0);
    const totalCost = entries
      .filter((e) => e.billable && e.hourlyRate)
      .reduce((sum, e) => sum + e.hours * (e.hourlyRate || 0), 0);

    return {
      totalHours,
      billableHours,
      nonBillableHours: totalHours - billableHours,
      totalCost,
      entryCount: entries.length,
    };
  },
});
