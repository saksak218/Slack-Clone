"use client";

import { Search, Info, History, LogOut, Bell, Volume2, Waves } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
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

    const { settings, updateSettings, requestPermission } = useNotifications();

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <nav className="bg-[#350D36] text-white h-[40px] flex items-center px-4 shrink-0">
            {/* Left side - empty for balance or could have more icons */}
            <div className="flex-1 hidden md:flex" />

            {/* Middle - Search and History (Centered) */}
            <div className="flex-[2] flex justify-center items-center gap-2">
                <Button variant="ghost" size="icon-sm" className="hidden md:flex text-[#D1D1D1] hover:text-white hover:bg-white/10 shrink-0">
                    <History className="size-4" />
                </Button>

                <div className="min-w-[280px] max-w-[642px] grow h-[26px] bg-[#5D3D5E] border border-[#616061]/20 rounded-md px-2 flex items-center gap-2 hover:bg-[#684a69] transition-colors cursor-pointer text-[#D1D1D1]">
                    <Search className="size-3.5" />
                    <span className="text-xs">Search workspace</span>
                </div>

                <Button variant="ghost" size="icon-sm" className="hidden md:flex text-[#D1D1D1] hover:text-white hover:bg-white/10 shrink-0">
                    <Info className="size-4" />
                </Button>
            </div>

            {/* Right side - User profile */}
            <div className="flex-1 flex items-center justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Avatar className="size-7 rounded-sm border border-white/20 cursor-pointer hover:opacity-80 transition-opacity">
                            <AvatarImage src={user?.image || undefined} />
                            <AvatarFallback className="bg-sky-500 text-[10px] text-white rounded-sm">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="text-xs">Account</DropdownMenuLabel>
                        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                            <LogOut className="size-4 mr-2" />
                            Sign Out
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs">Notifications</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => updateSettings({ sound: !settings.sound })}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center">
                                <Volume2 className={cn("size-4 mr-2", !settings.sound && "text-gray-400")} />
                                Sound
                            </div>
                            <span className="text-[10px] uppercase font-bold text-gray-400">
                                {settings.sound ? "On" : "Off"}
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => updateSettings({ vibration: !settings.vibration })}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center">
                                <Waves className={cn("size-4 mr-2", !settings.vibration && "text-gray-400")} />
                                Vibration
                            </div>
                            <span className="text-[10px] uppercase font-bold text-gray-400">
                                {settings.vibration ? "On" : "Off"}
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => requestPermission()}>
                            <Bell className="size-4 mr-2" />
                            Enable Desktop Alerts
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
};
