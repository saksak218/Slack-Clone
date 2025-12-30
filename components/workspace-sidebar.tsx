"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export const WorkspaceSidebar = () => {
    const router = useRouter();
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<Id<"workspaces"> | null>(null);

    useEffect(() => {
        const id = sessionStorage.getItem("selectedWorkspaceId");
        if (id) setActiveWorkspaceId(id as Id<"workspaces">);
    }, []);

    const workspace = useQuery(api.functions.workspaces.queries.getWorkspace,
        activeWorkspaceId ? { workspaceId: activeWorkspaceId } : "skip"
    );

    return (
        <aside className="w-[70px] bg-[#350D36] flex flex-col items-center gap-y-4 py-3 shrink-0">
            <div
                onClick={() => router.push("/workspace-select")}
                className={cn(
                    "size-9 rounded-lg flex items-center justify-center bg-[#ABABAD] text-[#350D36] font-bold text-lg cursor-pointer hover:bg-white/90 transition-all",
                    activeWorkspaceId && "bg-white"
                )}
            >
                {workspace?.name?.charAt(0).toUpperCase() || "S"}
            </div>

            <div className="flex flex-col items-center gap-y-2 pb-4 mt-auto">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-lg bg-[#5D3D5E]/50 hover:bg-[#5D3D5E] text-white transition-all"
                >
                    <Plus className="size-5" />
                </Button>
            </div>
        </aside>
    );
};
