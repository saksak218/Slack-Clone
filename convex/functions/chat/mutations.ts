import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const createMessage = mutation({
  args: {
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    userId: v.string(),
    text: v.string(),
    replyTo: v.optional(v.id("messages")),
    attachments: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          name: v.string(),
          type: v.string(),
        }),
      ),
    ),
    linkPreviews: v.optional(
      v.array(
        v.object({
          url: v.string(),
          title: v.optional(v.string()),
          description: v.optional(v.string()),
          image: v.optional(v.string()),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      channelId: args.channelId,
      conversationId: args.conversationId,
      userId: args.userId,
      text: args.text,
      replyTo: args.replyTo,
      attachments: args.attachments,
      linkPreviews: args.linkPreviews,
    });
    return messageId;
  },
});

export const getOrCreateConversation = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userOneId: v.string(),
    userTwoId: v.string(),
  },
  handler: async (ctx, args) => {
    const [id1, id2] = [args.userOneId, args.userTwoId].sort();

    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_workspace_users", (q) =>
        q
          .eq("workspaceId", args.workspaceId)
          .eq("userOneId", id1)
          .eq("userTwoId", id2),
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      workspaceId: args.workspaceId,
      userOneId: id1,
      userTwoId: id2,
    });
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
    });
  },
});

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_user_emoji", (q) =>
        q.eq("userId", args.userId).eq("emoji", args.emoji),
      )
      .filter((q) => q.eq(q.field("messageId"), args.messageId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { action: "removed" };
    } else {
      await ctx.db.insert("reactions", {
        messageId: args.messageId,
        userId: args.userId,
        emoji: args.emoji,
      });
      return { action: "added" };
    }
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.messageId);
  },
});
