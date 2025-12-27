"use client";

import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { authClient } from '@/lib/auth-client';
import { Id } from '@/convex/_generated/dataModel';
import { ChevronDown, Hash, Info, Menu } from 'lucide-react';
import { MessageItem } from './message-item';
import { Button } from './ui/button';
import MessageInput from './message-input';

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
            <div className="h-[49px] border-b border-gray-200 flex items-center justify-between px-4 shrink-0 bg-white">
                <div className="flex items-center gap-1 overflow-hidden min-w-0 flex-1">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="md:hidden mr-1 shrink-0 hover:bg-gray-100"
                        onClick={onOpenSidebar}
                    >
                        <Menu className="size-5 text-gray-700" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-base font-bold px-2 hover:bg-gray-50 min-w-0 flex-1 justify-start"
                    >
                        <Hash className="size-5 mr-1.5 text-gray-500 shrink-0" />
                        <span className="truncate font-bold text-gray-900">
                            {channel?.name}
                        </span>
                        <ChevronDown className="size-4 ml-1 text-gray-500 shrink-0" />
                    </Button>
                    <span className="hidden md:block text-xs text-gray-500 pl-3 border-l border-gray-300 ml-3 h-4 truncate">
                        Add a topic
                    </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-500 hover:bg-gray-100 hidden sm:flex"
                    >
                        <Info className="size-5" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon-sm" 
                        className="text-gray-500 hover:bg-gray-100 sm:hidden"
                    >
                        <Info className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto flex flex-col-reverse px-4 py-2">
                <div className="flex flex-col">
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
                    {messages?.length === 0 && (
                        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                            No messages yet. Start the conversation!
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white">
                <MessageInput
                    placeholder={`Message #${channel?.name || "..."}`}
                    onSubmit={handleSend}
                />
            </div>
        </div>
    );
};