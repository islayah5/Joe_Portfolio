'use client';

import { usePortfolioStore } from '@/store/usePortfolioStore';

/**
 * Scroll Progress Indicator - Minimalist Glass-morphic Sidebar
 * Shows current position, section markers, and navigation
 */
export function ScrollIndicator() {
    const scrollProgress = usePortfolioStore((state) => state.scrollProgress);
    const videoCards = usePortfolioStore((state) => state.videoCards);
    const scrollToCard = usePortfolioStore((state) => state.scrollToCard);
    const activeCardIndex = usePortfolioStore((state) => state.activeCardIndex);

    // Section definitions
    const sections = [
        { name: 'HERO', position: 0.0, color: '#22d3ee' },
        { name: 'NARRATIVE', position: 0.15, color: '#a78bfa' },
        { name: 'COMMERCIAL', position: 0.45, color: '#fbbf24' },
        { name: 'MUSIC VIDEO', position: 0.75, color: '#f472b6' },
        { name: 'CONTACT', position: 0.95, color: '#ef4444' },
    ];

    // Calculate progress bar position (0-100%)
    const progressPercent = Math.min(100, Math.max(0, (scrollProgress % 1) * 100));

    return (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-4 pointer-events-auto">
            {/* Progress Bar */}
            <div className="relative h-[300px] w-1 bg-white/10 rounded-full backdrop-blur-sm overflow-hidden">
                {/* Active Progress */}
                <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-teal via-purple-400 to-brand-gold rounded-full transition-all duration-300 ease-out"
                    style={{ height: `${progressPercent}%` }}
                />

                {/* Section Markers */}
                {sections.map((section, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            const cardIndex = videoCards.findIndex(
                                (card) => card.position >= section.position
                            );
                            if (cardIndex !== -1) scrollToCard(cardIndex);
                        }}
                        className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white/40 hover:border-white hover:scale-150 transition-all duration-200 cursor-pointer group"
                        style={{
                            bottom: `${section.position * 100}%`,
                            backgroundColor: section.color,
                        }}
                        title={section.name}
                    >
                        {/* Tooltip on hover */}
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 text-white text-xs font-display rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {section.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Active Section Label */}
            <div className="font-display text-xs text-white/60 tracking-widest">
                {sections.find((s, idx) => {
                    const nextSection = sections[idx + 1];
                    return (
                        (scrollProgress % 1) >= s.position &&
                        (!nextSection || (scrollProgress % 1) < nextSection.position)
                    );
                })?.name || 'HERO'}
            </div>

            {/* Keyboard Hints (subtle) */}
            <div className="flex flex-col gap-1 text-white/30 text-[10px] font-display">
                <div>↑↓ SCROLL</div>
                <div>1-5 JUMP</div>
            </div>
        </div>
    );
}
