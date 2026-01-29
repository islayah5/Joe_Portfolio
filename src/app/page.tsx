import { FilmRibbonScene } from '@/components/3d/FilmRibbonScene';
import { Navigation } from '@/components/ui/Navigation';
import { YouTubePlayer } from '@/components/ui/YouTubePlayer';
import { CustomCursor } from '@/components/ui/CustomCursor';
import './globals.css';

export default function HomePage() {
    return (
        <main className="relative w-full h-screen overflow-hidden bg-black">
            {/* 3D Scene */}
            <FilmRibbonScene />

            {/* UI Overlays */}
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
