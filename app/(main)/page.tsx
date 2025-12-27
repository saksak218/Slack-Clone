"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@/components/ui/resizable";
import { Sidebar } from "@/components/sidebar";
import { ChatPanel } from "@/components/chat-panel";
import { Id } from "@/convex/_generated/dataModel";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Home() {
    const router = useRouter();
    const session = authClient.useSession();
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCheckingWorkspace, setIsCheckingWorkspace] = useState(true);

    // Check if user has selected a workspace
    useEffect(() => {
        if (!session.data?.user.id) {
            router.push("/login");
            return;
        }

        // Check if workspace is selected in sessionStorage
        const selectedWorkspaceId = sessionStorage.getItem("selectedWorkspaceId");
        
        if (!selectedWorkspaceId) {
            // Check if user has any workspaces
            const checkWorkspaces = async () => {
                try {
                    // We'll check this in the workspace-select page
                    router.push("/workspace-select");
                } catch (error) {
                    console.error("Error checking workspaces:", error);
                    router.push("/workspace-select");
                } finally {
                    setIsCheckingWorkspace(false);
                }
            };
            checkWorkspaces();
        } else {
            setIsCheckingWorkspace(false);
        }
    }, [session.data?.user.id, router]);

    // Show loading while checking workspace
    if (isCheckingWorkspace || !session.data?.user.id) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#3F0E40]">
                <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

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

                    <ResizableHandle className="w-1 bg-[#3F0E40] hover:bg-[#350D36] transition-colors" />

                    <ResizablePanel defaultSize={80} className="bg-white">
                        {selectedChannelId ? (
                            <ChatPanel channelId={selectedChannelId as Id<"channels">} />
                        ) : (
                            <div className="h-full flex items-center justify-center bg-white text-gray-500">
                                <div className="text-center">
                                    <p className="text-lg font-medium mb-1">Select a channel to start chatting</p>
                                    <p className="text-sm text-gray-400">Choose a channel from the sidebar</p>
                                </div>
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