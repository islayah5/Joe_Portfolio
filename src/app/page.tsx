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
            <LoadingProgress />
            {/* AudioEngine disabled until audio assets are added */}
            {/* <AudioEngine /> */}
            <Navigation />
            <YouTubePlayer />
            <CustomCursor />
            <ScrollIndicator />
            <ScrollHints />
        </main>
    );
}
