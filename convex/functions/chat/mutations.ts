import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const createMessage = mutation({
  args: {
    channelId: v.id("channels"),
    userId: v.string(),
    name: v.string(),
    text: v.string(),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.insert("messages", {
      channelId: args.channelId,
      userId: args.userId,
      name: args.name,
      text: args.text,
      updatedAt: args.updatedAt,
    });
    return message;
  },
});
