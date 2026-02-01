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
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
    }, [camera]);

    return null;
}


/**
 * Threshold-Based Scroll Listener - Fixes "Scroll Trap" Bug
 * 
 * QC Issue: Users getting stuck between projects (e.g., can't scroll from 2→3)
 * Root Cause: Smooth spring physics too gradual, creates dead zones
 * 
 * New Approach:
 * - Accumulate scroll deltas until threshold (100px) crossed
 * - Snap directly to next/prev card (no in-between states)
 * - 800ms cooldown prevents rapid-fire jumping
 * - Predictable, reliable navigation
 */
export function ScrollListener() {
    const scrollAccumulatorRef = useRef(0);
    const targetIndexRef = useRef(0);
    const currentProgressRef = useRef(0);
    const isSnappingRef = useRef(false);
    const lastSnapTimeRef = useRef(0);
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        // Initialize from store
        const initialIndex = usePortfolioStore.getState().activeCardIndex;
        targetIndexRef.current = initialIndex;
        currentProgressRef.current = initialIndex;

        // Scroll configuration
        const SCROLL_THRESHOLD = 100;  // Pixels of accumulated scroll to trigger snap
        const COOLDOWN_MS = 800;        // Prevent rapid-fire snaps
        const SNAP_SPEED = 0.15;        // How fast to animate to target (higher = snappier)

        /**
         * Wheel Handler - Accumulate scroll, trigger on threshold
         * Passive listener = non-blocking compositor
         */
        const handleWheel = (e: WheelEvent) => {
            if (!usePortfolioStore.getState().isIntroComplete) return;

            const now = Date.now();

            // Ignore input during cooldown period
            if (now - lastSnapTimeRef.current < COOLDOWN_MS) {
                return;
            }

            // Accumulate scroll delta
            scrollAccumulatorRef.current += e.deltaY;

            // Check if threshold crossed
            if (Math.abs(scrollAccumulatorRef.current) >= SCROLL_THRESHOLD) {
                const direction = scrollAccumulatorRef.current > 0 ? 1 : -1;
                scrollAccumulatorRef.current = 0; // Reset accumulator

                // Calculate new target index
                const videoCards = usePortfolioStore.getState().videoCards;
                const currentTarget = targetIndexRef.current;
                const newTarget = Math.max(0, Math.min(videoCards.length - 1, currentTarget + direction));

                // Only snap if target actually changed
                if (newTarget !== currentTarget) {
                    targetIndexRef.current = newTarget;
                    isSnappingRef.current = true;
                    lastSnapTimeRef.current = now;

                    // Start animation loop if not already running
                    if (rafIdRef.current === null) {
                        rafIdRef.current = requestAnimationFrame(animateSnap);
                    }
                }
            }
        };

        /**
         * Animation Loop - Smooth snap to target card
         */
        const animateSnap = () => {
            rafIdRef.current = null;

            // Lerp current progress toward target index
            const diff = targetIndexRef.current - currentProgressRef.current;
            currentProgressRef.current += diff * SNAP_SPEED;

            // Snap to target when very close (prevents infinite micro-movements)
            if (Math.abs(diff) < 0.01) {
                currentProgressRef.current = targetIndexRef.current;
                isSnappingRef.current = false;
            }

            // Update store (single batched update)
            usePortfolioStore.setState({
                scrollProgress: currentProgressRef.current,
                activeCardIndex: Math.round(currentProgressRef.current)
            });

            // Continue animation if still moving
            if (isSnappingRef.current) {
                rafIdRef.current = requestAnimationFrame(animateSnap);
            }
        };

        /**
         * Keyboard Navigation - Direct jumps to cards
         */
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!usePortfolioStore.getState().isIntroComplete) return;

            const videoCards = usePortfolioStore.getState().videoCards;
            const now = Date.now();
            let newTarget: number | null = null;

            // Respect cooldown for keyboard too
            if (now - lastSnapTimeRef.current < COOLDOWN_MS) {
                return;
            }

            switch (e.key) {
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    if (targetIndexRef.current < videoCards.length - 1) {
                        newTarget = targetIndexRef.current + 1;
                    }
                    break;
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    if (targetIndexRef.current > 0) {
                        newTarget = targetIndexRef.current - 1;
                    }
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    e.preventDefault();
                    const index = parseInt(e.key) - 1;
                    if (index >= 0 && index < videoCards.length) {
                        newTarget = index;
                    }
                    break;
                case '0':
                    e.preventDefault();
                    if (videoCards.length >= 10) {
                        newTarget = 9; // Jump to 10th card
                    }
                    break;
            }

            if (newTarget !== null && newTarget !== targetIndexRef.current) {
                targetIndexRef.current = newTarget;
                isSnappingRef.current = true;
                lastSnapTimeRef.current = now;

                // Start animation
                if (rafIdRef.current === null) {
                    rafIdRef.current = requestAnimationFrame(animateSnap);
                }
            }
        };

        // CRITICAL: Passive listener
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
