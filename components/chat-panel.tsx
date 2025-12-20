"use client";

import { useState } from 'react';
import { Send, Hash } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { authClient } from '@/lib/auth-client';
import { Id } from '@/convex/_generated/dataModel';

interface ChatPanelProps {
    channelId: Id<"channels">;
}

export const ChatPanel = ({ channelId }: ChatPanelProps) => {
    const [input, setInput] = useState("");
    const session = authClient.useSession();

    // Real-time messages for the current channel
    const messages = useQuery(api.functions.chat.queries.getMessages, { channelId });
    const createMessage = useMutation(api.functions.chat.mutations.createMessage);

    const handleSend = async () => {
        if (input.trim() && session.data?.user.id) {
            try {
                await createMessage({
                    channelId,
                    userId: session.data.user.id,
                    name: session.data.user.name || "Anonymous",
                    text: input,
                });
                setInput("");
            } catch (error) {
                console.error("Failed to send message:", error);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="bg-white border-b p-4 flex items-center gap-2">
                <Hash size={20} className="text-gray-500" />
                <h2 className="text-xl font-bold">Chat Panel</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages?.map((message) => (
                    <div
                        key={message._id}
                        className={`flex ${message.userId === session.data?.user.id ? "justify-end" : "justify-start"}`}
                    >
                        <div className="flex flex-col max-w-[80%]">
                            {message.userId !== session.data?.user.id && (
                                <span className="text-xs text-gray-500 ml-1 mb-1">{message.name}</span>
                            )}
                            <div
                                className={`px-4 py-2 rounded-2xl ${message.userId === session.data?.user.id
                                    ? "bg-blue-600 text-white rounded-tr-none"
                                    : "bg-gray-100 text-gray-800 rounded-tl-none"
                                    }`}
                            >
                                {message.text}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                        onClick={handleSend}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};