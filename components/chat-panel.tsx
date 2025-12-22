"use client";

import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { authClient } from '@/lib/auth-client';
import { Id } from '@/convex/_generated/dataModel';
import { Hash, Info, Menu } from 'lucide-react';
import { MessageItem } from './message-item';
import { MessageInput } from './message-input';
import { Button } from './ui/button';

interface ChatPanelProps {
    channelId: Id<"channels">;
    onOpenSidebar?: () => void;
}

export const ChatPanel = ({ channelId, onOpenSidebar }: ChatPanelProps) => {
    const session = authClient.useSession();

    // Fetch channel details
    const channel = useQuery(api.functions.channels.queries.getChannel, { id: channelId });

    // Real-time messages for the current channel
    const messages = useQuery(api.functions.chat.queries.getMessages, { channelId });
    const createMessage = useMutation(api.functions.chat.mutations.createMessage);

    const handleSend = async (text: string) => {
        if (session.data?.user.id) {
            try {
                await createMessage({
                    channelId,
                    userId: session.data.user.id,
                    name: session.data.user.name || "Anonymous",
                    text,
                });
            } catch (error) {
                console.error("Failed to send message:", error);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="h-[49px] border-b flex items-center justify-between px-2 sm:px-4 shrink-0">
                <div className="flex items-center gap-1 overflow-hidden min-w-0 flex-1">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="md:hidden mr-1 shrink-0"
                        onClick={onOpenSidebar}
                    >
                        <Menu className="size-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-base sm:text-lg font-bold px-1 hover:bg-slate-100/50 min-w-0 flex-1"
                    >
                        <Hash className="size-4 sm:size-5 mr-1 text-gray-500 shrink-0" />
                        <span className="truncate">
                            {channel?.name || "Loading..."}
                        </span>
                    </Button>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" className="text-gray-500 hidden sm:flex">
                        <Info className="size-5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-gray-500 sm:hidden">
                        <Info className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto flex flex-col-reverse px-2 sm:px-4">
                <div className="flex flex-col pb-4">
                    {messages?.map((message) => (
                        <MessageItem
                            key={message._id}
                            name={message.userName}
                            text={message.text}
                            createdAt={message._creationTime}
                            isAuthor={message.userId === session.data?.user.id}
                            userImage={message.userImage}
                        />
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="px-2 sm:px-4">
                <MessageInput
                    placeholder={`Message #${channel?.name || "..."}`}
                    onSubmit={handleSend}
                />
            </div>
        </div>
    );
};