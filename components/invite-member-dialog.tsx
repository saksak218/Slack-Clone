"use client";

import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Mail, Copy, Check } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface InviteMemberDialogProps {
    workspaceId: Id<"workspaces">;
    trigger?: React.ReactNode;
}

export function InviteMemberDialog({ workspaceId, trigger }: InviteMemberDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"admin" | "member">("member");
    const [isInviting, setIsInviting] = useState(false);
    const [inviteLink, setInviteLink] = useState("");
    const [copied, setCopied] = useState(false);

    const session = authClient.useSession();
    const createInvite = useMutation(api.functions.workspaces.invites.createInvite);
    const sendInviteEmail = useAction(api.functions.workspaces.email_actions.sendInviteEmail);

    const onCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleInvite = async () => {
        if (!email.trim() || !session.data?.user.id) return;

        setIsInviting(true);
        try {
            const result = await createInvite({
                workspaceId,
                email: email.trim().toLowerCase(),
                role,
                invitedBy: session.data.user.id,
            });

            // Generate invite link
            const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
            const link = `${baseUrl}/invite/${result.token}`;
            setInviteLink(link);

            // Try to send email, but don't block on failure for the link display
            try {
                await sendInviteEmail({
                    email: email.trim().toLowerCase(),
                    workspaceName: result.workspaceName,
                    inviteLink: link,
                });
                toast.success("Invitation email sent!");
            } catch (emailError) {
                console.error("Email failed:", emailError);
                toast.info("Could not send email, but invite link is ready below.");
            }

            // Don't close immediately, show the link
            // setIsOpen(false);
            // setEmail("");
            // setRole("member");
        } catch (error: any) {
            console.error("Failed to invite:", error);
            toast.error(error.message || "Failed to create invitation");
        } finally {
            setIsInviting(false);
        }
    };

    const handleClose = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setEmail("");
            setRole("member");
            setInviteLink("");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Mail className="mr-2 h-4 w-4" />
                        Invite members
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Invite to workspace</DialogTitle>
                    <DialogDescription>
                        Send an invitation to join this workspace via email.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {inviteLink ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-sky-50 border border-sky-100 rounded-md">
                                <p className="text-sm text-sky-900 font-medium mb-2">
                                    Alternative: Copy and share this link directly
                                </p>
                                <div className="flex items-center gap-2">
                                    <Input
                                        readOnly
                                        value={inviteLink}
                                        className="h-9 bg-white border-sky-200 text-sky-900 truncate"
                                    />
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={onCopy}
                                        className="shrink-0 border-sky-200 hover:bg-sky-100"
                                    >
                                        {copied ? (
                                            <Check className="size-4 text-green-600" />
                                        ) : (
                                            <Copy className="size-4 text-sky-700" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <Button className="w-full" onClick={() => handleClose(false)}>
                                Done
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="colleague@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && email.trim()) {
                                            handleInvite();
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <select
                                    id="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as "admin" | "member")}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => handleClose(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleInvite}
                                    disabled={!email.trim() || isInviting}
                                >
                                    {isInviting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        "Send invite"
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

