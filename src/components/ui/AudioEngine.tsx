'use client';

import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { usePortfolioStore } from '@/store/usePortfolioStore';

/**
 * Audio Engine - The Sonic Layer
 * Handles UI SFX (Clicks, Hover), Ambience, and Scroll Feedback
 */
export function AudioEngine() {
    const isIntroComplete = usePortfolioStore((state) => state.isIntroComplete);
    const soundEnabled = usePortfolioStore((state) => state.soundEnabled);
    const activeCardIndex = usePortfolioStore((state) => state.activeCardIndex);
    const prevCardIndex = useRef(activeCardIndex);

    // --- SOUND BANK ---
    // In a real app, these would be local files. For this demo, we use reliable CDNs or generated tones.
    // Ideally, the user would provide these assets.
    // Placeholder system for now using browser AudioContext for synthesized sounds if files missing?
    // No, let's assume we can use some standard UI sounds or synthesized ones.
    // Update: We'll simple oscillators for now if files aren't physically present, 
    // OR just set up the logic assuming files will be drop-in replaced.
    // Let's us Howler with some generic placeholder URLs.

    const sfx = useRef<{ [key: string]: Howl }>({});

    useEffect(() => {
        if (!soundEnabled) return;

        sfx.current = {
            click: new Howl({ src: ['/sfx/click.mp3'], volume: 0.5 }), // Need to add these files or use real URLs
            hover: new Howl({ src: ['/sfx/hover.mp3'], volume: 0.2 }),
            whoosh: new Howl({ src: ['/sfx/whoosh.mp3'], volume: 0.3 }),
            ambience: new Howl({ src: ['/sfx/ambience.mp3'], volume: 0.1, loop: true }),
            intro: new Howl({ src: ['/sfx/intro_swell.mp3'], volume: 0.6 }),
        };

        // Synthesizer fallback for "Click" if file fails (simulated for immediate effect)
        // Actually, let's purely rely on the structure being ready.

        return () => {
            Object.values(sfx.current).forEach(sound => sound.unload());
        };
    }, [soundEnabled]);

    // 1. Ambience - Starts when intro completes
    useEffect(() => {
        if (isIntroComplete && soundEnabled && sfx.current.ambience) {
            sfx.current.ambience.fade(0, 0.1, 2000);
            sfx.current.ambience.play();
        }
    }, [isIntroComplete, soundEnabled]);

    // 2. Play Sound on Card Change (Whoosh/Snap)
    useEffect(() => {
        if (!isIntroComplete || !soundEnabled) return;

        if (activeCardIndex !== prevCardIndex.current) {
            // Play whoosh
            sfx.current.whoosh?.play();
            prevCardIndex.current = activeCardIndex;
        }
    }, [activeCardIndex, isIntroComplete, soundEnabled]);

    // 3. Global Click/Hover Listener
    useEffect(() => {
        if (!isIntroComplete || !soundEnabled) return;

        const handleClick = () => {
            sfx.current.click?.play();
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('[role="button"]')) {
                sfx.current.hover?.play();
            }
        };

        window.addEventListener('click', handleClick);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('click', handleClick);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [isIntroComplete, soundEnabled]);

    return null; // Headless component
}
