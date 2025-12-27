import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getWorkspaces = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all workspaces where user is a member
    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const workspaceIds = memberships.map((m) => m.workspaceId);
    const workspaces = await Promise.all(
      workspaceIds.map((id) => ctx.db.get(id))
    );

    return workspaces.filter((w) => w !== null);
  },
});

export const getWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.workspaceId);
  },
});

export const getWorkspaceMembers = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});

export const getUserWorkspaces = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return memberships.map((m) => ({
      membership: m,
      workspace: null as any, // Will be populated in frontend if needed
    }));
  },
});

