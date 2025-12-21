import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  channels: defineTable({
    createdBy: v.string(),
    name: v.string(),
  }),
  messages: defineTable({
    channelId: v.id("channels"),
    name: v.string(),
    text: v.string(),
    updatedAt: v.optional(v.float64()),
    userId: v.string(),
  }),
  users: defineTable({
    email: v.string(),
    image: v.optional(v.string()),
    name: v.string(),
    sessionId: v.string(),
  }),
});
