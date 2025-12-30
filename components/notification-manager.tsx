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
    const [workspaceId, setWorkspaceId] = useState<Id<"workspaces"> | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const previousUnreadRef = useRef<Record<string, { count: number; lastMessageTime: number | null }>>({});

    useEffect(() => {
        if (typeof window !== "undefined") {
            const selected = sessionStorage.getItem("selectedWorkspaceId");
            if (selected) setWorkspaceId(selected as Id<"workspaces">);
        }
    }, []);

    const unreadCounts = useQuery(api.functions.chat.queries.getUnreadCounts,
        workspaceId && session.data?.user.id ? { workspaceId, userId: session.data.user.id } : "skip"
    );

    useEffect(() => {
        if (!unreadCounts || !session.data?.user.id) return;

        // Initialize on first load without triggering notifications
        if (!isInitialized) {
            unreadCounts.channels.forEach((c: any) => {
                const key = `channel_${c.id}`;
                previousUnreadRef.current[key] = {
                    count: c.count,
                    lastMessageTime: c.lastMessageTime
                };
            });
            unreadCounts.conversations.forEach((c: any) => {
                const key = `conversation_${c.id}`;
                previousUnreadRef.current[key] = {
                    count: c.count,
                    lastMessageTime: c.lastMessageTime
                };
            });
            setIsInitialized(true);
            return;
        }

        let totalUnread = 0;
        const currentUserId = session.data.user.id;

        // Check channels for new messages from OTHER users
        unreadCounts.channels.forEach((c: any) => {
            totalUnread += c.count;
            const key = `channel_${c.id}`;
            const previous = previousUnreadRef.current[key] || { count: 0, lastMessageTime: null };

            // Only notify if:
            // 1. Count increased
            // 2. Last message is NOT from current user
            // 3. There's a new message timestamp
            if (c.count > previous.count &&
                c.lastMessageUserId &&
                c.lastMessageUserId !== currentUserId &&
                c.lastMessageTime !== previous.lastMessageTime) {

                const newMessages = c.count - previous.count;
                notify(
                    "New Message",
                    `You have ${newMessages} new ${newMessages === 1 ? 'message' : 'messages'} in a channel`
                );
            }

            previousUnreadRef.current[key] = {
                count: c.count,
                lastMessageTime: c.lastMessageTime
            };
        });

        // Check conversations for new messages from OTHER users
        unreadCounts.conversations.forEach((c: any) => {
            totalUnread += c.count;
            const key = `conversation_${c.id}`;
            const previous = previousUnreadRef.current[key] || { count: 0, lastMessageTime: null };

            // Only notify if:
            // 1. Count increased
            // 2. Last message is NOT from current user
            // 3. There's a new message timestamp
            if (c.count > previous.count &&
                c.lastMessageUserId &&
                c.lastMessageUserId !== currentUserId &&
                c.lastMessageTime !== previous.lastMessageTime) {

                const newMessages = c.count - previous.count;
                notify(
                    "New Direct Message",
                    `You have ${newMessages} new ${newMessages === 1 ? 'message' : 'messages'}`
                );
            }

            previousUnreadRef.current[key] = {
                count: c.count,
                lastMessageTime: c.lastMessageTime
            };
        });

        // Update document title
        if (totalUnread > 0) {
            document.title = `(${totalUnread}) Slack Clone`;
        } else {
            document.title = "Slack Clone";
        }
    }, [unreadCounts, notify, isInitialized, session.data?.user.id]);

    return null;
};
