import { v } from "convex/values";
import { query } from "../../_generated/server";

export const userByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getUserBySessionId = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();
  },
});

export const getUsers = query({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    if (args.workspaceId) {
      // Get users in a specific workspace
      const workspaceId = args.workspaceId;
      const memberships = await ctx.db
        .query("workspaceMembers")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .collect();

      const userIds = memberships.map((m) => m.userId);
      const users = await Promise.all(
        userIds.map((id) =>
          ctx.db
            .query("users")
            .withIndex("by_sessionId", (q) => q.eq("sessionId", id))
            .first()
        )
      );

      return users.filter((u) => u !== null);
    }

    // Return all users if no workspace specified
    return await ctx.db.query("users").collect();
  },
});
