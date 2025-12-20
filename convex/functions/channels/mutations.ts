import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const createChannel = mutation({
  args: {
    name: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const channelId = await ctx.db.insert("channels", {
      name: args.name,
      createdBy: args.createdBy,
    });
    return channelId;
  },
});
