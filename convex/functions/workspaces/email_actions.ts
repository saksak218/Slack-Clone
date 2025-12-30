import { v } from "convex/values";
import { action } from "../../_generated/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendInviteEmail = action({
  args: {
    email: v.string(),
    workspaceName: v.string(),
    inviteLink: v.string(),
  },
  handler: async (ctx, args) => {
    const { email, workspaceName, inviteLink } = args;

    try {
      const { data, error } = await resend.emails.send({
        from: "Slack Clone <onboarding@resend.dev>",
        to: [email],
        subject: `You've been invited to join ${workspaceName} on Slack Clone`,
        html: `
          <h1>Join ${workspaceName}</h1>
          <p>You've been invited to join the <strong>${workspaceName}</strong> workspace on Slack Clone.</p>
          <p>Click the link below to accept the invitation:</p>
          <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background-color: #4A154B; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Join Workspace</a>
          <p>Or copy and paste this link into your browser:</p>
          <p>${inviteLink}</p>
        `,
      });

      if (error) {
        console.error("Resend error:", error);
        throw new Error("Failed to send email");
      }

      console.log(`Email sent to ${email} for workspace ${workspaceName}`);
      return { success: true, data };
    } catch (error) {
      console.error("Action error:", error);
      throw new Error("Failed to send email invite");
    }
  },
});
