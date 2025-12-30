"use client";

import { useEffect } from "react";

/**
 * This component initializes audio context on first user interaction
 * to avoid autoplay restrictions in browsers
 */
export const AudioInitializer = () => {
    useEffect(() => {
        let initialized = false;

        const initAudio = () => {
            if (initialized) return;

            // Create a silent audio element and play it
            // This "unlocks" audio playback for the session
            const audio = new Audio();
            audio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
            audio.volume = 0;

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        initialized = true;
                        console.log("Audio initialized successfully");
                    })
                    .catch(() => {
                        // Silently fail - will try again on next interaction
                    });
            }
        };

        // Try to initialize on various user interactions
        const events = ['click', 'touchstart', 'keydown'];
        events.forEach(event => {
            document.addEventListener(event, initAudio, { once: true });
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, initAudio);
            });
        };
    }, []);

    return null;
};
