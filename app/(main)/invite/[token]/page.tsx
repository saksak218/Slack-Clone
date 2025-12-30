"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function InviteAcceptPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;
    const session = authClient.useSession();
    const [isAccepting, setIsAccepting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const invite = useQuery(api.functions.workspaces.invites.getInviteByToken, { token });
    const acceptInvite = useMutation(api.functions.workspaces.invites.acceptInvite);

    const handleAccept = async () => {
        if (!session.data?.user.id || !token) return;

        setIsAccepting(true);
        setError(null);
        try {
            const result = await acceptInvite({
                token,
                userId: session.data.user.id,
            });

            setSuccess(true);
            // Store workspace in sessionStorage and redirect
            sessionStorage.setItem("selectedWorkspaceId", result.workspaceId);

            setTimeout(() => {
                router.push("/");
                router.refresh();
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Failed to accept invite");
        } finally {
            setIsAccepting(false);
        }
    };

    // Redirect to login if not authenticated
    useEffect(() => {
        if (session.data === null && !session.isPending) {
            router.push(`/login?redirect=/invite/${token}`);
        }
    }, [session, router, token]);

    if (session.isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!session.data?.user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="p-8 max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
                    <p className="text-gray-600 mb-6">
                        Please sign in to accept this workspace invitation.
                    </p>
                    <Button onClick={() => router.push(`/login?redirect=/invite/${token}`)}>
                        Sign in
                    </Button>
                </Card>
            </div>
        );
    }

    if (invite === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (success || (invite && invite.isMember)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="p-8 max-w-md w-full text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-4">Welcome to {invite?.workspace?.name || "Workspace"}!</h1>
                    <p className="text-gray-600 mb-6">
                        {invite?.isMember
                            ? "You are already a member of this workspace. Redirecting..."
                            : "You've successfully joined the workspace. Redirecting..."}
                    </p>
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
                </Card>
            </div>
        );
    }

    const isExpired = invite && (invite.status === "expired" || (invite.expiresAt < Date.now() && invite.status === "pending"));
    const isAccepted = invite && invite.status === "accepted";

    if (!invite || isExpired || isAccepted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="p-8 max-w-md w-full text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-4">Invalid Invite</h1>
                    <p className="text-gray-600">
                        {isExpired
                            ? "This invitation has expired."
                            : isAccepted
                                ? "This invitation has already been accepted."
                                : "This invitation link is invalid."}
                    </p>
                </Card>
            </div>
        );
    }

    // Check if user email matches invite email
    const userEmail = session.data.user.email?.toLowerCase();
    const inviteEmail = invite.email.toLowerCase();

    if (userEmail !== inviteEmail) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="p-8 max-w-md w-full text-center">
                    <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-4">Email Mismatch</h1>
                    <p className="text-gray-600 mb-2">
                        This invitation was sent to <strong>{invite.email}</strong>
                    </p>
                    <p className="text-gray-600">
                        You are signed in as <strong>{userEmail}</strong>
                    </p>
                    <p className="text-sm text-gray-500 mt-4">
                        Please sign in with the email address the invitation was sent to.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold mb-2">You've been invited!</h1>
                    <p className="text-gray-600">
                        {invite.inviter?.name || "Someone"} invited you to join
                    </p>
                    <p className="text-xl font-semibold text-purple-600 mt-2">
                        {invite.workspace?.name}
                    </p>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Role</p>
                        <p className="font-semibold capitalize">{invite.role}</p>
                    </div>
                    {invite.workspace?.description && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Description</p>
                            <p className="text-sm">{invite.workspace.description}</p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push("/")}
                    >
                        Decline
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={handleAccept}
                        disabled={isAccepting}
                    >
                        {isAccepting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Accepting...
                            </>
                        ) : (
                            "Accept Invite"
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}

