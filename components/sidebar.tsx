"use client";

import { useQuery, useMutation } from "convex/react";
import { Plus, Hash, Lock } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import { CreateChannelDialog } from "@/components/create-channel-dialog";

interface SidebarProps {
    selectedChannelId?: string;
    onSelectChannel: (id: string) => void;
}

export const Sidebar = ({ selectedChannelId, onSelectChannel }: SidebarProps) => {
    const session = authClient.useSession();
    const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
    const [workspaceId, setWorkspaceId] = useState<Id<"workspaces"> | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const selectedWorkspaceId = sessionStorage.getItem("selectedWorkspaceId");
            if (selectedWorkspaceId) {
                setWorkspaceId(selectedWorkspaceId as Id<"workspaces">);
            }
        }
    }, []);

    const workspace = useQuery(
        api.functions.workspaces.queries.getWorkspace,
        workspaceId ? { workspaceId } : "skip"
    );

    const channels = useQuery(
        api.functions.channels.queries.getChannels,
        workspaceId ? { workspaceId, userId: session.data?.user.id || undefined } : "skip"
    );
    const users = useQuery(
        api.functions.users.queries.getUsers,
        workspaceId ? { workspaceId } : "skip"
    );
    const getOrCreateConversation = useMutation(api.functions.chat.mutations.getOrCreateConversation);
    const conversations = useQuery(api.functions.chat.queries.getConversations,
        workspaceId && session.data?.user.id ? { workspaceId, userId: session.data.user.id } : "skip"
    );

    const handleAddChannel = () => {
        setIsCreateChannelOpen(true);
    };

    const handleUserClick = async (userId: string) => {
        if (!workspaceId || !session.data?.user.id || userId === session.data.user.id) return;

        const conversationId = await getOrCreateConversation({
            workspaceId,
            userOneId: session.data.user.id,
            userTwoId: userId,
        });

        onSelectChannel(conversationId);
    };

    const isOnline = (lastSeen?: number) => {
        if (!lastSeen) return false;
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        return now - lastSeen < fiveMinutes;
    };

    const isActiveUser = (userId: string) => {
        if (!selectedChannelId || !conversations) return false;
        const activeConversation = (conversations as any[]).find((c: any) => c._id === selectedChannelId);
        if (!activeConversation) return false;
        return activeConversation.userOneId === userId || activeConversation.userTwoId === userId;
    };

    return (
        <div className="flex flex-col h-full text-white bg-[#3F0E40]">
            <div className="h-[49px] flex items-center justify-between px-4 border-b border-[#5d2c5d] shrink-0">
                <h1 className="text-lg font-bold truncate">{workspace?.name || "Loading..."}</h1>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
                <div className="px-4 mb-6">
                    <div className="flex items-center justify-between group mb-2">
                        <div className="flex items-center p-1">
                            <h2 className="text-[15px] font-bold text-[#bcbabc] transition-colors uppercase tracking-wider text-[11px]">Channels</h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleAddChannel}
                            className="text-[#bcbabc] hover:bg-[#350D36] hover:text-white size-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Plus className="size-4" />
                        </Button>
                    </div>

                    <div className="space-y-[2px]">
                        {channels?.map((channel) => (
                            <button
                                key={channel._id}
                                onClick={() => onSelectChannel(channel._id)}
                                className={cn(
                                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[15px] transition-all duration-200",
                                    selectedChannelId === channel._id
                                        ? "bg-white/10 text-white backdrop-blur-sm font-medium shadow-sm"
                                        : "text-[#BCABBC] hover:bg-[#350D36] hover:text-white"
                                )}
                            >
                                {channel.isPrivate ? (
                                    <Lock className="size-4 shrink-0 opacity-70" />
                                ) : (
                                    <Hash className="size-4 shrink-0 opacity-70" />
                                )}
                                <span className="truncate">{channel.name}</span>
                            </button>
                        ))}
                        {channels === undefined && (
                            <div className="px-2 text-sm text-[#BCABBC]">Loading...</div>
                        )}
                    </div>
                </div>

                {workspaceId && (
                    <div className="px-4 mb-4">
                        <InviteMemberDialog
                            workspaceId={workspaceId}
                            trigger={
                                <button
                                    type="button"
                                    className="w-full flex items-center justify-start px-2 py-1.5 rounded-sm text-[15px] text-[#BCABBC] hover:bg-[#350D36] hover:text-white transition-colors cursor-pointer"
                                >
                                    <Plus className="size-4 mr-2" />
                                    Invite people
                                </button>
                            }
                        />
                    </div>
                )}

                <div className="px-4">
                    <div className="flex items-center justify-between group mb-2">
                        <div className="flex items-center p-1">
                            <h2 className="text-[15px] font-bold text-[#bcbabc] transition-colors uppercase tracking-wider text-[11px]">Direct Messages</h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-[#bcbabc] hover:bg-[#350D36] hover:text-white size-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Plus className="size-4" />
                        </Button>
                    </div>

                    <div className="space-y-[2px]">
                        {users?.map((user) => (
                            <button
                                key={user._id}
                                onClick={() => handleUserClick(user.sessionId)}
                                className={cn(
                                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[15px] transition-all duration-200",
                                    isActiveUser(user.sessionId)
                                        ? "bg-white/10 text-white backdrop-blur-sm font-medium shadow-sm"
                                        : "text-[#BCABBC] hover:bg-[#350D36] hover:text-white"
                                )}
                            >
                                <div className="relative shrink-0">
                                    <Avatar className="size-5 rounded">
                                        <AvatarImage src={user.image} className="rounded" />
                                        <AvatarFallback className="rounded bg-sky-500 text-[10px] text-white">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {isOnline(user.lastSeen) && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 border border-[#3F0E40]"></div>
                                    )}
                                </div>
                                <span className="truncate opacity-90">{user.name}</span>
                                {user.sessionId === session.data?.user.id && <span className="text-xs opacity-50 ml-1">(you)</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {workspaceId && (
                <CreateChannelDialog
                    workspaceId={workspaceId}
                    open={isCreateChannelOpen}
                    onOpenChange={setIsCreateChannelOpen}
                />
            )}
        </div>
    );
};