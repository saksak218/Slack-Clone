"use client";

import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
    MessageSquare,
    Smile,
    MoreHorizontal,
    File as FileIcon,
    Download
} from "lucide-react";
import dynamic from 'next/dynamic';
import { ConfirmDialog } from "./confirm-dialog";

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { authClient } from "@/lib/auth-client";

interface Reaction {
    emoji: string;
    count: number;
    userIds: string[];
}

interface Attachment {
    storageId: string;
    name: string;
    type: string;
    url?: string;
}

interface LinkPreview {
    url: string;
    title?: string;
    description?: string;
    image?: string;
}

interface MessageItemProps {
    id: string;
    name: string;
    text: string;
    createdAt: number;
    isAuthor?: boolean;
    userImage?: string;
    reactions?: Reaction[];
    replyCount?: number;
    threadTimestamp?: number;
    attachments?: Attachment[];
    linkPreviews?: LinkPreview[];
    onThreadOpen?: (id: string) => void;
    onReactionToggle?: (emoji: string) => void;
    onDelete?: (id: string) => void;
}

export const MessageItem = ({
    id,
    name,
    text,
    createdAt,
    isAuthor,
    userImage,
    reactions = [],
    replyCount = 0,
    threadTimestamp,
    attachments = [],
    linkPreviews = [],
    onThreadOpen,
    onReactionToggle,
    onDelete,
}: MessageItemProps) => {
    const session = authClient.useSession();
    const [isDeleting, setIsDeleting] = useState(false);
    const avatarFallback = name.charAt(0).toUpperCase();

    const formatTimestamp = (date: number) => {
        return isSameDay(date, new Date()) ? format(date, "h:mm a") : format(date, "MMM d, h:mm a");
    };

    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    return (
        <div className={cn(
            "flex items-start gap-3 px-4 py-1.5 group hover:bg-gray-50/50 transition-colors relative",
            "flex-row"
        )}>
            <div className="shrink-0 mt-0.5">
                <Avatar className="size-10 rounded">
                    <AvatarImage src={userImage} className="rounded" />
                    <AvatarFallback className={cn(
                        "rounded text-white text-xs font-semibold",
                        "bg-sky-500"
                    )}>
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                    <button className="font-bold text-sm text-gray-900 hover:underline">
                        {name}
                    </button>
                    <span className="text-xs text-gray-500">
                        {formatTimestamp(createdAt)}
                    </span>
                </div>
                <div className={cn(
                    "text-sm text-gray-900 leading-relaxed",
                    "[&_p]:mb-1 [&_p:last-child]:mb-0"
                )}>
                    <div
                        className="[&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5 [&_p]:!m-0 [&_p]:leading-relaxed [&_li]:!m-0 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-700 [&_code]:bg-[rgba(29,28,29,0.08)] [&_code]:text-[#e01e5a] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm [&_pre]:bg-[#f8f8f8] [&_pre]:border [&_pre]:border-[#e0e0e0] [&_pre]:text-[#1d1c1d] [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:font-mono [&_pre]:my-2 [&_pre]:overflow-x-auto [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800 [&_u]:underline"
                        dangerouslySetInnerHTML={{ __html: text }}
                    />
                </div>

                {/* Attachments */}
                {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {attachments.map((file) => (
                            <div key={file.storageId} className="max-w-[300px]">
                                {file.type.startsWith("image/") ? (
                                    <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group/img">
                                        <img
                                            src={file.url}
                                            alt={file.name}
                                            className="max-h-[300px] object-contain block"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/5 transition-colors cursor-pointer" />
                                        <button
                                            onClick={() => file.url && handleDownload(file.url, file.name)}
                                            className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-md shadow-sm opacity-0 group-hover/img:opacity-100 transition-opacity"
                                        >
                                            <Download className="size-4 text-gray-700" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className="flex items-center gap-2 p-2 rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors group/file relative pr-10"
                                    >
                                        <FileIcon className="size-5 text-gray-500 group-hover/file:text-sky-600 transition-colors" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-900 truncate">{file.name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase">{file.type.split("/")[1] || "file"}</p>
                                        </div>
                                        <button
                                            onClick={() => file.url && handleDownload(file.url, file.name)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                                            title="Download"
                                        >
                                            <Download className="size-4 text-gray-500" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {linkPreviews.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                        {linkPreviews.map((preview) => (
                            <a
                                key={preview.url}
                                href={preview.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col sm:flex-row gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors bg-white max-w-[600px] group/link"
                            >
                                {preview.image && (
                                    <div className="shrink-0 flex items-center justify-center">
                                        <img
                                            src={preview.image}
                                            alt=""
                                            className="w-full sm:w-32 h-24 object-cover rounded border border-gray-100"
                                        />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1 flex flex-col justify-center">
                                    <p className="text-sm font-bold text-sky-700 group-hover/link:underline truncate">
                                        {preview.title || preview.url}
                                    </p>
                                    {preview.description && (
                                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                            {preview.description}
                                        </p>
                                    )}
                                    <span className="text-[10px] text-gray-400 mt-2 truncate">
                                        {preview.url}
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                )}

                {reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 mb-1">
                        {reactions.map((r) => (
                            <button
                                key={r.emoji}
                                onClick={() => onReactionToggle?.(r.emoji)}
                                className={cn(
                                    "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border transition-colors",
                                    "bg-white border-gray-200 hover:border-gray-300",
                                    "text-gray-700 font-medium",
                                    r.userIds.includes(session.data?.user.id || "") && "bg-sky-100 border-sky-300 text-sky-800"
                                )}
                            >
                                <span>{r.emoji}</span>
                                <span className="text-[10px]">{r.count}</span>
                            </button>
                        ))}
                    </div>
                )}

                {replyCount > 0 && (
                    <button
                        onClick={() => onThreadOpen?.(id)}
                        className="flex items-center gap-2 mt-2 text-xs font-bold text-sky-700 hover:underline group/thread"
                    >
                        <MessageSquare className="size-3.5" />
                        <span>
                            {replyCount} {replyCount === 1 ? "reply" : "replies"}
                        </span>
                        {threadTimestamp && (
                            <span className="text-[10px] text-gray-500 font-normal group-hover/thread:no-underline">
                                Last reply {formatTimestamp(threadTimestamp)}
                            </span>
                        )}
                    </button>
                )}
            </div>

            {/* Hover Toolbar */}
            <div className="absolute right-4 -top-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-white border border-gray-200 rounded-md shadow-sm p-0.5 z-10">
                <TooltipProvider>
                    <Popover>
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <PopoverTrigger asChild>
                                    <button
                                        className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                                    >
                                        <Smile className="size-4" />
                                    </button>
                                </PopoverTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Add reaction</TooltipContent>
                        </Tooltip>
                        <PopoverContent className="p-0 border-none shadow-none" side="top" align="center">
                            <EmojiPicker
                                onEmojiClick={(emoji) => {
                                    onReactionToggle?.(emoji.emoji);
                                }}
                            />
                        </PopoverContent>
                    </Popover>

                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => onThreadOpen?.(id)}
                                className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                            >
                                <MessageSquare className="size-4" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Reply in thread</TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors">
                                <MoreHorizontal className="size-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-xs">Copy link to message</DropdownMenuItem>
                            {isAuthor && (
                                <DropdownMenuItem
                                    className="text-xs text-red-600 focus:text-red-600 focus:bg-red-50"
                                    onClick={() => setIsDeleting(true)}
                                >
                                    Delete message
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TooltipProvider>
            </div>

            <ConfirmDialog
                open={isDeleting}
                onOpenChange={setIsDeleting}
                onConfirm={() => onDelete?.(id)}
                title="Delete message"
                message="Are you sure you want to delete this message? This cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
            />
        </div>
    );
};
