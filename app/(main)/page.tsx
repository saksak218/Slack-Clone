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
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function Home() {
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-screen w-full overflow-hidden bg-[#3F0E40]">
            {/* Mobile Sidebar */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="w-[280px] p-0 bg-[#3F0E40] border-r border-[#616061]/20">
                    <Sidebar
                        selectedChannelId={selectedChannelId || undefined}
                        onSelectChannel={(id) => {
                            setSelectedChannelId(id);
                            setSidebarOpen(false);
                        }}
                    />
                </SheetContent>
            </Sheet>

            {/* Desktop Layout */}
            <div className="hidden md:block h-full">
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

                    <ResizableHandle className="w-1 bg-[#3F0E40] border-r border-[#616061]/20" />

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

            {/* Mobile Layout */}
            <div className="md:hidden h-full">
                {selectedChannelId ? (
                    <ChatPanel
                        channelId={selectedChannelId as Id<"channels">}
                        onOpenSidebar={() => setSidebarOpen(true)}
                    />
                ) : (
                    <div className="h-full bg-[#3F0E40]">
                        <Sidebar
                            selectedChannelId={selectedChannelId || undefined}
                            onSelectChannel={(id) => setSelectedChannelId(id)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}