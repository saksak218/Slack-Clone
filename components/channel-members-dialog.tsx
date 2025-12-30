"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, X, Hash, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { ConfirmDialog } from "./confirm-dialog";

interface ChannelMembersDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    channelId: Id<"channels">;
}

export const ChannelMembersDialog = ({
    open,
    onOpenChange,
    channelId,
}: ChannelMembersDialogProps) => {
    const session = authClient.useSession();
    const [isAdding, setIsAdding] = useState(false);

    const channel = useQuery(api.functions.channels.queries.getChannel, { id: channelId });
    const members = useQuery(api.functions.chat.queries.getChannelMembers, { channelId });
    const allUsers = useQuery(api.functions.users.queries.getUsers, channel ? { workspaceId: channel.workspaceId } : "skip");

    const addMember = useMutation(api.functions.channels.mutations.addChannelMember);
    const removeMember = useMutation(api.functions.channels.mutations.removeChannelMember);

    const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

    const handleAdd = async (userId: string) => {
        await addMember({ channelId, userId });
    };

    const handleRemove = async () => {
        if (memberToRemove) {
            await removeMember({ channelId, userId: memberToRemove });
            setMemberToRemove(null);
        }
    };

    const nonMembers = allUsers?.filter(u => !members?.some((m: any) => m.sessionId === u.sessionId));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        {channel?.isPrivate ? <Lock className="size-4" /> : <Hash className="size-4" />}
                        Members of {channel?.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    {isAdding ? (
                        <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-sm">Add people</h3>
                                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Back</Button>
                            </div>
                            <div className="space-y-1">
                                {nonMembers?.map((user: any) => (
                                    <div key={user._id} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg group">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-8 rounded">
                                                <AvatarImage src={user.image} className="rounded" />
                                                <AvatarFallback className="rounded bg-sky-500 text-white font-medium">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <Button size="sm" onClick={() => handleAdd(user.sessionId)}>Add</Button>
                                    </div>
                                ))}
                                {nonMembers?.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">Everyone in this workspace is already in this channel.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 space-y-4">
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 border-dashed"
                                onClick={() => setIsAdding(true)}
                            >
                                <UserPlus className="size-4" />
                                Add people
                            </Button>

                            <div className="space-y-1">
                                {members?.map((user: any) => (
                                    <div key={user._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-8 rounded">
                                                <AvatarImage src={user.image} className="rounded" />
                                                <AvatarFallback className="rounded bg-sky-500 text-white font-medium">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold truncate">
                                                    {user.name}
                                                    {user.sessionId === session.data?.user.id && <span className="text-xs text-gray-400 font-normal ml-1">(you)</span>}
                                                </p>
                                                <p className="text-[10px] text-gray-400">Joined {new Date(user.joinedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {user.sessionId !== channel?.createdBy && user.sessionId !== session.data?.user.id && (
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all"
                                                onClick={() => setMemberToRemove(user.sessionId)}
                                            >
                                                <X className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-4 border-t bg-gray-50">
                    <Button variant="ghost" className="w-full font-bold" onClick={() => onOpenChange(false)}>Done</Button>
                </DialogFooter>
            </DialogContent>

            <ConfirmDialog
                open={!!memberToRemove}
                onOpenChange={(open) => !open && setMemberToRemove(null)}
                onConfirm={handleRemove}
                title="Remove member?"
                message="Are you sure you want to remove this member from the channel? They will lose access to all message history in this channel."
                confirmLabel="Remove"
                variant="destructive"
            />
        </Dialog>
    );
};
