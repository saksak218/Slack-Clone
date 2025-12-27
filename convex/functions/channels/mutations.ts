import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const createChannel = mutation({
  args: {
    name: v.string(),
    createdBy: v.string(),
    workspaceId: v.id("workspaces"),
    description: v.optional(v.string()),
    isPrivate: v.optional(v.boolean()),
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
    return channelId;
  },
});
