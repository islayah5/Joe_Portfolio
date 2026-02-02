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
 * Stable Threshold Scroll Listener - Fixes Navigation Bounce
 * 
 * Previous Issue: Bouncing between cards due to mid-animation input
 * 
 * Solution:
 * - Lock mechanism: Ignores ALL input during snap animation
 * - Immediate accumulator reset when threshold crossed
 * - Optimized parameters for better feel
 * - No direction reversals possible
 */
export function ScrollListener() {
    const scrollAccumulatorRef = useRef(0);
    const targetIndexRef = useRef(0);
    const currentProgressRef = useRef(0);
    const isLockedRef = useRef(false);  // NEW: Prevents input during animation
    const lastSnapTimeRef = useRef(0);
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        // Initialize from store
        const initialIndex = usePortfolioStore.getState().activeCardIndex;
        targetIndexRef.current = initialIndex;
        currentProgressRef.current = initialIndex;

        // Optimized scroll parameters
        const SCROLL_THRESHOLD = 150;  // Increased from 100 (less sensitive, more deliberate)
        const COOLDOWN_MS = 600;        // Reduced from 800 (more responsive)
        const SNAP_SPEED = 0.2;         // Increased from 0.15 (faster animations)

        /**
         * Wheel Handler - Locked during animations
         * CRITICAL: Returns early if locked to prevent bouncing
         */
        const handleWheel = (e: WheelEvent) => {
            if (!usePortfolioStore.getState().isIntroComplete) return;

            // LOCK CHECK: Ignore ALL input during snap animation
            if (isLockedRef.current) {
                return; // This fixes the bounce!
            }

            const now = Date.now();

            // Cooldown check (after lock check for clarity)
            if (now - lastSnapTimeRef.current < COOLDOWN_MS) {
                return;
            }

            // Accumulate scroll delta
            scrollAccumulatorRef.current += e.deltaY;

            // Check if threshold crossed
            if (Math.abs(scrollAccumulatorRef.current) >= SCROLL_THRESHOLD) {
                const direction = scrollAccumulatorRef.current > 0 ? 1 : -1;

                // IMMEDIATELY reset accumulator and lock
                scrollAccumulatorRef.current = 0;
                isLockedRef.current = true;
                lastSnapTimeRef.current = now;

                // Calculate new target index
                const videoCards = usePortfolioStore.getState().videoCards;
                const currentTarget = targetIndexRef.current;
                const newTarget = Math.max(0, Math.min(videoCards.length - 1, currentTarget + direction));

                // Only snap if target actually changed
                if (newTarget !== currentTarget) {
                    targetIndexRef.current = newTarget;

                    // Start animation loop if not already running
                    if (rafIdRef.current === null) {
                        rafIdRef.current = requestAnimationFrame(animateSnap);
                    }
                } else {
                    // At boundary (can't go further), unlock immediately
                    isLockedRef.current = false;
                }
            }
        };

        /**
         * Animation Loop - Smooth snap to target card
         * Unlocks when animation completes
         */
        const animateSnap = () => {
            rafIdRef.current = null;

            // Lerp current progress toward target index
            const diff = targetIndexRef.current - currentProgressRef.current;
            currentProgressRef.current += diff * SNAP_SPEED;

            // Snap to target when very close
            if (Math.abs(diff) < 0.02) {
                currentProgressRef.current = targetIndexRef.current;
                isLockedRef.current = false; // UNLOCK when complete
            }

            // Update store (single batched update)
            usePortfolioStore.setState({
                scrollProgress: currentProgressRef.current,
                activeCardIndex: Math.round(currentProgressRef.current)
            });

            // Continue animation if still locked
            if (isLockedRef.current) {
                rafIdRef.current = requestAnimationFrame(animateSnap);
            }
        };

        /**
         * Keyboard Navigation - Direct jumps with lock
         */
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!usePortfolioStore.getState().isIntroComplete) return;

            // LOCK CHECK: Ignore keyboard during animation too
            if (isLockedRef.current) {
                return;
            }

            const now = Date.now();

            // Respect cooldown
            if (now - lastSnapTimeRef.current < COOLDOWN_MS) {
                return;
            }

            const videoCards = usePortfolioStore.getState().videoCards;
            let newTarget: number | null = null;

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
                        newTarget = 9;
                    }
                    break;
            }

            if (newTarget !== null && newTarget !== targetIndexRef.current) {
                // LOCK and trigger snap
                isLockedRef.current = true;
                lastSnapTimeRef.current = now;
                targetIndexRef.current = newTarget;

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
