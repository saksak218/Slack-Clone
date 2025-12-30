import React from "react";
import { NotificationManager } from "@/components/notification-manager";
import { AudioInitializer } from "@/components/audio-initializer";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-full">
            <NotificationManager />
            <AudioInitializer />
            {children}
        </div>
    )
}

export default MainLayout