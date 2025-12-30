import { v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";

function generateInviteToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Date.now().toString(36)
  );
}

export const createInvite = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
    invitedBy: v.string(), // User ID
    expiresInDays: v.optional(v.number()), // Default 7 days
  },
  handler: async (ctx, args) => {
    const existingMember = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => {
        return q.eq(q.field("workspaceId"), args.workspaceId);
      })
      .collect();

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (user) {
      const isMember = existingMember.some((m) => m.userId === user.sessionId);
      if (isMember) {
        throw new Error("User is already a member of this workspace");
      }
    }

    const existingInvite = await ctx.db
      .query("workspaceInvites")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("email"), args.email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingInvite) {
      await ctx.db.patch(existingInvite._id, {
        role: args.role,
        invitedBy: args.invitedBy,
        expiresAt: Date.now() + (args.expiresInDays || 7) * 24 * 60 * 60 * 1000,
      });
      // Get workspace name
      const workspace = await ctx.db.get(args.workspaceId);
      if (!workspace) {
        throw new Error("Workspace not found");
      }
      return {
        inviteId: existingInvite._id,
        token: existingInvite.token,
        workspaceName: workspace.name,
      };
    }

    // Create new invite
    const expiresAt =
      Date.now() + (args.expiresInDays || 7) * 24 * 60 * 60 * 1000;
    const token = generateInviteToken();

    const inviteId = await ctx.db.insert("workspaceInvites", {
      workspaceId: args.workspaceId,
      email: args.email,
      invitedBy: args.invitedBy,
      role: args.role,
      token,
      expiresAt,
      status: "pending",
    });

    // Get workspace name
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    return { inviteId, token, workspaceName: workspace.name };
  },
});

export const getInviteByToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("workspaceInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invite) {
      return null;
    }

    const workspace = await ctx.db.get(invite.workspaceId);

    const inviter = await ctx.db
      .query("users")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", invite.invitedBy))
      .first();

    const identity = await ctx.auth.getUserIdentity();
    let isMember = false;
    if (identity) {
      const member = await ctx.db
        .query("workspaceMembers")
        .withIndex("by_workspace", (q) =>
          q.eq("workspaceId", invite.workspaceId),
        )
        .filter((q) => q.eq(q.field("userId"), identity.subject))
        .first();
      isMember = !!member;
    }

    return {
      ...invite,
      workspace,
      inviter: inviter ? { name: inviter.name, email: inviter.email } : null,
      isMember,
    };
  },
});

export const acceptInvite = mutation({
  args: {
    token: v.string(),
    userId: v.string(), // User ID accepting the invite
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("workspaceInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invite) {
      throw new Error("Invite not found");
    }

    if (invite.status !== "pending") {
      throw new Error("Invite has already been used or expired");
    }

    if (invite.expiresAt < Date.now()) {
      await ctx.db.patch(invite._id, { status: "expired" });
      throw new Error("Invite has expired");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      throw new Error("This invite is for a different email address");
    }

    const existingMember = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", invite.workspaceId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existingMember) {
      await ctx.db.patch(invite._id, {
        status: "accepted",
        acceptedAt: Date.now(),
      });
      return { alreadyMember: true, workspaceId: invite.workspaceId };
    }

    // Add user to workspace
    await ctx.db.insert("workspaceMembers", {
      workspaceId: invite.workspaceId,
      userId: args.userId,
      role: invite.role,
      joinedAt: Date.now(),
    });

    // Mark invite as accepted
    await ctx.db.patch(invite._id, {
      status: "accepted",
      acceptedAt: Date.now(),
    });

    return { workspaceId: invite.workspaceId };
  },
});

export const getWorkspaceInvites = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workspaceInvites")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});

export const cancelInvite = mutation({
  args: {
    inviteId: v.id("workspaceInvites"),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new Error("Invite not found");
    }

    if (invite.status === "accepted") {
      throw new Error("Cannot cancel an accepted invite");
    }

    await ctx.db.patch(args.inviteId, { status: "expired" });
  },
});
