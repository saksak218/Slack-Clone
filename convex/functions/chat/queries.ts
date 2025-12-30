import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getMessages = query({
  args: {
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    let messages;

    if (args.channelId) {
      messages = await ctx.db
        .query("messages")
        .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
        .filter((q) => q.eq(q.field("replyTo"), undefined))
        .order("desc")
        .take(100);
    } else if (args.conversationId) {
      messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", args.conversationId),
        )
        .filter((q) => q.eq(q.field("replyTo"), undefined))
        .order("desc")
        .take(100);
    } else {
      return [];
    }

    return enrichMessages(ctx, messages.reverse());
  },
});

export const getThreadMessages = query({
  args: {
    parentMessageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_replyTo", (q) => q.eq("replyTo", args.parentMessageId))
      .order("asc")
      .collect();

    return enrichMessages(ctx, messages);
  },
});

export const getMessage = query({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);
    if (!message) return null;

    const enriched = await enrichMessages(ctx, [message]);
    return enriched[0];
  },
});

async function enrichMessages(ctx: any, messages: any[]) {
  const userIds = Array.from(new Set(messages.map((m) => m.userId)));
  const users = await Promise.all(
    userIds.map((id) =>
      ctx.db
        .query("users")
        .withIndex("by_sessionId", (q: any) => q.eq("sessionId", id))
        .first(),
    ),
  );

  const userMap = new Map(
    users.filter(Boolean).map((u: any) => [u.sessionId, u]),
  );

  const messagesWithData = await Promise.all(
    messages.map(async (message) => {
      const user = userMap.get(message.userId);

      const reactions = await ctx.db
        .query("reactions")
        .withIndex("by_message", (q: any) => q.eq("messageId", message._id))
        .collect();

      const replyCount = (
        await ctx.db
          .query("messages")
          .withIndex("by_replyTo", (q: any) => q.eq("replyTo", message._id))
          .collect()
      ).length;

      const messageWithAttachments = {
        ...message,
        userName: user?.name || "Unknown User",
        userImage: user?.image,
        reactions: groupReactions(reactions),
        replyCount,
      };

      if (message.attachments) {
        const enrichedAttachments = await Promise.all(
          message.attachments.map(async (a: any) => ({
            ...a,
            url: await ctx.storage.getUrl(a.storageId),
          })),
        );
        return { ...messageWithAttachments, attachments: enrichedAttachments };
      }

      return messageWithAttachments;
    }),
  );

  return messagesWithData;
}

function groupReactions(reactions: any[]) {
  const groups = new Map<
    string,
    { emoji: string; count: number; userIds: string[] }
  >();

  for (const r of reactions) {
    const group = groups.get(r.emoji) || {
      emoji: r.emoji,
      count: 0,
      userIds: [] as string[],
    };
    group.count++;
    group.userIds.push(r.userId as string);
    groups.set(r.emoji, group);
  }

  return Array.from(groups.values());
}

export const getConversation = query({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.id);
    if (!conversation) return null;

    const user1 = await ctx.db
      .query("users")
      .withIndex("by_sessionId", (q) =>
        q.eq("sessionId", conversation.userOneId),
      )
      .first();
    const user2 = await ctx.db
      .query("users")
      .withIndex("by_sessionId", (q) =>
        q.eq("sessionId", conversation.userTwoId),
      )
      .first();

    return {
      ...conversation,
      userOne: user1,
      userTwo: user2,
    };
  },
});

export const getChannelMembers = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .collect();

    const users = await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_sessionId", (q) => q.eq("sessionId", m.userId))
          .first();
        return { ...user, joinedAt: m.joinedAt };
      }),
    );

    return users.filter((u) => u !== null);
  },
});

export const getConversations = query({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    return conversations.filter(
      (c) => c.userOneId === args.userId || c.userTwoId === args.userId,
    );
  },
});

export const getUnreadCounts = query({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const channels = await ctx.db
      .query("channels")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const userConversations = conversations.filter(
      (c) => c.userOneId === args.userId || c.userTwoId === args.userId,
    );

    const readStatuses = await ctx.db
      .query("userReadStatus")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    const channelCounts = await Promise.all(
      channels.map(async (c) => {
        const status = readStatuses.find((s) => s.channelId === c._id);
        const lastRead = status?.lastReadAt || 0;
        const unreadMessages = await ctx.db
          .query("messages")
          .withIndex("by_channel", (q) => q.eq("channelId", c._id))
          .filter((q) => q.gt(q.field("_creationTime"), lastRead))
          .collect();

        // Get the most recent unread message to check who sent it
        const lastUnreadMessage =
          unreadMessages.length > 0
            ? unreadMessages.sort(
                (a, b) => b._creationTime - a._creationTime,
              )[0]
            : null;

        return {
          id: c._id,
          count: unreadMessages.length,
          lastMessageUserId: lastUnreadMessage?.userId || null,
          lastMessageTime: lastUnreadMessage?._creationTime || null,
        };
      }),
    );

    const DMCounts = await Promise.all(
      userConversations.map(async (c) => {
        const status = readStatuses.find((s) => s.conversationId === c._id);
        const lastRead = status?.lastReadAt || 0;
        const unreadMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", c._id))
          .filter((q) => q.gt(q.field("_creationTime"), lastRead))
          .collect();

        // Get the most recent unread message to check who sent it
        const lastUnreadMessage =
          unreadMessages.length > 0
            ? unreadMessages.sort(
                (a, b) => b._creationTime - a._creationTime,
              )[0]
            : null;

        return {
          id: c._id,
          count: unreadMessages.length,
          lastMessageUserId: lastUnreadMessage?.userId || null,
          lastMessageTime: lastUnreadMessage?._creationTime || null,
        };
      }),
    );

    return { channels: channelCounts, conversations: DMCounts };
  },
});
