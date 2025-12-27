"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
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

interface InviteMemberDialogProps {
    workspaceId: Id<"workspaces">;
    trigger?: React.ReactNode;
}

export function InviteMemberDialog({ workspaceId, trigger }: InviteMemberDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"admin" | "member">("member");
    const [isInviting, setIsInviting] = useState(false);
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const session = authClient.useSession();
    const createInvite = useMutation(api.functions.workspaces.invites.createInvite);

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
            setEmail("");
        } catch (error: any) {
            console.error("Failed to create invite:", error);
            alert(error.message || "Failed to create invite");
        } finally {
            setIsInviting(false);
        }
    };

    const handleCopyLink = async () => {
        if (!inviteLink) return;
        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const handleClose = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setInviteLink(null);
            setEmail("");
            setRole("member");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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

                {!inviteLink ? (
                    <div className="space-y-4 py-4">
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
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm font-medium text-green-900 mb-2">
                                Invite created successfully!
                            </p>
                            <p className="text-sm text-green-700 mb-3">
                                Share this link with the person you want to invite:
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    value={inviteLink}
                                    readOnly
                                    className="flex-1 text-sm"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyLink}
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={() => handleClose(false)}>Done</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

