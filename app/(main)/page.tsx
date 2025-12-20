"use client";

import { useState } from "react";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@/components/ui/resizable";
import { Sidebar } from "@/components/sidebar";
import { ChatPanel } from "@/components/chat-panel";
import { Id } from "@/convex/_generated/dataModel";

export default function Home() {
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

    return (
        <div className="h-screen w-full overflow-hidden bg-[#3F0E40]">
            <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel
                    defaultSize={20}
                    minSize={15}
                    maxSize={30}
                    className="bg-[#3F0E40]"
                >
                    <Sidebar
                        selectedChannelId={selectedChannelId || undefined}
                        onSelectChannel={(id) => setSelectedChannelId(id)}
                    />
                </ResizablePanel>

                <ResizableHandle withHandle className="w-1 bg-[#3F0E40] border-r border-[#616061]/20" />

                <ResizablePanel defaultSize={80}>
                    {selectedChannelId ? (
                        <ChatPanel channelId={selectedChannelId as Id<"channels">} />
                    ) : (
                        <div className="h-full flex items-center justify-center bg-white text-gray-500">
                            Select a channel to start chatting
                        </div>
                    )}
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
