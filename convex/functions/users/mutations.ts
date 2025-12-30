import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const createUser = mutation({
  args: {
    sessionId: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      if (existingUser.sessionId !== args.sessionId) {
        await ctx.db.patch(existingUser._id, { sessionId: args.sessionId });
      }
      if (args.image && existingUser.image !== args.image) {
        await ctx.db.patch(existingUser._id, { image: args.image });
      }
      return existingUser;
    }

    const user = await ctx.db.insert("users", {
      sessionId: args.sessionId,
      name: args.name,
      email: args.email,
      image: args.image,
    });
    return user;
  },
});

export const updatePresence = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.userId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        lastSeen: Date.now(),
      });
    }
  },
});
