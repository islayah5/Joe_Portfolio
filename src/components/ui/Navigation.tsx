'use client';

import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useEffect, useRef } from 'react';
import { Play, Info } from 'lucide-react';

/**
 * Navigation HUD - Cinematic Overlay
 * Optimized for performance: Uses direct DOM manipulation for scroll updates
 * to avoid React re-renders at 60fps.
 */
export function Navigation() {
    // Only subscribe to stable state (non-scroll)
    const videoCards = usePortfolioStore((state) => state.videoCards);
    const activeCardIndex = usePortfolioStore((state) => state.activeCardIndex);
    const activeCard = videoCards[activeCardIndex];
    const totalCards = videoCards.length;
    const isIntroComplete = usePortfolioStore((state) => state.isIntroComplete);

    // Refs for direct DOM access
    const progressBarRef = useRef<HTMLDivElement>(null);
    const indexTextRef = useRef<HTMLDivElement>(null);
    const categoryTextRef = useRef<HTMLDivElement>(null);
    const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

    // Categories for the timeline visualization
    const categories = [
        { id: 'hero-reel', label: 'INTRO', pos: 0 },
        { id: 'narrative-1', label: 'NARRATIVE', pos: 15 },
        { id: 'comm-1', label: 'COMMERCIAL', pos: 45 },
        { id: 'mv-1', label: 'MUSIC VIDEO', pos: 75 },
        { id: 'contact', label: 'CONTACT', pos: 95 },
    ];

    // Transient Scroll Subscription (No Re-renders!)
    useEffect(() => {
        const unsub = usePortfolioStore.subscribe((state) => {
            const progress = state.scrollProgress;
            const percentage = Math.min(100, Math.max(0, (progress % 1) * 100));

            // 1. Update Progress Bar
            if (progressBarRef.current) {
                progressBarRef.current.style.height = `${percentage}%`;
            }

            // 2. Update Dots
            dotsRef.current.forEach((dot, index) => {
                if (!dot) return;
                const catPos = categories[index].pos;
                if (percentage >= catPos) {
                    dot.style.backgroundColor = '#22d3ee'; // Cyan
                    dot.style.borderColor = '#22d3ee';
                } else {
                    dot.style.backgroundColor = 'transparent';
                    dot.style.borderColor = 'rgba(255,255,255,0.5)';
                }
            });

            // 3. Update Category Text
            if (categoryTextRef.current) {
                const currentCat = categories.reduce((prev, curr) => percentage >= curr.pos ? curr : prev, categories[0]);
                if (categoryTextRef.current.innerText !== currentCat.label) {
                    categoryTextRef.current.innerText = currentCat.label;
                }
            }
        });

        return () => unsub();
    }, []);

    // Scroll to section handler
    const handleDotClick = (pos: number) => {
        usePortfolioStore.getState().setScrollProgress(pos / 100);
    };

    // Hide HUD during intro
    if (!isIntroComplete) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-10 font-sans selection:bg-cyan-500/30">
            {/* Cinematic Overlays */}
            <div className="absolute inset-0 pointer-events-none opacity-20 scanline z-0"></div>
            <div className="absolute inset-0 pointer-events-none lens-flare z-0"></div>

            {/* --- TOP HUD --- */}
            <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start bg-gradient-to-b from-black/90 to-transparent z-10">
                <div className="flex flex-col">
                    <h1 className="text-white text-5xl font-bold tracking-tighter mb-0 font-display uppercase">
                        JOE IRIZARRY
                    </h1>
                    <div className="flex items-center gap-2 text-cyan-400 text-xs tracking-[0.3em] uppercase font-bold pl-1 glitch-hover">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#22d3ee]"></span>
                        Director / Editor / VFX
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-white/40 text-[10px] tracking-[0.2em] mb-1 font-mono">
                        PROJECT INDEX
                    </div>
                    <div className="text-white text-3xl font-light font-display">
                        <span className="text-cyan-400 font-bold">{(activeCardIndex + 1).toString().padStart(2, '0')}</span>
                        <span className="text-white/30 mx-2">/</span>
                        {totalCards.toString().padStart(2, '0')}
                    </div>
                </div>
            </div>

            {/* --- RIGHT TIMELINE --- */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 w-1 h-64 hidden md:block pointer-events-auto">
                {/* Track */}
                <div className="absolute inset-0 bg-white/10 rounded-full w-[2px] mx-auto"></div>

                {/* Progress Indicator */}
                <div
                    ref={progressBarRef}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-1 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)] transition-none"
                    style={{ height: `0%` }}
                ></div>

                {/* Section Dots */}
                {categories.map((cat, i) => (
                    <div
                        key={cat.id}
                        className="absolute left-1/2 -translate-x-1/2 flex items-center group cursor-pointer"
                        style={{ top: `${cat.pos}%` }}
                        onClick={() => handleDotClick(cat.pos)}
                    >
                        {/* Dot */}
                        <div
                            ref={(el) => { dotsRef.current[i] = el; }}
                            className="w-3 h-3 rounded-full border border-white/50 bg-black transition-colors hover:scale-150 duration-200"
                        />

                        {/* Label Tooltip */}
                        <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-white/80 text-[10px] tracking-widest bg-black/80 px-2 py-1 rounded">
                            {cat.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* --- BOTTOM INFO PANEL --- */}
            <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                <div className="max-w-4xl mx-auto md:ml-12 md:mx-0 transition-opacity duration-300">

                    {/* Category Label */}
                    <div className="overflow-hidden mb-2">
                        <div ref={categoryTextRef} className="text-cyan-400 text-xs font-bold tracking-[0.3em] uppercase opacity-80 font-mono">
                            INTRO
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-white text-6xl md:text-8xl font-black tracking-tighter mb-4 uppercase drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] font-display leading-[0.9]">
                        {activeCard?.title}
                    </h2>

                    {/* Description */}
                    <p className="text-white/80 text-sm md:text-lg max-w-xl leading-relaxed mb-8 font-light border-l-4 border-cyan-400 pl-6 shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.5)]">
                        {activeCard?.description}
                    </p>

                    {/* Meta Data / Credits */}
                    <div className="flex flex-wrap gap-4 text-xs text-white/50 mb-8 font-mono tracking-wider">
                        {activeCard?.credits.map((credit, i) => (
                            <span key={i} className="bg-black/40 px-3 py-1 border border-white/10 uppercase">
                                {credit}
                            </span>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 items-center pointer-events-auto">
                        <button className="group flex items-center gap-3 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm tracking-[0.1em] uppercase transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] clip-path-slant">
                            <span className="bg-black text-cyan-400 p-1 rounded-full"><Play size={12} fill="currentColor" /></span>
                            Watch Project
                        </button>
                        <button className="flex items-center gap-3 px-8 py-4 border border-white/20 hover:border-white/50 bg-black/50 hover:bg-white/10 text-white font-medium text-sm tracking-[0.1em] uppercase backdrop-blur-md transition-all">
                            <Info size={16} />
                            Details
                        </button>
                    </div>
                </div>

                {/* Scroll Hint */}
                <div className="absolute bottom-8 right-8 text-white/30 text-[10px] tracking-[0.2em] animate-pulse hidden md:block text-right">
                    SCROLL TO EXPLORE
                    <div className="w-full h-[1px] bg-white/10 mt-2"></div>
                </div>
            </div>
        </div>
    );
}
