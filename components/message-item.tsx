"use client";

import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageItemProps {
    name: string;
    text: string;
    createdAt: number;
    isAuthor?: boolean;
    userImage?: string;
}

export const MessageItem = ({ name, text, createdAt, isAuthor, userImage }: MessageItemProps) => {
    const avatarFallback = name.charAt(0).toUpperCase();

    return (
        <div className={cn(
            "flex items-start gap-3 px-4 py-1.5 group hover:bg-gray-50/50 transition-colors",
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
                        {format(createdAt, "h:mm a")}
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
            </div>
        </div>
    );
};
