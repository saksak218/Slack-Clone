import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  workspaces: defineTable({
    name: v.string(),
    createdBy: v.string(),
    description: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  }).index("by_createdBy", ["createdBy"]),

  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"]),

  channels: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.string(),
    workspaceId: v.id("workspaces"),
    isPrivate: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
  }).index("by_workspace", ["workspaceId"]),

  channelMembers: defineTable({
    channelId: v.id("channels"),
    userId: v.string(),
    joinedAt: v.number(),
  })
    .index("by_channel", ["channelId"])
    .index("by_user", ["userId"]),

  conversations: defineTable({
    workspaceId: v.id("workspaces"),
    userOneId: v.string(),
    userTwoId: v.string(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_users", ["workspaceId", "userOneId", "userTwoId"]),

  messages: defineTable({
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
  })
    .index("by_channel", ["channelId"])
    .index("by_conversation", ["conversationId"])
    .index("by_replyTo", ["replyTo"]),

  reactions: defineTable({
    messageId: v.id("messages"),
    userId: v.string(),
    emoji: v.string(),
  })
    .index("by_message", ["messageId"])
    .index("by_user_emoji", ["userId", "emoji"]),

  users: defineTable({
    email: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
    sessionId: v.string(),
    lastSeen: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_sessionId", ["sessionId"]),

  workspaceInvites: defineTable({
    workspaceId: v.id("workspaces"),
    email: v.string(),
    invitedBy: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
    token: v.string(),
    expiresAt: v.number(),
    acceptedAt: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired"),
    ),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_email", ["email"])
    .index("by_token", ["token"]),

  userReadStatus: defineTable({
    userId: v.string(),
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    lastReadAt: v.number(),
  })
    .index("by_user_channel", ["userId", "channelId"])
    .index("by_user_conversation", ["userId", "conversationId"]),
});
