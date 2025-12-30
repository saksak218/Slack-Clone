import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const createChannel = mutation({
  args: {
    name: v.string(),
    createdBy: v.string(),
    workspaceId: v.id("workspaces"),
    description: v.optional(v.string()),
    isPrivate: v.optional(v.boolean()),
    memberIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const channelId = await ctx.db.insert("channels", {
      name: args.name,
      createdBy: args.createdBy,
      workspaceId: args.workspaceId,
      description: args.description,
      isPrivate: args.isPrivate ?? false,
      isArchived: false,
    });

    // Add creator as member
    await ctx.db.insert("channelMembers", {
      channelId,
      userId: args.createdBy,
      joinedAt: Date.now(),
    });

    // Add other members if specified
    if (args.memberIds) {
      for (const userId of args.memberIds) {
        if (userId !== args.createdBy) {
          await ctx.db.insert("channelMembers", {
            channelId,
            userId,
            joinedAt: Date.now(),
          });
        }
      }
    }

    return channelId;
  },
});

export const addChannelMember = mutation({
  args: {
    channelId: v.id("channels"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) return;

    await ctx.db.insert("channelMembers", {
      channelId: args.channelId,
      userId: args.userId,
      joinedAt: Date.now(),
    });
  },
});

export const removeChannelMember = mutation({
  args: {
    channelId: v.id("channels"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const updateChannel = mutation({
  args: {
    id: v.id("channels"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...parts } = args;
    await ctx.db.patch(id, parts);
  },
});
