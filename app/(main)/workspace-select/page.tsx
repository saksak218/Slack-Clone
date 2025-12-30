"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ArrowRight, Loader2, Trash, Settings, LogOut } from "lucide-react";
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
import { DeleteWorkspaceDialog } from "@/components/delete-workspace-dialog";

const AVATAR_COLORS = [
    "bg-[#E01E5A]", // Slack Red
    "bg-[#36C5F0]", // Slack Blue
    "bg-[#2EB67D]", // Slack Green
    "bg-[#ECB22E]", // Slack Yellow
    "bg-[#4A154B]", // Slack Purple
];

function WorkspaceRow({
    workspace,
    role,
    initials,
    index,
    onSelect,
    onDelete,
}: {
    workspace: { _id: Id<"workspaces">; name: string };
    role: string;
    initials: string;
    index: number;
    onSelect: (id: Id<"workspaces">) => void;
    onDelete: (id: Id<"workspaces">, name: string) => void;
}) {
    const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

    return (
        <div
            className="flex items-center justify-between p-4 last:border-0 border-b border-gray-100 group hover:bg-gray-50/50 transition-colors cursor-pointer"
            onClick={() => onSelect(workspace._id)}
        >
            <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded ${avatarColor} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                    {initials}
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-[#1D1C1D] text-[15px] truncate">{workspace.name}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[13px] text-[#616061]">
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {role === "owner" && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#616061] hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(workspace._id, workspace.name);
                        }}
                    >
                        <Trash className="size-4" />
                    </Button>
                )}
                <Button
                    variant="outline"
                    className="hidden sm:flex border-2 border-gray-200 font-bold text-[13px] hover:bg-gray-50 h-9 px-4 uppercase tracking-wider"
                >
                    Launch
                    <ArrowRight className="ml-2 size-3" />
                </Button>
                <ArrowRight className="sm:hidden text-gray-400 size-5" />
            </div>
        </div>
    );
}

