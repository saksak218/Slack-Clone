"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

interface NotificationSettings {
    sound: boolean;
    vibration: boolean;
    native: boolean;
}

interface NotificationContextType {
    settings: NotificationSettings;
    permissionGranted: boolean;
    updateSettings: (newSettings: Partial<NotificationSettings>) => void;
    requestPermission: () => Promise<boolean>;
    toggleNativeNotifications: () => Promise<boolean>;
    notify: (title: string, body: string, icon?: string) => void;
    playSound: () => void;
    vibrate: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = "slack_clone_notification_settings";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<NotificationSettings>({
        sound: true,
        vibration: true,
        native: false,
    });

    const [permissionGranted, setPermissionGranted] = useState(false);
    const settingsRef = useRef(settings);

    // Keep ref in sync with state
    useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    useEffect(() => {
        // Load settings from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setSettings(parsed);
                settingsRef.current = parsed;
            } catch (e) {
                console.error("Failed to parse notification settings", e);
            }
        }

        // Check current notification permission
        if ("Notification" in window) {
            setPermissionGranted(Notification.permission === "granted");
        }
    }, []);

    const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
        setSettings((prev) => {
            const updated = { ...prev, ...newSettings };
            settingsRef.current = updated;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const requestPermission = useCallback(async () => {
        if ("Notification" in window) {
            const permission = await Notification.requestPermission();
            const granted = permission === "granted";
            setPermissionGranted(granted);
            updateSettings({ native: granted });
            return granted;
        }
        return false;
    }, [updateSettings]);

    const toggleNativeNotifications = useCallback(async () => {
        if (!permissionGranted) {
            return await requestPermission();
        } else {
            const newValue = !settingsRef.current.native;
            updateSettings({ native: newValue });
            return newValue;
        }
    }, [permissionGranted, requestPermission, updateSettings]);

    const playSound = useCallback(() => {
        if (!settingsRef.current.sound) return;

        try {
            const audio = new Audio(
                "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3",
            );
            audio.volume = 0.5;

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch((e) => {
                    console.log("Audio autoplay prevented:", e.message);
                });
            }
        } catch (e) {
            console.error("Error creating audio", e);
        }
    }, []);

    const vibrate = useCallback(() => {
        if (!settingsRef.current.vibration) return;

        try {
            if ("vibrate" in navigator) {
                navigator.vibrate(200);
            }
        } catch (e) {
            console.error("Vibration failed", e);
        }
    }, []);

    const notify = useCallback(
        (title: string, body: string, icon?: string) => {
            const currentSettings = settingsRef.current;

            console.log('[Notification] notify called:', { title, body, currentSettings });

            if (currentSettings.sound) {
                console.log('[Notification] Playing sound...');
                playSound();
            }

            if (currentSettings.vibration) {
                console.log('[Notification] Triggering vibration...');
                vibrate();
            }

            if (currentSettings.native && Notification.permission === "granted") {
                console.log('[Notification] Showing native notification...');
                try {
                    new Notification(title, {
                        body,
                        icon: icon || "/slack.svg",
                        badge: "/slack.svg",
                    });
                } catch (e) {
                    console.error("Failed to show notification", e);
                }
            } else {
                console.log('[Notification] Native notification skipped:', {
                    native: currentSettings.native,
                    permission: Notification.permission
                });
            }
        },
        [playSound, vibrate],
    );

    const value: NotificationContextType = {
        settings,
        permissionGranted,
        updateSettings,
        requestPermission,
        toggleNativeNotifications,
        notify,
        playSound,
        vibrate,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}
