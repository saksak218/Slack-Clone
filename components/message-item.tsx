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
            "flex items-end gap-2 px-5 py-2 group transition-colors",
            isAuthor ? "flex-row-reverse" : "flex-row"
        )}>
            <div className="shrink-0 mb-1">
                <Avatar className="size-8 rounded-md">
                    <AvatarImage src={userImage} className="rounded-md" />
                    <AvatarFallback className={cn(
                        "rounded-md text-white text-[10px] font-semibold",
                        isAuthor ? "bg-[#1164A3]" : "bg-sky-500"
                    )}>
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>
            </div>
            <div className={cn(
                "flex flex-col max-w-[85%] md:max-w-[70%] gap-1",
                isAuthor ? "items-end" : "items-start"
            )}>
                {!isAuthor && (
                    <div className="flex items-center gap-2 pl-1">
                        <button className="font-bold text-xs hover:underline">
                            {name}
                        </button>
                        <span className="text-[10px] text-muted-foreground">
                            {format(createdAt, "h:mm a")}
                        </span>
                    </div>
                )}
                <div className={cn(
                    "px-4 py-2 text-sm shadow-sm",
                    isAuthor
                        ? "bg-[#1164A3] text-white rounded-2xl rounded-tr-none"
                        : "bg-[#F8F8F8] text-[#1D1C1D] rounded-2xl rounded-tl-none border border-slate-200"
                )}>
                    <div dangerouslySetInnerHTML={{ __html: text }} />
                    {isAuthor && (
                        <div className="text-[9px] text-white/70 mt-1 text-right">
                            {format(createdAt, "h:mm a")}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
