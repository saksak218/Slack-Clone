import React from "react";
import { NotificationManager } from "@/components/notification-manager";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-full">
            <NotificationManager />
            {children}
        </div>
    )
}

export default MainLayout