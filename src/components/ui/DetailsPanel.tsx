'use client';

import { usePortfolioStore } from '@/store/usePortfolioStore';

interface DetailsPanelProps {
    isOpen: boolean;
    title?: string;
    description?: string;
    credits?: string[];
}

/**
 * Details Overlay Panel - Slides from Right
 * 
 * QC Fix: "Details" button was non-functional
 * Shows project description + credits when DETAILS button clicked
 */
export function DetailsPanel({ isOpen, title, description, credits }: DetailsPanelProps) {
    const toggleCardFlip = usePortfolioStore((state) => state.toggleCardFlip);
    const videoCards = usePortfolioStore((state) => state.videoCards);
    const activeCardIndex = usePortfolioStore((state) => state.activeCardIndex);

    const activeCard = videoCards[activeCardIndex];

    const handleClose = () => {
        if (activeCard) {
            toggleCardFlip(activeCard.id);
        }
    };

    return (
        <div
            className={`
                fixed right-0 top-0 h-screen w-full md:w-1/2
                bg-black/90 backdrop-blur-md
                transform transition-transform duration-500 ease-out
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                z-50 overflow-y-auto
                pointer-events-auto
            `}
            onClick={(e) => {
                // Close if clicking background (not content)
                if (e.target === e.currentTarget) {
                    handleClose();
                }
            }}
        >
            {/* Content Container */}
            <div className="relative h-full p-8 md:p-12">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="
                        absolute top-6 right-6
                        w-10 h-10
                        flex items-center justify-center
                        border border-cyan-400/50
                        hover:border-cyan-400
                        hover:bg-cyan-400/10
                        transition-all
                        group
                    "
                    aria-label="Close details"
                >
                    <svg
                        className="w-6 h-6 text-cyan-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                {/* Content */}
                <div className="max-w-2xl mt-16">
                    {/* Title */}
                    <h2 className="
                        text-3xl md:text-5xl
                        font-display
                        text-cyan-400
                        mb-8
                        tracking-wider
                    ">
                        {title || 'PROJECT DETAILS'}
                    </h2>

                    {/* Description */}
                    {description && (
                        <div className="mb-12">
                            <h3 className="
                                text-sm
                                font-display
                                text-cyan-400/60
                                tracking-widest
                                mb-4
                            ">
                                DESCRIPTION
                            </h3>
                            <p className="
                                text-white/80
                                text-lg
                                leading-relaxed
                                font-sans
                            ">
                                {description}
                            </p>
                        </div>
                    )}

                    {/* Credits */}
                    {credits && credits.length > 0 && (
                        <div className="border-t border-white/10 pt-8">
                            <h3 className="
                                text-sm
                                font-display
                                text-cyan-400/60
                                tracking-widest
                                mb-6
                            ">
                                CREDITS
                            </h3>
                            <ul className="space-y-3">
                                {credits.map((credit, i) => (
                                    <li
                                        key={i}
                                        className="
                                            text-white/60
                                            font-sans
                                            text-base
                                            leading-relaxed
                                        "
                                    >
                                        {credit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Keyboard Hint */}
                    <div className="
                        mt-16 pt-8
                        border-t border-white/5
                        text-white/30
                        text-xs
                        font-display
                        tracking-widest
                    ">
                        PRESS ESC TO CLOSE
                    </div>
                </div>
            </div>
        </div>
    );
}
