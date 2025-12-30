"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNotifications } from "@/hooks/use-notifications";
import { authClient } from "@/lib/auth-client";
import { useEffect, useRef, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export const NotificationManager = () => {
    const session = authClient.useSession();
    const { notify } = useNotifications();
    const lastMessageRef = useRef<Record<string, string>>({});
    const [workspaceId, setWorkspaceId] = useState<Id<"workspaces"> | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const selected = sessionStorage.getItem("selectedWorkspaceId");
            if (selected) setWorkspaceId(selected as Id<"workspaces">);
        }
    }, []);

    const unreadCounts = useQuery(api.functions.chat.queries.getUnreadCounts,
        workspaceId && session.data?.user.id ? { workspaceId, userId: session.data.user.id } : "skip"
    );

    // This is a bit complex: we need to biết when the TOTAL count increases
    // to trigger a notification. 
    // But better: we need to know WHICH channel/DM has a NEW message.

    useEffect(() => {
        if (!unreadCounts) return;

        let totalUnread = 0;

        unreadCounts.channels.forEach((c: any) => {
            totalUnread += c.count;
            if (isInitialized) {
                const lastCount = parseInt(lastMessageRef.current[c.id] || "0");
                if (c.count > lastCount) {
                    // New message in channel
                    // We don't have the text here, so we just Notify "New message in channel"
                    // Or we could fetch the last message, but that's expensive for every channel.
                    // For now, a generic notification or play sound.
                    notify("New Message", `You have ${c.count} unread messages in a channel`);
                }
            }
            lastMessageRef.current[c.id] = c.count.toString();
        });

        unreadCounts.conversations.forEach((c: any) => {
            totalUnread += c.count;
            if (isInitialized) {
                const lastCount = parseInt(lastMessageRef.current[c.id] || "0");
                if (c.count > lastCount) {
                    notify("New Direct Message", `You have ${c.count} unread direct messages`);
                }
            }
            lastMessageRef.current[c.id] = c.count.toString();
        });

        if (!isInitialized) {
            setIsInitialized(true);
        }

        // Update document title
        if (totalUnread > 0) {
            document.title = `(${totalUnread}) Slack Clone`;
        } else {
            document.title = "Slack Clone";
        }
    }, [unreadCounts, notify, isInitialized]);

    return null;
};
