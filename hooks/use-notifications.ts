"use client";

import { useEffect, useState, useCallback } from "react";

interface NotificationSettings {
  sound: boolean;
  vibration: boolean;
  native: boolean;
}

const STORAGE_KEY = "slack_clone_notification_settings";

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>({
    sound: true,
    vibration: true,
    native: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse notification settings", e);
      }
    }
  }, []);

  const updateSettings = useCallback(
    (newSettings: Partial<NotificationSettings>) => {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    [settings],
  );

  const requestPermission = useCallback(async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      updateSettings({ native: permission === "granted" });
      return permission === "granted";
    }
    return false;
  }, [updateSettings]);

  const playSound = useCallback(() => {
    if (!settings.sound) return;
    const audio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3",
    ); // A pleasant notification sound
    audio.play().catch((e) => console.error("Failed to play sound", e));
  }, [settings.sound]);

  const vibrate = useCallback(() => {
    if (!settings.vibration) return;
    if ("vibrate" in navigator) {
      navigator.vibrate(200);
    }
  }, [settings.vibration]);

  const notify = useCallback(
    (title: string, body: string, icon?: string) => {
      if (settings.native && Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: icon || "/slack.svg",
        });
      }
      playSound();
      vibrate();
    },
    [settings.native, playSound, vibrate],
  );

  return {
    settings,
    updateSettings,
    requestPermission,
    notify,
    playSound,
    vibrate,
  };
}
