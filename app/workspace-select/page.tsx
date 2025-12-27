"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ArrowRight, Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSyncUser } from "@/hooks/use-sync-user";

// Separate component to avoid nested queries
function WorkspaceCard({
    workspace,
    userId,
    initials,
    onSelect,
}: {
    workspace: { _id: Id<"workspaces">; name: string };
    userId: string;
    initials: string;
    onSelect: (id: Id<"workspaces">) => void;
}) {
    const members = useQuery(
        api.functions.workspaces.queries.getWorkspaceMembers,
        { workspaceId: workspace._id }
    );

    const memberCount = members?.length || 0;
    const userMembership = members?.find((m) => m.userId === userId);

    return (
        <Card
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-500"
            onClick={() => onSelect(workspace._id)}
        >
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">{workspace.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                        {memberCount} {memberCount === 1 ? "member" : "members"}
                    </p>
                    {userMembership && (
                        <div className="flex gap-2">
                            <span
                                className={`text-xs px-2 py-1 rounded ${
                                    userMembership.role === "owner"
                                        ? "bg-purple-100 text-purple-700"
                                        : userMembership.role === "admin"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                            >
                                {userMembership.role.charAt(0).toUpperCase() + userMembership.role.slice(1)}
                            </span>
                        </div>
                    )}
                </div>
                <ArrowRight className="text-gray-400 shrink-0" />
            </div>
        </Card>
    );
}

export default function WorkspaceSelectPage() {
    const router = useRouter();
    const session = authClient.useSession();
    const [isCreating, setIsCreating] = useState(false);
    const [workspaceName, setWorkspaceName] = useState("");
    const [workspaceDescription, setWorkspaceDescription] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Sync user to Convex if not already synced (handles Google OAuth signup)
    const { isSyncing: isSyncingUser } = useSyncUser();

    // Get user's workspaces
    const workspaces = useQuery(
        api.functions.workspaces.queries.getWorkspaces,
        session.data?.user.id ? { userId: session.data.user.id } : "skip"
    );

    const createWorkspace = useMutation(api.functions.workspaces.mutations.createWorkspace);
    const addWorkspaceMember = useMutation(api.functions.workspaces.mutations.addWorkspaceMember);

    const handleSelectWorkspace = (workspaceId: Id<"workspaces">) => {
        // Store selected workspace in sessionStorage
        sessionStorage.setItem("selectedWorkspaceId", workspaceId);
        // Redirect to main app
        router.push("/");
        router.refresh();
    };

    const handleCreateWorkspace = async () => {
        if (!workspaceName.trim() || !session.data?.user.id) return;

        setIsCreating(true);
        try {
            const workspaceId = await createWorkspace({
                name: workspaceName.trim(),
                createdBy: session.data.user.id,
                description: workspaceDescription.trim() || undefined,
            });

            // Store selected workspace
            sessionStorage.setItem("selectedWorkspaceId", workspaceId);
            setIsDialogOpen(false);
            setWorkspaceName("");
            setWorkspaceDescription("");
            
            // Redirect to main app
            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Failed to create workspace:", error);
        } finally {
            setIsCreating(false);
        }
    };

    // Show loading state
    if (workspaces === undefined || isSyncingUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
                    <p className="text-gray-600">
                        {isSyncingUser ? "Setting up your account..." : "Loading workspaces..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-8">
            <div className="w-full max-w-4xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Select a workspace</h1>
                    <p className="text-gray-600">Choose a workspace to get started, or create a new one</p>
                </div>

                {/* Existing Workspaces */}
                {workspaces && workspaces.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {workspaces.map((workspace) => {
                            if (!workspace) return null;
                            
                            const initials = workspace.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2);

                            return (
                                <WorkspaceCard
                                    key={workspace._id}
                                    workspace={workspace}
                                    userId={session.data?.user.id || ""}
                                    initials={initials}
                                    onSelect={handleSelectWorkspace}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Create New Workspace */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Card className="p-6 border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50/50 transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                    <Plus className="text-gray-400" size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-1">Create a new workspace</h3>
                                    <p className="text-sm text-gray-500">Start fresh with a new workspace</p>
                                </div>
                                <ArrowRight className="text-gray-400 shrink-0" />
                            </div>
                        </Card>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create a new workspace</DialogTitle>
                            <DialogDescription>
                                Get started by creating a new workspace for your team.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Workspace name</Label>
                                <Input
                                    id="name"
                                    placeholder="My Workspace"
                                    value={workspaceName}
                                    onChange={(e) => setWorkspaceName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && workspaceName.trim()) {
                                            handleCreateWorkspace();
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (optional)</Label>
                                <Input
                                    id="description"
                                    placeholder="What's this workspace for?"
                                    value={workspaceDescription}
                                    onChange={(e) => setWorkspaceDescription(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && workspaceName.trim()) {
                                            handleCreateWorkspace();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    setWorkspaceName("");
                                    setWorkspaceDescription("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateWorkspace}
                                disabled={!workspaceName.trim() || isCreating}
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create workspace"
                                )}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Empty State - No workspaces */}
                {workspaces && workspaces.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 mb-6">You don't have any workspaces yet.</p>
                        <p className="text-sm text-gray-500">Click the card above to create your first workspace.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