export default function WorkspaceSelectPage() {
    const router = useRouter();
    const session = authClient.useSession();
    const [isCreating, setIsCreating] = useState(false);
    const [workspaceName, setWorkspaceName] = useState("");
    const [workspaceDescription, setWorkspaceDescription] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [deleteWorkspaceId, setDeleteWorkspaceId] = useState<Id<"workspaces"> | null>(null);
    const [deleteWorkspaceName, setDeleteWorkspaceName] = useState("");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { isSyncing: isSyncingUser } = useSyncUser();

    const userWorkspaces = useQuery(
        api.functions.workspaces.queries.getUserWorkspaces,
        session.data?.user.id ? { userId: session.data.user.id } : "skip"
    );

    const createWorkspace = useMutation(api.functions.workspaces.mutations.createWorkspace);

    const handleSelectWorkspace = (workspaceId: Id<"workspaces">) => {
        sessionStorage.setItem("selectedWorkspaceId", workspaceId);
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

            sessionStorage.setItem("selectedWorkspaceId", workspaceId);
            setIsDialogOpen(false);
            setWorkspaceName("");
            setWorkspaceDescription("");

            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Failed to create workspace:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteClick = (id: Id<"workspaces">, name: string) => {
        setDeleteWorkspaceId(id);
        setDeleteWorkspaceName(name);
        setIsDeleteDialogOpen(true);
    };

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/login");
    };

    if (userWorkspaces === undefined || isSyncingUser) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#4A154B]" />
            </div>
        );
    }

    const email = session.data?.user.email;

    return (
        <div className="min-h-screen bg-white flex flex-col items-center">
            {/* Minimal Header */}
            <div className="w-full max-w-5xl px-6 h-20 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1">
                    <svg className="w-8 h-8" viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg">
                        <g fill="none" fillRule="evenodd">
                            <path d="M19.712.133a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386h5.376V5.52A5.381 5.381 0 0 0 19.712.133m0 14.365H5.376A5.381 5.381 0 0 0 0 19.884a5.381 5.381 0 0 0 5.376 5.387h14.336a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386" fill="#36C5F0" />
                            <path d="M53.76 19.884a5.381 5.381 0 0 0-5.376-5.386 5.381 5.381 0 0 0-5.376 5.386v5.387h5.376a5.381 5.381 0 0 0 5.376-5.387m-14.336 0V5.52A5.381 5.381 0 0 0 34.048.133a5.381 5.381 0 0 0-5.376 5.387v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387" fill="#2EB67D" />
                            <path d="M34.048 53.867a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386h-5.376v5.386a5.381 5.381 0 0 0 5.376 5.387m0-14.365h14.336a5.381 5.381 0 0 0 5.376-5.386 5.381 5.381 0 0 0-5.376-5.387H34.048a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386" fill="#ECB22E" />
                            <path d="M0 34.116a5.381 5.381 0 0 0 5.376 5.386 5.381 5.381 0 0 0 5.376-5.386V28.73H5.376A5.381 5.381 0 0 0 0 34.116m14.336 0v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387V34.116a5.381 5.381 0 0 0-5.376-5.387 5.381 5.381 0 0 0-5.376 5.387" fill="#E01E5A" />
                        </g>
                    </svg>
                    <span className="font-black text-2xl tracking-tighter ml-1">slack</span>
                </div>
                <Button variant="ghost" size="sm" className="text-[#616061] text-[13px] font-bold uppercase tracking-wider" onClick={handleSignOut}>
                    Sign Out
                    <LogOut className="ml-2 size-4" />
                </Button>
            </div>

            <div className="w-full max-w-2xl px-6 py-12 flex flex-col flex-1">
                <div className="mb-10 text-center">
                    <h1 className="text-[48px] font-black text-[#1D1C1D] leading-tight mb-4">Welcome back</h1>
                    <p className="text-[18px] text-[#1D1C1D]/80">
                        Workspaces for <span className="font-bold underline text-[#4A154B]">{email}</span>
                    </p>
                </div>

                <div className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm mb-8">
                    {userWorkspaces && userWorkspaces.length > 0 ? (
                        <div className="flex flex-col">
                            {userWorkspaces.map((item, index) => {
                                if (!item.workspace) return null;

                                const initials = item.workspace.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2);

                                return (
                                    <WorkspaceRow
                                        key={item.workspace._id}
                                        workspace={item.workspace}
                                        role={item.membership.role}
                                        initials={initials}
                                        index={index}
                                        onSelect={handleSelectWorkspace}
                                        onDelete={handleDeleteClick}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Plus className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-[#1D1C1D] mb-2">No workspaces yet</h3>
                            <p className="text-[#616061]">Get started by creating your first workspace.</p>
                        </div>
                    )}
                </div>

                {/* Create Workspace CTA */}
                <div className="flex flex-col items-center gap-6 mt-4">
                    <div className="flex items-center gap-12 w-full max-w-md">
                        <div className="h-[1px] bg-gray-200 flex-1"></div>
                        <span className="text-[15px] font-bold text-[#616061]">OR</span>
                        <div className="h-[1px] bg-gray-200 flex-1"></div>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="bg-[#4A154B] hover:bg-[#5D2C5D] text-white font-bold h-14 px-8 rounded shadow-md group">
                                <Plus className="mr-2 size-5" />
                                Create a New Workspace
                                <ArrowRight className="ml-2 size-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all font-black" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] p-8">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">New Workspace</DialogTitle>
                                <DialogDescription className="text-base text-[#616061]">
                                    Give your workspace a name and a short description.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-6">
                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-[13px] font-bold uppercase tracking-wider text-[#616061]">Workspace name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Acme Marketing"
                                        className="h-12 text-lg border-2 border-gray-200 focus-visible:ring-[#4A154B]"
                                        value={workspaceName}
                                        onChange={(e) => setWorkspaceName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="description" className="text-[13px] font-bold uppercase tracking-wider text-[#616061]">Description (optional)</Label>
                                    <Input
                                        id="description"
                                        placeholder="What will your team do here?"
                                        className="h-12 text-lg border-2 border-gray-200 focus-visible:ring-[#4A154B]"
                                        value={workspaceDescription}
                                        onChange={(e) => setWorkspaceDescription(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="ghost"
                                    className="px-6 font-bold text-[#616061]"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="px-8 bg-[#2EB67D] hover:bg-[#1E8C59] font-bold text-white shadow-sm h-12"
                                    onClick={handleCreateWorkspace}
                                    disabled={!workspaceName.trim() || isCreating}
                                >
                                    {isCreating ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : (
                                        "Create Workspace"
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <p className="text-[15px] text-[#616061] mt-4">
                        Want to work with a different team?{" "}
                        <button className="text-[#1264A3] font-bold hover:underline" onClick={handleSignOut}>
                            Sign in to another account
                        </button>
                    </p>
                </div>
            </div>

            {/* Simple Footer */}
            <div className="w-full py-8 text-center text-[#616061] text-[13px] shrink-0">
                &copy; 2025 Slack Technologies, LLC.
            </div>

            {deleteWorkspaceId && (
                <DeleteWorkspaceDialog
                    workspaceId={deleteWorkspaceId}
                    workspaceName={deleteWorkspaceName}
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                />
            )}
        </div>
    );
}
