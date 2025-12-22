"use client";

import { useQuery, useMutation } from "convex/react";
import { Plus, Hash } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface SidebarProps {
    selectedChannelId?: string;
    onSelectChannel: (id: string) => void;
}

export const Sidebar = ({ selectedChannelId, onSelectChannel }: SidebarProps) => {
    const channels = useQuery(api.functions.channels.queries.getChannels);
    const createChannel = useMutation(api.functions.channels.mutations.createChannel);
    const session = authClient.useSession();

    const handleAddChannel = async () => {
        const name = prompt("Enter channel name:");
        if (name && session.data?.user.id) {
            await createChannel({
                name,
                createdBy: session.data.user.id,
            });
        }
    };

    return (
        <div className="flex flex-col h-full text-white p-3 md:p-4">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold truncate">Channels</h2>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleAddChannel}
                    className="text-white hover:bg-[#4A154B] shrink-0"
                >
                    <Plus className="size-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
                {channels?.map((channel) => (
                    <button
                        key={channel._id}
                        onClick={() => onSelectChannel(channel._id)}
                        className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                            selectedChannelId === channel._id
                                ? "bg-[#1164A3] text-white"
                                : "text-[#BCABBC] hover:bg-[#350D36] hover:text-white"
                        )}
                    >
                        <Hash className="size-4 shrink-0" />
                        <span className="truncate">{channel.name}</span>
                    </button>
                ))}
                {channels === undefined && (
                    <div className="p-2 text-sm text-[#BCABBC]">Loading...</div>
                )}
            </div>
        </div>
    );
};