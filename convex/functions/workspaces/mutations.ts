import { v } from "convex/values";
import { mutation } from "../../_generated/server";

/**
 * Gets or creates a default workspace for a user
 * This is a helper to ensure backward compatibility
 */
export const getOrCreateDefaultWorkspace = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Try to find existing workspace for user
    const workspaces = await ctx.db
      .query("workspaces")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", args.userId))
      .collect();

    if (workspaces.length > 0) {
      return workspaces[0]._id;
    }

    // Create default workspace
    const workspaceId = await ctx.db.insert("workspaces", {
      name: "My Workspace",
      createdBy: args.userId,
      description: "Default workspace",
      updatedAt: Date.now(),
    });

    // Add user as owner
    await ctx.db.insert("workspaceMembers", {
      workspaceId,
      userId: args.userId,
      role: "owner",
      joinedAt: Date.now(),
    });

    return workspaceId;
  },
});

export const createWorkspace = mutation({
  args: {
    name: v.string(),
    createdBy: v.string(), // User ID
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      createdBy: args.createdBy,
      description: args.description,
      updatedAt: Date.now(),
    });

    // Automatically add creator as owner
    await ctx.db.insert("workspaceMembers", {
      workspaceId,
      userId: args.createdBy,
      role: "owner",
      joinedAt: Date.now(),
    });

    return workspaceId;
  },
});

export const addWorkspaceMember = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    // Check if member already exists
    const existing = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("workspaceMembers", {
      workspaceId: args.workspaceId,
      userId: args.userId,
      role: args.role,
      joinedAt: Date.now(),
    });
  },
});

export const updateWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { workspaceId, ...updates } = args;
    await ctx.db.patch(workspaceId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

