import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const createMessage = mutation({
  args: {
    channelId: v.id("channels"),
    userId: v.string(),
    text: v.string(),
    replyTo: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      channelId: args.channelId,
      userId: args.userId,
      text: args.text,
      replyTo: args.replyTo,
    });
    return messageId;
  },
});

export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      text: args.text,
      editedAt: Date.now(),
    });
  },
});
