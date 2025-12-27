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
    // Check for existing user by email (using index)
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      // Update sessionId if it changed (e.g., user logged in with different method)
      if (existingUser.sessionId !== args.sessionId) {
        await ctx.db.patch(existingUser._id, { sessionId: args.sessionId });
      }
      // Update image if provided and different
      if (args.image && existingUser.image !== args.image) {
        await ctx.db.patch(existingUser._id, { image: args.image });
      }
      return existingUser;
    }

    // Create new user
    const user = await ctx.db.insert("users", {
      sessionId: args.sessionId,
      name: args.name,
      email: args.email,
      image: args.image,
    });
    return user;
  },
});
