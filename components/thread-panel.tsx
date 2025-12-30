"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { X, Hash, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { MessageItem } from "./message-item";
import MessageInput from "./message-input";
import { ScrollArea } from "./ui/scroll-area";
import { authClient } from "@/lib/auth-client";

interface ThreadPanelProps {
    parentMessageId: Id<"messages">;
    workspaceId: Id<"workspaces">;
    onClose: () => void;
}

export const ThreadPanel = ({ parentMessageId, workspaceId, onClose }: ThreadPanelProps) => {
    const session = authClient.useSession();

    // Fetch parent message
    const parentMessage = useQuery(api.functions.chat.queries.getMessage, { id: parentMessageId });

    // Fetch thread replies
    const replies = useQuery(api.functions.chat.queries.getThreadMessages, { parentMessageId });

    const createMessage = useMutation(api.functions.chat.mutations.createMessage);
    const toggleReaction = useMutation(api.functions.chat.mutations.toggleReaction);

    const handleSend = async (text: string, attachments?: any[]) => {
        if (session.data?.user.id && parentMessage) {
            try {
                await createMessage({
                    channelId: parentMessage.channelId,
                    conversationId: parentMessage.conversationId,
                    userId: session.data.user.id,
                    text,
                    replyTo: parentMessageId,
                    attachments,
                });
            } catch (error) {
                console.error("Failed to send thread reply:", error);
            }
        }
    };

    const handleReactionToggle = async (messageId: Id<"messages">, emoji: string) => {
        if (session.data?.user.id) {
            try {
                await toggleReaction({
                    messageId,
                    userId: session.data.user.id,
                    emoji,
                });
            } catch (error) {
                console.error("Failed to toggle reaction:", error);
            }
        }
    };

    if (!parentMessage) {
        return (
            <div className="h-full flex flex-col bg-white border-l border-gray-200">
                <div className="h-[49px] flex items-center justify-between px-4 border-b border-gray-200">
                    <p className="text-lg font-bold">Thread</p>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="size-5" />
                    </Button>
                </div>
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    Loading thread...
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white border-l border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="h-[49px] flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-gray-900">Thread</p>
                    <span className="text-xs text-gray-500 font-medium">
                        {parentMessage.channelId ? `in #${parentMessage.channelId.slice(0, 4)}...` : "in Direct Message"}
                    </span>
                </div>
                <Button variant="ghost" size="icon-sm" className="hidden md:flex hover:bg-gray-100" onClick={onClose}>
                    <X className="size-5 text-gray-500" />
                </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
                <div className="py-4">
                    {/* Parent Message */}
                    <MessageItem
                        id={parentMessage._id}
                        name={parentMessage.userName}
                        text={parentMessage.text}
                        createdAt={parentMessage._creationTime}
                        userImage={parentMessage.userImage}
                        reactions={parentMessage.reactions}
                        attachments={parentMessage.attachments}
                        onReactionToggle={(emoji) => handleReactionToggle(parentMessage._id, emoji)}
                    />

                    <div className="flex items-center px-4 my-4">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span className="px-3 text-xs text-gray-500 font-medium bg-white uppercase tracking-wider">
                            {replies?.length || 0} {replies?.length === 1 ? "reply" : "replies"}
                        </span>
                        <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    {/* Replies */}
                    <div className="flex flex-col">
                        {replies?.map((reply) => (
                            <MessageItem
                                key={reply._id}
                                id={reply._id}
                                name={reply.userName}
                                text={reply.text}
                                createdAt={reply._creationTime}
                                isAuthor={reply.userId === session.data?.user.id}
                                userImage={reply.userImage}
                                reactions={reply.reactions}
                                attachments={reply.attachments}
                                onReactionToggle={(emoji) => handleReactionToggle(reply._id, emoji)}
                            />
                        ))}
                    </div>
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-gray-200">
                <MessageInput
                    placeholder="Reply..."
                    onSubmit={handleSend}
                    workspaceId={workspaceId}
                />
            </div>
        </div>
    );
};
