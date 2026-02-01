'use client';

import { useEffect, useState } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';

/**
 * First-Time Scroll Hints - Animated guidance that fades after 3 seconds
 */
export function ScrollHints() {
    const [visible, setVisible] = useState(true);
    const isIntroComplete = usePortfolioStore((state) => state.isIntroComplete);

    useEffect(() => {
        if (isIntroComplete) {
            // Fade out after 3 seconds
            const timer = setTimeout(() => setVisible(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isIntroComplete]);

    if (!isIntroComplete || !visible) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 animate-fade-in pointer-events-none">
            {/* Animated Mouse Scroll Icon */}
            <div className="relative w-6 h-10 border-2 border-white/60 rounded-full flex items-start justify-center p-1.5">
                <div className="w-1 h-2 bg-white/60 rounded-full animate-scroll-wheel" />
            </div>

            {/* Text Hint */}
            <div className="text-white/80 font-display text-sm tracking-wider flex items-center gap-2">
                <span>SCROLL TO EXPLORE</span>
                <span className="text-brand-teal">↓</span>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="flex gap-4 text-white/40 text-xs font-display">
                <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white/10 rounded text-[10px]">↑</kbd>
                    <kbd className="px-2 py-1 bg-white/10 rounded text-[10px]">↓</kbd>
                    <span>or W/S</span>
                </div>
                <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white/10 rounded text-[10px]">SPACE</kbd>
                    <span>Next</span>
                </div>
            </div>
        </div>
    );
}
