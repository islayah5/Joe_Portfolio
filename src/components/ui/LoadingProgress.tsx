'use client';

import { useEffect } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Intelligent Loading Progress Indicator
 * Shows only during actual 3D scene initialization
 * Fades out smoothly once scene is ready
 */
export function LoadingProgress() {
    const isSceneReady = usePortfolioStore((state) => state.isSceneReady);
    const isIntroComplete = usePortfolioStore((state) => state.isIntroComplete);
    const sceneLoadProgress = usePortfolioStore((state) => state.sceneLoadProgress);

    // Auto-set scene ready after intro if not already set
    useEffect(() => {
        if (isIntroComplete && !isSceneReady) {
            // Fallback: Set scene ready 2 seconds after intro completes
            const timer = setTimeout(() => {
                usePortfolioStore.getState().setSceneReady(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isIntroComplete, isSceneReady]);

    // Hide if intro isn't complete (intro overlay handles that)
    // Also hide once scene is ready
    const shouldShow = isIntroComplete && !isSceneReady;

    return (
        <AnimatePresence>
            {shouldShow && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none"
                >
                    <div className="flex flex-col items-center gap-4">
                        {/* Loading Text */}
                        <div className="text-white/80 text-sm tracking-[0.3em] uppercase font-mono">
                            Loading Experience
                        </div>

                        {/* Progress Bar */}
                        <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                initial={{ width: '0%' }}
                                animate={{ width: `${sceneLoadProgress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        {/* Percentage */}
                        <div className="text-cyan-400 text-xs font-mono">
                            {Math.round(sceneLoadProgress)}%
                        </div>

                        {/* Animated Dots */}
                        <div className="flex gap-2">
                            <motion.div
                                className="w-2 h-2 bg-cyan-400 rounded-full"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                                className="w-2 h-2 bg-cyan-400 rounded-full"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                                className="w-2 h-2 bg-cyan-400 rounded-full"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
