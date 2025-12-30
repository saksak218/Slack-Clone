"use client";

import { Search, Info, History, LogOut, Bell, Volume2, Waves, Clock, HelpCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
    const router = useRouter();
    const session = authClient.useSession();
    const user = session.data?.user;
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<Id<"workspaces"> | null>(null);

    const { settings, permissionGranted, updateSettings, toggleNativeNotifications } = useNotifications();

    useEffect(() => {
        const id = sessionStorage.getItem("selectedWorkspaceId");
        if (id) setActiveWorkspaceId(id as Id<"workspaces">);
    }, []);

    const workspace = useQuery(api.functions.workspaces.queries.getWorkspace,
        activeWorkspaceId ? { workspaceId: activeWorkspaceId } : "skip"
    );

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <nav className="bg-[#350d36] text-white h-[45px] flex items-center px-2 sm:px-3 shrink-0 ">
            {/* Left side - Workspace selector */}
            <div className="flex items-center md:hidden gap-1 sm:gap-2">
                <div
                    onClick={() => router.push("/workspace-select")}
                    className="size-[28px] rounded overflow-hidden flex items-center justify-center bg-white/95 text-[#350d36] font-semibold text-[15px] cursor-pointer hover:bg-white transition-colors shadow-sm"
                    title="Switch workspace"
                >
                    {workspace?.name?.charAt(0).toUpperCase() || "S"}
                </div>
            </div>

            {/* Middle - Search */}
            <div className="flex-1 flex justify-center items-center px-2 sm:px-4 max-w-[680px] mx-auto">
                <div className="w-full h-[24px] bg-[#522653] hover:bg-[#5f2e60] border border-[#6b3d6c]/40 rounded-md px-2 flex items-center gap-2 transition-colors cursor-text group">
                    <Search className="size-[14px] text-white/60 group-hover:text-white/80 transition-colors flex-shrink-0" />
                    <span className="text-[13px] text-white/60 group-hover:text-white/80 transition-colors truncate">
                        Search {workspace?.name || "workspace"}
                    </span>
                </div>
            </div>

            {/* Right side - Actions and Profile */}
            <div className="flex items-center gap-0.5 sm:gap-1">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="hidden sm:flex size-[28px] text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="History"
                >
                    <Clock className="size-[18px]" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="hidden sm:flex size-[28px] text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Help"
                >
                    <HelpCircle className="size-[18px]" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="ml-1 sm:ml-2 focus:outline-none focus:ring-2 focus:ring-white/20 rounded">
                            <Avatar className="size-[28px] rounded cursor-pointer hover:opacity-90 transition-opacity ring-2 ring-transparent hover:ring-white/20">
                                <AvatarImage src={user?.image || undefined} />
                                <AvatarFallback className="bg-[#007a5a] text-[13px] font-medium text-white rounded">
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[280px] p-0" sideOffset={8}>
                        <div className="p-4 border-b">
                            <div className="flex items-center gap-3">
                                <Avatar className="size-9 rounded">
                                    <AvatarImage src={user?.image || undefined} />
                                    <AvatarFallback className="bg-[#007a5a] text-white">
                                        {user?.name?.charAt(0).toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-[15px] truncate">{user?.name || "User"}</div>
                                    <div className="text-[13px] text-muted-foreground truncate">{user?.email}</div>
                                </div>
                            </div>
                        </div>

                        <div className="py-1">
                            <DropdownMenuLabel className="px-4 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase">
                                Notifications
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => updateSettings({ sound: !settings.sound })}
                                className="px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-accent"
                            >
                                <div className="flex items-center gap-3">
                                    <Volume2 className={cn("size-[18px]", !settings.sound && "text-muted-foreground")} />
                                    <span className="text-[15px]">Sound</span>
                                </div>
                                <div className={cn(
                                    "text-[11px] font-bold uppercase px-2 py-0.5 rounded",
                                    settings.sound ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                )}>
                                    {settings.sound ? "On" : "Off"}
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => updateSettings({ vibration: !settings.vibration })}
                                className="px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-accent"
                            >
                                <div className="flex items-center gap-3">
                                    <Waves className={cn("size-[18px]", !settings.vibration && "text-muted-foreground")} />
                                    <span className="text-[15px]">Vibration</span>
                                </div>
                                <div className={cn(
                                    "text-[11px] font-bold uppercase px-2 py-0.5 rounded",
                                    settings.vibration ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                )}>
                                    {settings.vibration ? "On" : "Off"}
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => toggleNativeNotifications()}
                                className="px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-accent"
                            >
                                <div className="flex items-center gap-3">
                                    <Bell className={cn("size-[18px]", !settings.native && "text-muted-foreground")} />
                                    <span className="text-[15px]">{settings.native && permissionGranted ? "Disable" : "Enable"} Notifications</span>
                                </div>
                                {settings.native && permissionGranted && (
                                    <div className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-green-100 text-green-700">
                                        On
                                    </div>
                                )}
                            </DropdownMenuItem>
                        </div>

                        <DropdownMenuSeparator className="my-0" />

                        <div className="py-1">
                            <DropdownMenuItem
                                onClick={handleSignOut}
                                className="px-4 py-2 text-[15px] text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                            >
                                <LogOut className="size-[18px] mr-3" />
                                Sign out of {workspace?.name || "workspace"}
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
};