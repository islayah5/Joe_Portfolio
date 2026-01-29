'use client';

import { useEffect } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { X } from 'lucide-react';

/**
 * YouTube Player Modal - Only mounts when user clicks active card
 */
export function YouTubePlayer() {
    const isPlayerOpen = usePortfolioStore((state) => state.isPlayerOpen);
    const playerCardId = usePortfolioStore((state) => state.playerCardId);
    const closePlayer = usePortfolioStore((state) => state.closePlayer);
    const videoCards = usePortfolioStore((state) => state.videoCards);

    const activeCard = videoCards.find((card) => card.id === playerCardId);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isPlayerOpen) {
                closePlayer();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isPlayerOpen, closePlayer]);

    if (!isPlayerOpen || !activeCard) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={closePlayer}
        >
            <div
                className="relative w-full max-w-6xl aspect-video mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={closePlayer}
                    className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
                >
                    <X size={32} />
                </button>

                {/* YouTube iframe */}
                <iframe
                    className="w-full h-full rounded-lg shadow-2xl"
                    src={`https://www.youtube.com/embed/${activeCard.youtubeId}?autoplay=1`}
                    title={activeCard.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />

                {/* Card info below player */}
                <div className="absolute -bottom-24 left-0 right-0 text-white">
                    <h2 className="text-2xl font-bold mb-2">{activeCard.title}</h2>
                    <p className="text-white/70 text-sm">{activeCard.description}</p>
                </div>
            </div>
        </div>
    );
}
