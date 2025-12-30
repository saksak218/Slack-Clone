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
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";

export default function Home() {
    const router = useRouter();
    const session = authClient.useSession();
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCheckingWorkspace, setIsCheckingWorkspace] = useState(true);

    const updatePresence = useMutation(api.functions.users.mutations.updatePresence);

    // Presence heartbeat
    useEffect(() => {
        const userId = session.data?.user?.id;
        if (!userId) return;

        // Update presence immediately on mount
        updatePresence({ userId });

        const interval = setInterval(() => {
            updatePresence({ userId });
        }, 60000); // 1 minute

        return () => clearInterval(interval);
    }, [session.data?.user?.id, updatePresence]);

    // Check if user has selected a workspace
    useEffect(() => {
        // Wait for session to load
        if (session.isPending) return;

        if (!session.data || !session.data.user || !session.data.user.id) {
            router.push("/login");
            return;
        }

        // Check if workspace is selected in sessionStorage
        const selectedWorkspaceId = sessionStorage.getItem("selectedWorkspaceId");

        if (!selectedWorkspaceId) {
            router.push("/workspace-select");
        } else {
            setIsCheckingWorkspace(false);
        }
    }, [session.isPending, session.data?.user.id, router]);

    // Show loading while checking workspace or session
    if (session.isPending || isCheckingWorkspace) {
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
        <div className="h-screen w-full overflow-hidden flex flex-col bg-[#3F0E40]">
            <Navbar />

            <div className="flex-1 flex overflow-hidden">
                <div className="hidden md:flex flex-col">
                    <WorkspaceSidebar />
                </div>

                <div className="flex-1 flex flex-col min-w-0 bg-white md:rounded-tl-lg overflow-hidden">
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
                    <div className="hidden md:flex h-full">
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
                                    <ChatPanel id={selectedChannelId} />
                                ) : (
                                    <div className="h-full flex items-center justify-center bg-white text-gray-500">
                                        <div className="text-center">
                                            <p className="text-lg font-medium mb-1 text-gray-900">Select a channel to start chatting</p>
                                            <p className="text-sm text-gray-500">Choose a channel from the sidebar</p>
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
                                id={selectedChannelId}
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
            </div>
        </div>
    );
}