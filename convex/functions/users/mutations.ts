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
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
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
