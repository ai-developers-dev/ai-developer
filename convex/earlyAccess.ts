import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const STATUS = v.union(
  v.literal("new"),
  v.literal("invited"),
  v.literal("converted"),
  v.literal("archived")
);

/** Admin gate shared by every read/write below. Returns null when not admin. */
async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkUserId", (q: any) =>
      q.eq("clerkUserId", identity.subject)
    )
    .unique();

  if (!user || user.role !== "admin") return null;
  return user;
}

/**
 * Public — anyone can join the courses waitlist. Idempotent by email: a repeat
 * signup refreshes the name instead of creating a duplicate row, so the same
 * person hitting the form twice doesn't pollute the list.
 */
export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, { name, email, source }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    const existing = await ctx.db
      .query("earlyAccessSignups")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();

    if (existing) {
      if (trimmedName && trimmedName !== existing.name) {
        await ctx.db.patch(existing._id, { name: trimmedName });
      }
      return existing._id;
    }

    return await ctx.db.insert("earlyAccessSignups", {
      name: trimmedName,
      email: normalizedEmail,
      source,
      status: "new",
    });
  },
});

export const list = query({
  args: { status: v.optional(STATUS) },
  handler: async (ctx, { status }) => {
    if (!(await requireAdmin(ctx))) return [];

    if (status) {
      return await ctx.db
        .query("earlyAccessSignups")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .collect();
    }

    return await ctx.db.query("earlyAccessSignups").order("desc").collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("earlyAccessSignups"),
    status: STATUS,
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, notes }) => {
    if (!(await requireAdmin(ctx))) throw new Error("Not authorized");

    const update: { status: typeof status; notes?: string } = { status };
    if (notes !== undefined) update.notes = notes;

    await ctx.db.patch(id, update);
  },
});

export const remove = mutation({
  args: { id: v.id("earlyAccessSignups") },
  handler: async (ctx, { id }) => {
    if (!(await requireAdmin(ctx))) throw new Error("Not authorized");
    await ctx.db.delete(id);
  },
});
