import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    return user;
  },
});

// Auto-creates a user record when someone signs in but the Clerk webhook
// hasn't fired yet (common in local dev). First user becomes admin.
export const ensureCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (existing) return existing;

    const allUsers = await ctx.db.query("users").collect();
    const role = allUsers.length === 0 ? "admin" : "user";

    const id = await ctx.db.insert("users", {
      clerkUserId: identity.subject,
      email: identity.email ?? "",
      name: identity.name ?? undefined,
      imageUrl: identity.pictureUrl ?? undefined,
      role: role as "admin" | "user",
      isActive: true,
    });

    return await ctx.db.get(id);
  },
});

export const getByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("users.list - identity:", identity ? { subject: identity.subject, email: identity.email } : null);

    if (!identity) {
      // No auth - return all users anyway for now (debug)
      const allUsers = await ctx.db.query("users").collect();
      console.log("users.list - no auth, returning all", allUsers.length, "users");
      return allUsers;
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    console.log("users.list - currentUser:", currentUser ? { id: currentUser._id, role: currentUser.role } : null);

    if (!currentUser || currentUser.role !== "admin") return [];

    return await ctx.db.query("users").collect();
  },
});

export const upsertFromClerk = internalMutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, { clerkUserId, email, name, imageUrl }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email,
        name,
        imageUrl,
      });
      return existing._id;
    }

    // First user becomes admin, rest are clients
    const allUsers = await ctx.db.query("users").collect();
    const role = allUsers.length === 0 ? "admin" : "user";

    return await ctx.db.insert("users", {
      clerkUserId,
      email,
      name,
      imageUrl,
      role: role as "admin" | "user",
      isActive: true,
    });
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

export const createByAdmin = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(
      v.object({
        street: v.string(),
        city: v.string(),
        state: v.string(),
        zip: v.string(),
      })
    ),
    billableRate: v.optional(v.number()),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Not authorized");
    }

    return await ctx.db.insert("users", {
      clerkUserId: `admin-created-${Date.now()}`,
      email: args.email,
      name: `${args.firstName} ${args.lastName}`,
      firstName: args.firstName,
      lastName: args.lastName,
      phone: args.phone,
      address: args.address,
      billableRate: args.billableRate,
      role: args.role ?? "user",
      isActive: true,
    });
  },
});

export const updateUser = mutation({
  args: {
    id: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(
      v.object({
        street: v.string(),
        city: v.string(),
        state: v.string(),
        zip: v.string(),
      })
    ),
    billableRate: v.optional(v.number()),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Not authorized");
    }

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    // Update name if first/last changed
    if (updates.firstName || updates.lastName) {
      const user = await ctx.db.get(id);
      if (user) {
        cleanUpdates.name = `${updates.firstName ?? user.firstName ?? ""} ${updates.lastName ?? user.lastName ?? ""}`.trim();
      }
    }

    await ctx.db.patch(id, cleanUpdates);
  },
});

export const removeByAdmin = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Prevent deleting yourself
    if (currentUser._id === id) {
      throw new Error("Cannot delete your own account");
    }

    await ctx.db.delete(id);
  },
});

export const updateRole = internalMutation({
  args: {
    clerkUserId: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, { clerkUserId, role }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, { role });
    }
  },
});
