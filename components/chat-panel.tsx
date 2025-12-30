import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { authClient } from '@/lib/auth-client';
import { Id } from '@/convex/_generated/dataModel';
import { Hash, Info, Menu, X, Lock, Users } from 'lucide-react';
import { MessageItem } from './message-item';
import { Button } from './ui/button';
import MessageInput from './message-input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import { ThreadPanel } from './thread-panel';
import { ChannelMembersDialog } from './channel-members-dialog';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
    id: string; // Can be channelId or conversationId/sessionId
    type: "channel" | "conversation";
    onOpenSidebar?: () => void;
}

export const ChatPanel = ({ id, type, onOpenSidebar }: ChatPanelProps) => {
    const session = authClient.useSession();
    const [threadMessageId, setThreadMessageId] = useState<Id<"messages"> | null>(null);
    const [isMembersOpen, setIsMembersOpen] = useState(false);

    const isChannel = type === "channel";

    const channel = useQuery(api.functions.channels.queries.getChannel,
        isChannel ? { id: id as Id<"channels"> } : "skip"
    );

    const conversation = useQuery(api.functions.chat.queries.getConversation,
        !isChannel ? { id: id as Id<"conversations"> } : "skip"
    );

    const otherMember = conversation ?
        (conversation.userOneId === session.data?.user.id ? conversation.userTwo : conversation.userOne) :
        null;

    const messages = useQuery(api.functions.chat.queries.getMessages,
        isChannel ? { channelId: id as Id<"channels"> } : { conversationId: id as Id<"conversations"> }
    );

    const createMessage = useMutation(api.functions.chat.mutations.createMessage);
    const toggleReaction = useMutation(api.functions.chat.mutations.toggleReaction);
    const removeMember = useMutation(api.functions.channels.mutations.removeChannelMember);
    const deleteMessage = useMutation(api.functions.chat.mutations.deleteMessage);

    const handleSend = async (text: string, attachments?: any[], linkPreviews?: any[]) => {
        if (session.data?.user.id) {
            try {
                await createMessage({
                    channelId: isChannel ? id as Id<"channels"> : undefined,
                    conversationId: !isChannel ? id as Id<"conversations"> : undefined,
                    userId: session.data.user.id,
                    text,
                    attachments,
                    linkPreviews,
                });
            } catch (error) {
                console.error("Failed to send message:", error);
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

    const handleDelete = async (messageId: string) => {
        try {
            await deleteMessage({ messageId: messageId as Id<"messages"> });
        } catch (error) {
            console.error("Failed to delete message:", error);
        }
    };

    const isOnline = (lastSeen?: number) => {
        if (!lastSeen) return false;
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        return now - lastSeen < fiveMinutes;
    };

    return (
        <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={threadMessageId ? 70 : 100} minSize={40}>
                <div className="flex flex-col h-full bg-white">
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
                            <div className="flex items-center px-2 py-1 min-w-0 flex-1">
                                {isChannel ? (
                                    channel?.isPrivate ? <Lock className="size-5 mr-1.5 text-gray-500 shrink-0" /> : <Hash className="size-5 mr-1.5 text-gray-500 shrink-0" />
                                ) : (
                                    <div className={cn(
                                        "size-3 mr-2 rounded-full shrink-0 border-2 border-white",
                                        isOnline(otherMember?.lastSeen) ? "bg-green-500" : "bg-gray-300"
                                    )} />
                                )}
                                <span className="truncate font-bold text-gray-900 text-base">
                                    {isChannel ? channel?.name : (otherMember?.name || "Direct Message")}
                                </span>
                            </div>
                            <span className="hidden md:block text-xs text-gray-500 pl-3 border-l border-gray-300 ml-3 h-4 truncate">
                                {isChannel ? (channel?.description || "Add a topic") : "Direct message history"}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            {isChannel && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-500 hover:bg-gray-100 hidden sm:flex"
                                    onClick={() => setIsMembersOpen(true)}
                                    title="Manage members"
                                >
                                    <Users className="size-5" />
                                </Button>
                            )}
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
                    <div className="flex-1 overflow-y-auto flex flex-col-reverse px-4 py-2">
                        <div className="flex flex-col">
                            {messages?.map((message) => (
                                <MessageItem
                                    key={message._id}
                                    id={message._id}
                                    name={message.userName}
                                    text={message.text}
                                    createdAt={message._creationTime}
                                    isAuthor={message.userId === session.data?.user.id}
                                    userImage={message.userImage}
                                    reactions={message.reactions}
                                    attachments={message.attachments}
                                    linkPreviews={message.linkPreviews}
                                    replyCount={message.replyCount}
                                    onThreadOpen={(id) => setThreadMessageId(id as Id<"messages">)}
                                    onReactionToggle={(emoji) => handleReactionToggle(message._id, emoji)}
                                    onDelete={handleDelete}
                                />
                            ))}
                            {messages?.length === 0 && (
                                <div className="flex items-center justify-center p-10 text-gray-500 text-sm">
                                    No messages yet. Start the conversation!
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="border-t border-gray-200 bg-white">
                        <MessageInput
                            placeholder={isChannel ? `Message #${channel?.name || "..."}` : `Message ${otherMember?.name || "Direct Message"}`}
                            onSubmit={handleSend}
                            workspaceId={channel?.workspaceId}
                        />
                    </div>
                </div>
            </ResizablePanel>

            {threadMessageId && (
                <>
                    <ResizableHandle className="w-1 bg-gray-200 hover:bg-sky-500 transition-colors" />
                    <ResizablePanel defaultSize={30} minSize={25}>
                        <ThreadPanel
                            parentMessageId={threadMessageId}
                            workspaceId={channel?.workspaceId as Id<"workspaces">}
                            onClose={() => setThreadMessageId(null)}
                        />
                    </ResizablePanel>
                </>
            )}

            {isChannel && (
                <ChannelMembersDialog
                    open={isMembersOpen}
                    onOpenChange={setIsMembersOpen}
                    channelId={id as Id<"channels">}
                />
            )}
        </ResizablePanelGroup>
    );
};
