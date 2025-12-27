import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  workspaces: defineTable({
    name: v.string(),
    createdBy: v.string(), // User ID who created the workspace
    description: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_createdBy", ["createdBy"]),

  // Many-to-many relationship: users can belong to multiple workspaces
  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.string(), // User ID (from auth)
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"]),

  channels: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.string(), // User ID
    workspaceId: v.id("workspaces"), // REQUIRED - channels belong to workspaces
    isPrivate: v.optional(v.boolean()), // Private channels
    isArchived: v.optional(v.boolean()),
  })
    .index("by_workspace", ["workspaceId"]),

  messages: defineTable({
    channelId: v.id("channels"), // REQUIRED - messages belong to channels
    userId: v.string(), // User ID (from auth)
    text: v.string(),
    editedAt: v.optional(v.number()), // When message was edited
    replyTo: v.optional(v.id("messages")), // For threading/replies
    // Removed: name (get from users table), workspaceId (derive from channel)
  })
    .index("by_channel", ["channelId"])
    .index("by_user", ["userId"]),

  // Direct Messages / Conversations
  conversations: defineTable({
    type: v.union(v.literal("dm"), v.literal("group")), // DM or group DM
    participants: v.array(v.string()), // Array of user IDs
    workspaceId: v.id("workspaces"),
    lastMessageAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"]),

  // Messages in DMs (alternative to channel messages)
  conversationMessages: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    text: v.string(),
    editedAt: v.optional(v.number()),
    replyTo: v.optional(v.id("conversationMessages")),
  })
    .index("by_conversation", ["conversationId"]),

  users: defineTable({
    email: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
    sessionId: v.string(), // Auth session ID
    // Removed workspaceId - use workspaceMembers table instead
  })
    .index("by_email", ["email"])
    .index("by_sessionId", ["sessionId"]),

  // Workspace Invites
  workspaceInvites: defineTable({
    workspaceId: v.id("workspaces"),
    email: v.string(), // Email of the person being invited
    invitedBy: v.string(), // User ID who sent the invite
    role: v.union(v.literal("admin"), v.literal("member")), // Role they'll have when they join
    token: v.string(), // Unique token for the invite
    expiresAt: v.number(), // Expiration timestamp
    acceptedAt: v.optional(v.number()), // When invite was accepted
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired")),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_email", ["email"])
    .index("by_token", ["token"]),
});
