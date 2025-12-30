"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { Lock, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateChannelDialogProps {
    workspaceId: Id<"workspaces">;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const CreateChannelDialog = ({
    workspaceId,
    open,
    onOpenChange,
}: CreateChannelDialogProps) => {
    const session = authClient.useSession();
    const [name, setName] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [pending, setPending] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

    const createChannel = useMutation(api.functions.channels.mutations.createChannel);
    const users = useQuery(api.functions.users.queries.getUsers, { workspaceId });

    const toggleMember = (userId: string) => {
        const newSet = new Set(selectedMembers);
        if (newSet.has(userId)) {
            newSet.delete(userId);
        } else {
            newSet.add(userId);
        }
        setSelectedMembers(newSet);
    };

    const handleClose = () => {
        setName("");
        setIsPrivate(false);
        setSelectedMembers(new Set());
        onOpenChange(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !session.data?.user.id) return;

        setPending(true);
        try {
            await createChannel({
                name: name.replace(/\s+/g, "-").toLowerCase(),
                workspaceId,
                createdBy: session.data.user.id,
                isPrivate,
                memberIds: isPrivate ? Array.from(selectedMembers) : undefined,
            });
            handleClose();
        } catch (error) {
            console.error("Failed to create channel:", error);
        } finally {
            setPending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-bold">Create a channel</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-bold">Name</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {isPrivate ? <Lock className="size-4" /> : <Hash className="size-4" />}
                                </div>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. plan-budget"
                                    className="pl-9 h-11 border-gray-300 focus:border-sky-500 focus:ring-sky-500"
                                    required
                                    disabled={pending}
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Channels are where your team communicates. They’re best when organized around a topic — #marketing, for example.
                            </p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer group" onClick={() => setIsPrivate(!isPrivate)}>
                            <div className="flex-1 space-y-0.5">
                                <Label className="text-sm font-bold cursor-pointer">Make private</Label>
                                <p className="text-xs text-gray-500">
                                    When a channel is set to private, it can only be viewed or joined by invitation.
                                </p>
                            </div>
                            <div className={cn(
                                "w-12 h-6 rounded-full transition-colors relative shrink-0 ml-4",
                                isPrivate ? "bg-[#2EB67D]" : "bg-gray-300"
                            )}>
                                <div className={cn(
                                    "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                                    isPrivate ? "translate-x-6" : "translate-x-0"
                                )} />
                            </div>
                        </div>

                        {isPrivate && (
                            <div className="space-y-3">
                                <Label className="text-sm font-bold">Select Members</Label>
                                <div className="space-y-1 max-h-[200px] overflow-y-auto pr-2">
                                    {users?.filter(u => u.sessionId !== session.data?.user.id).map((user) => (
                                        <div
                                            key={user._id}
                                            onClick={() => toggleMember(user.sessionId)}
                                            className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                                        >
                                            <div className={cn(
                                                "size-5 rounded border flex items-center justify-center transition-colors",
                                                selectedMembers.has(user.sessionId) ? "bg-[#2EB67D] border-[#2EB67D]" : "border-gray-300 bg-white"
                                            )}>
                                                {selectedMembers.has(user.sessionId) && (
                                                    <div className="size-2 bg-white rounded-full" />
                                                )}
                                            </div>
                                            <Avatar className="size-6 rounded">
                                                <AvatarImage src={user.image} className="rounded" />
                                                <AvatarFallback className="rounded bg-sky-500 text-[10px] text-white">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm text-gray-900 truncate">{user.name}</span>
                                        </div>
                                    ))}
                                    {users === undefined && (
                                        <div className="text-sm text-gray-500 italic">Loading members...</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-6 pt-0">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={handleClose}
                            disabled={pending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#3F0E40] hover:bg-[#3F0E40]/90 text-white font-bold px-6"
                            disabled={!name || pending}
                        >
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
