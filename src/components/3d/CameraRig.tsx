'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { usePortfolioStore } from '@/store/usePortfolioStore';

/**
 * Static Camera Rig - Z-Axis Tunnel Navigation
 * Camera never moves - cards move to it on Z-axis
 */
export function CameraRig() {
    const { camera } = useThree();

    useEffect(() => {
        // STATIC CAMERA - Never moves, never rotates
        // Cards will move toward/away from this position
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);

        // No frame updates needed - camera is completely static
    }, [camera]);

    return null;
}


/**
 * Optimized Scroll Listener - 60fps Performance
 * 
 * Performance Features:
 * - Passive event listeners (non-blocking compositor)
 * - RAF batching (max 60 updates/sec, prevents layout thrashing)
 * - Exponential smoothing (natural momentum feel)
 * - Single state update per frame
 */
export function ScrollListener() {
    const scrollTargetRef = useRef(0);
    const scrollCurrentRef = useRef(0);
    const scrollVelocityRef = useRef(0);
    const rafIdRef = useRef<number | null>(null);
    const wheelAccumulatorRef = useRef(0);

    useEffect(() => {
        // Initialize scroll from store
        const initialProgress = usePortfolioStore.getState().scrollProgress;
        scrollTargetRef.current = initialProgress;
        scrollCurrentRef.current = initialProgress;

        // Physics parameters for smooth scrolling
        const stiffness = 0.12;  // How quickly it responds (0-1, higher = snappier)
        const damping = 0.75;     // How much it slows down (0-1, higher = less momentum)
        const scrollSpeed = 0.0006;
        const maxVelocity = 0.018;

        /**
         * Wheel Event Handler - Passive, just accumulates scroll
         * No state updates here = no layout thrashing
         */
        const handleWheel = (e: WheelEvent) => {
            if (!usePortfolioStore.getState().isIntroComplete) return;

            // Accumulate scroll delta (don't update state yet!)
            let delta = e.deltaY * scrollSpeed;
            delta = Math.max(-maxVelocity, Math.min(maxVelocity, delta));

            wheelAccumulatorRef.current += delta;

            // Schedule RAF update if not already scheduled
            if (rafIdRef.current === null) {
                rafIdRef.current = requestAnimationFrame(smoothScrollLoop);
            }
        };

        /**
         * RAF Smooth Scroll Loop - Physics-based interpolation
         * Runs at 60fps max, batches all state updates
         */
        const smoothScrollLoop = (timestamp: number) => {
            rafIdRef.current = null;

            // Apply accumulated wheel delta to target
            if (wheelAccumulatorRef.current !== 0) {
                scrollTargetRef.current += wheelAccumulatorRef.current;
                wheelAccumulatorRef.current = 0; // Reset accumulator

                // Clamp target to valid range
                const videoCards = usePortfolioStore.getState().videoCards;
                scrollTargetRef.current = Math.max(
                    0,
                    Math.min(videoCards.length - 1, scrollTargetRef.current)
                );
            }

            // Spring physics: smoothly interpolate current → target
            const diff = scrollTargetRef.current - scrollCurrentRef.current;
            scrollVelocityRef.current += diff * stiffness;
            scrollVelocityRef.current *= damping;

            scrollCurrentRef.current += scrollVelocityRef.current;

            // Snap to target when very close (prevents infinite micro-movements)
            if (Math.abs(diff) < 0.001 && Math.abs(scrollVelocityRef.current) < 0.001) {
                scrollCurrentRef.current = scrollTargetRef.current;
                scrollVelocityRef.current = 0;
            }

            // SINGLE state update per frame (batched)
            const newIndex = Math.round(scrollCurrentRef.current);
            usePortfolioStore.setState({
                scrollProgress: scrollCurrentRef.current,
                activeCardIndex: newIndex
            });

            // Continue loop if still moving
            if (Math.abs(scrollVelocityRef.current) > 0.0001 || wheelAccumulatorRef.current !== 0) {
                rafIdRef.current = requestAnimationFrame(smoothScrollLoop);
            }
        };

        /**
         * Keyboard Navigation - Instant jumps with smooth interpolation
         */
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!usePortfolioStore.getState().isIntroComplete) return;

            const videoCards = usePortfolioStore.getState().videoCards;
            const activeCardIndex = usePortfolioStore.getState().activeCardIndex;
            let newTarget: number | null = null;

            switch (e.key) {
                case 'ArrowDown':
                case 's':
                    e.preventDefault();
                    if (activeCardIndex < videoCards.length - 1) {
                        newTarget = activeCardIndex + 1;
                    }
                    break;
                case 'ArrowUp':
                case 'w':
                    e.preventDefault();
                    if (activeCardIndex > 0) {
                        newTarget = activeCardIndex - 1;
                    }
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                    e.preventDefault();
                    const index = parseInt(e.key) - 1;
                    if (index >= 0 && index < videoCards.length) {
                        newTarget = index;
                    }
                    break;
            }

            if (newTarget !== null) {
                scrollTargetRef.current = newTarget;

                // Start smooth scroll if not already running
                if (rafIdRef.current === null) {
                    rafIdRef.current = requestAnimationFrame(smoothScrollLoop);
                }
            }
        };

        // CRITICAL: Passive listener = non-blocking compositor
        window.addEventListener('wheel', handleWheel, { passive: true });
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown);
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        };
    }, []);

    return null;
}
