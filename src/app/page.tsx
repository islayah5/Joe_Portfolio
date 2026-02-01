'use client';

import dynamic from 'next/dynamic';
import { Navigation } from '@/components/ui/Navigation';
import { YouTubePlayer } from '@/components/ui/YouTubePlayer';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { IntroSequence } from '@/components/ui/IntroSequence';
import { AudioEngine } from '@/components/ui/AudioEngine';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { ScrollHints } from '@/components/ui/ScrollHints';
import { LoadingProgress } from '@/components/ui/LoadingProgress';
import { DetailsPanel } from '@/components/ui/DetailsPanel';
import './globals.css';

// Dynamically import 3D scene with SSR disabled
const FilmRibbonScene = dynamic(
    () => import('@/components/3d/FilmRibbonScene').then(mod => ({ default: mod.FilmRibbonScene })),
    { ssr: false }
);

import { usePortfolioStore } from '@/store/usePortfolioStore';

export default function HomePage() {
    // Get state for details panel
    const flippedCards = usePortfolioStore((state) => state.flippedCards);
    const videoCards = usePortfolioStore((state) => state.videoCards);
    const activeCardIndex = usePortfolioStore((state) => state.activeCardIndex);

    const activeCard = videoCards[activeCardIndex];
    const isDetailsOpen = activeCard && flippedCards.has(activeCard.id);

    return (
        <main className="relative w-full h-screen overflow-hidden bg-black">
            {/* 3D Scene */}
            <FilmRibbonScene />

            {/* UI Overlays */}
            <IntroSequence />
            <LoadingProgress />
            {/* AudioEngine disabled until audio assets are added */}
            {/* <AudioEngine /> */}
            <Navigation />
            <YouTubePlayer />
            <CustomCursor />
            <ScrollIndicator />
            <ScrollHints />

            {/* Details Panel - Slides in from right when Details button clicked */}
            <DetailsPanel
                isOpen={isDetailsOpen}
                title={activeCard?.title}
                description={activeCard?.description}
                credits={activeCard?.credits}
            />
        </main>
    );
}
