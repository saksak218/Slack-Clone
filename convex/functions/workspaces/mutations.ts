import { v } from "convex/values";
import { mutation } from "../../_generated/server";

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

export const deleteWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!member || member.role !== "owner") {
      throw new Error("Only the workspace owner can delete the workspace");
    }

    const channels = await ctx.db
      .query("channels")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    for (const channel of channels) {
      const channelMembers = await ctx.db
        .query("channelMembers")
        .withIndex("by_channel", (q) => q.eq("channelId", channel._id))
        .collect();
      for (const cm of channelMembers) await ctx.db.delete(cm._id);

      const messages = await ctx.db
        .query("messages")
        .withIndex("by_channel", (q) => q.eq("channelId", channel._id))
        .collect();
      for (const msg of messages) {
        const reactions = await ctx.db
          .query("reactions")
          .withIndex("by_message", (q) => q.eq("messageId", msg._id))
          .collect();
        for (const r of reactions) await ctx.db.delete(r._id);
        await ctx.db.delete(msg._id);
      }
      await ctx.db.delete(channel._id);
    }

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    for (const conv of conversations) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
        .collect();
      for (const msg of messages) {
        const reactions = await ctx.db
          .query("reactions")
          .withIndex("by_message", (q) => q.eq("messageId", msg._id))
          .collect();
        for (const r of reactions) await ctx.db.delete(r._id);
        await ctx.db.delete(msg._id);
      }
      await ctx.db.delete(conv._id);
    }

    const workspaceMembers = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const wm of workspaceMembers) await ctx.db.delete(wm._id);

    const invites = await ctx.db
      .query("workspaceInvites")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const invite of invites) await ctx.db.delete(invite._id);

    await ctx.db.delete(args.workspaceId);
  },
});
