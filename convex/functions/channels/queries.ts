import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getChannels = query({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const channels = await ctx.db
      .query("channels")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();

    if (!args.userId) {
      return channels.filter((c) => !c.isPrivate);
    }

    const memberships = await ctx.db
      .query("channelMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId!))
      .collect();

    const memberChannelIds = new Set(memberships.map((m) => m.channelId));

    return channels.filter((c) => !c.isPrivate || memberChannelIds.has(c._id));
  },
});

export const getChannel = query({
  args: { id: v.id("channels") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
