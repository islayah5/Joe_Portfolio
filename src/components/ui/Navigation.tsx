'use client';

import { usePortfolioStore } from '@/store/usePortfolioStore';

/**
 * Navigation UI - Overlay on top of 3D scene
 */
export function Navigation() {
    const videoCards = usePortfolioStore((state) => state.videoCards);
    const activeCardIndex = usePortfolioStore((state) => state.activeCardIndex);
    const activeCard = videoCards[activeCardIndex];

    return (
        <div className="fixed inset-0 pointer-events-none z-10">
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start">
                <div>
                    <h1 className="text-white text-2xl font-bold tracking-tight">
                        FILMMAKER PORTFOLIO
                    </h1>
                    <p className="text-cyan-400 text-sm mt-1">Scroll to navigate</p>
                </div>

                <div className="text-right">
                    <p className="text-white/50 text-xs">
                        {activeCardIndex + 1} / {videoCards.length}
                    </p>
                </div>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="max-w-md">
                    <h2 className="text-white text-3xl font-bold mb-2">
                        {activeCard?.title}
                    </h2>
                    <p className="text-white/70 text-sm mb-4">
                        {activeCard?.description}
                    </p>

                    <div className="flex gap-4 items-center pointer-events-auto">
                        <button className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded transition-colors">
                            Watch Now
                        </button>
                        <button className="px-6 py-2 border border-white/30 hover:border-white/60 text-white rounded transition-colors">
                            View Credits
                        </button>
                    </div>
                </div>

                {/* Controls hint */}
                <div className="absolute bottom-6 right-6 text-white/40 text-xs text-right">
                    <p>SCROLL to navigate</p>
                    <p>CLICK card to watch</p>
                    <p>SPACEBAR to flip</p>
                </div>
            </div>
        </div>
    );
}
