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

    const userIds = Array.from(new Set(messages.map((m) => m.userId)));
    const users = await Promise.all(
      userIds.map((id) =>
        ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("sessionId"), id))
          .first(),
      ),
    );

    const userMap = new Map(users.map((u) => [u?.sessionId, u]));

    const messagesWithUsers = messages.map((message) => {
      const user = userMap.get(message.userId);
      return {
        ...message,
        userName: user?.name || message.name || "Unknown User",
        userImage: user?.image,
      };
    });

    return messagesWithUsers.reverse();
  },
});
