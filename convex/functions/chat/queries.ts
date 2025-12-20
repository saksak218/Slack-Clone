import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getMessages = query({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("channelId"), args.channelId))
      .order("desc")
      .take(100);

    const messagesWithUsers = messages.map((message) => {
      return {
        ...message,
        userName: message.name || "Unknown User",
      };
    });

    return messagesWithUsers.reverse();
  },
});
