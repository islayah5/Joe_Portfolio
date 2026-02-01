'use client';

import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import * as THREE from 'three';

/**
 * Camera Controller - STATIC CAMERA for Z-Axis Tunnel Navigation
 * 
 * NO MORE curve following, banking, or rotation
 * Camera stays fixed, cards move to camera on Z-axis
 * This eliminates motion sickness from tumbling effects
 */
export function CameraRig() {
    const { camera } = useThree();

    useEffect(() => {
        // STATIC CAMERA POSITION
        // Camera never moves - it's like a movie screen
        camera.position.set(0, 0, 10);

        // Always look at origin where active card sits
        camera.lookAt(0, 0, 0);

        // Lock camera - no updates needed in frame loop
    }, [camera]);

    return null;
}


/**
 * Scroll Listener - converts wheel/touch events to card navigation
 * Updated for Z-Axis Stack Navigation
 */
export function ScrollListener() {
    const scrollProgressRef = useRef(0);

    useEffect(() => {
        // Scroll sensitivity - controls how fast cards move
        const scrollSpeed = 0.0006;  // Adjusted for smoother tunnel feel
        const maxVelocity = 0.015;   // Limit max jump to prevent jarring

        const handleWheel = (e: WheelEvent) => {
            if (!usePortfolioStore.getState().isIntroComplete) return;
            e.preventDefault();

            // Direct deltaY to scroll progress
            let delta = e.deltaY * scrollSpeed;
            delta = Math.max(-maxVelocity, Math.min(maxVelocity, delta));

            // Update scroll progress (will be clamped in store if needed)
            scrollProgressRef.current += delta;

            // Clamp to valid range (0 to number of cards - 1)
            const videoCards = usePortfolioStore.getState().videoCards;
            scrollProgressRef.current = Math.max(
                0,
                Math.min(videoCards.length - 1, scrollProgressRef.current)
            );

            usePortfolioStore.getState().setScrollProgress(scrollProgressRef.current);

            // Update active card index based on scroll position
            const newIndex = Math.round(scrollProgressRef.current);
            usePortfolioStore.getState().setActiveCardIndex(newIndex);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!usePortfolioStore.getState().isIntroComplete) return;

            const keyScrollAmount = 1.0; // Jump one card at a time
            const videoCards = usePortfolioStore.getState().videoCards;
            const activeCardIndex = usePortfolioStore.getState().activeCardIndex;

            switch (e.key) {
                case 'ArrowDown':
                case 's':
                    e.preventDefault();
                    // Move to next card
                    if (activeCardIndex < videoCards.length - 1) {
                        scrollProgressRef.current = activeCardIndex + 1;
                        usePortfolioStore.getState().setScrollProgress(scrollProgressRef.current);
                        usePortfolioStore.getState().setActiveCardIndex(activeCardIndex + 1);
                    }
                    break;
                case 'ArrowUp':
                case 'w':
                    e.preventDefault();
                    // Move to previous card
                    if (activeCardIndex > 0) {
                        scrollProgressRef.current = activeCardIndex - 1;
                        usePortfolioStore.getState().setScrollProgress(scrollProgressRef.current);
                        usePortfolioStore.getState().setActiveCardIndex(activeCardIndex - 1);
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    // Spacebar = Next Card
                    if (activeCardIndex < videoCards.length - 1) {
                        scrollProgressRef.current = activeCardIndex + 1;
                        usePortfolioStore.getState().setScrollProgress(scrollProgressRef.current);
                        usePortfolioStore.getState().setActiveCardIndex(activeCardIndex + 1);
                    }
                    break;
                // Number keys 1-5 for direct jumps
                case '1':
                    e.preventDefault();
                    scrollProgressRef.current = 0;
                    usePortfolioStore.getState().setScrollProgress(0);
                    usePortfolioStore.getState().setActiveCardIndex(0);
                    break;
                case '2':
                case '3':
                case '4':
                case '5':
                    e.preventDefault();
                    const targetIndex = parseInt(e.key) - 1;
                    if (targetIndex < videoCards.length) {
                        scrollProgressRef.current = targetIndex;
                        usePortfolioStore.getState().setScrollProgress(targetIndex);
                        usePortfolioStore.getState().setActiveCardIndex(targetIndex);
                    }
                    break;
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return null;
}

/**
 * Note: Removed complex curve math explanations
 * New system is simple: Cards on Z-axis, camera stationary
 * No rotation matrices, no tangent/normal/binormal calculations
 */
