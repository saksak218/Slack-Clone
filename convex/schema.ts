import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  users: defineTable({
    sessionId: v.string(),
    name: v.string(),
    email: v.string(),
  }),
  channels: defineTable({
    name: v.string(),
    createdBy: v.string(),
  }),
  messages: defineTable({
    channelId: v.id("channels"),
    userId: v.string(),
    name: v.string(),
    text: v.string(),
    updatedAt: v.optional(v.number()),
  }),
});
