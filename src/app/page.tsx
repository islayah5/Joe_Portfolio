'use client';

import dynamic from 'next/dynamic';
import { Navigation } from '@/components/ui/Navigation';
import { YouTubePlayer } from '@/components/ui/YouTubePlayer';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { IntroSequence } from '@/components/ui/IntroSequence';
import { AudioEngine } from '@/components/ui/AudioEngine';
import './globals.css';

// Dynamically import 3D scene with SSR disabled
const FilmRibbonScene = dynamic(
    () => import('@/components/3d/FilmRibbonScene').then(mod => ({ default: mod.FilmRibbonScene })),
    { ssr: false }
);

export default function HomePage() {
    return (
        <main className="relative w-full h-screen overflow-hidden bg-black">
            {/* 3D Scene */}
            <FilmRibbonScene />

            {/* UI Overlays */}
            <IntroSequence />
            <AudioEngine />
            <Navigation />
            <YouTubePlayer />
            <CustomCursor />

            {/* Loading hint */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none z-0">
                Loading experience...
            </div>
        </main>
    );
}
