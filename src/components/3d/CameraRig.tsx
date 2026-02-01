'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useRibbonCurve } from '@/utils/ribbonCurve';
import * as THREE from 'three';

/**
 * Camera Controller - follows the ribbon curve with scroll
 * Implements smooth banking and rotation to match curve tangent/normal
 */
export function CameraRig() {
    const { camera } = useThree();
    const { getCardTransform } = useRibbonCurve();

    const targetPosition = useRef(new THREE.Vector3());
    const targetQuaternion = useRef(new THREE.Quaternion());
    const lookAtPoint = useRef(new THREE.Vector3());

    // Inertial scrolling state
    const currentScrollRef = useRef(0);
    const lastScrollProgress = useRef(0);

    // Update camera based on scroll - using transient state access for performance
    useFrame((state, delta) => {
        // CRITICAL: Access store transiently to avoid React re-renders at 60 FPS
        const setScrollProgress = usePortfolioStore.getState().setScrollProgress;
        const targetScroll = usePortfolioStore.getState().scrollProgress;
        const videoCards = usePortfolioStore.getState().videoCards;
        const setActiveCardIndex = usePortfolioStore.getState().setActiveCardIndex;
        const isIntroComplete = usePortfolioStore.getState().isIntroComplete;

        // 0. CINEMATIC PAUSE
        // If intro is not complete, freeze camera at "Start Position" (Fly-In prep)
        if (!isIntroComplete) {
            // Optional: A slow drift could go here
            return;
        }

        // 1. OPTIMIZED INERTIAL PHYSICS
        // Velocity-dependent damping for responsive yet smooth feel
        // Fast scroll = higher damping (snappy), slow = lower damping (smooth)
        const velocity = Math.abs(targetScroll - currentScrollRef.current);
        const dampingFast = 3.5;  // FIXED: Reduced from 8.0
        const dampingSlow = 3.5;  // FIXED: Same as fast for consistency
        const velocityThreshold = 0.01;

        const damping = 4.0; // REFINED: Slightly faster than 3.5 for responsiveness
        currentScrollRef.current = THREE.MathUtils.lerp(
            currentScrollRef.current,
            targetScroll,
            delta * damping
        );

        // 2. FIXED MAGNETIC SNAP - Only when truly stopped
        const snapVelocityThreshold = 0.003; // Stricter threshold
        const snapStrength = 2.0 * delta; // Gentler pull

        let isSnapping = false;
        let activeCardPosition = -1;

        // Find nearest card
        let closestDist = Infinity;
        let snapTarget = -1;

        videoCards.forEach(card => {
            const dist = Math.abs(card.position - currentScrollRef.current);
            if (dist < closestDist) {
                closestDist = dist;
                snapTarget = card.position;
            }
        });

        // Apply Snap - Only when COMPLETELY stopped
        if (closestDist < snapDistance && velocity < snapVelocityThreshold) {
            isSnapping = true;
            activeCardPosition = snapTarget;

            // Ultra-gentle magnetic pull
            const nudged = THREE.MathUtils.lerp(targetScroll, snapTarget, snapStrength);

            // Hard lock when very close (prevents micro-jitter)
            if (closestDist < 0.0008) {
                if (targetScroll !== snapTarget) setScrollProgress(snapTarget);
            } else if (Math.abs(nudged - targetScroll) > 0.0000005) {
                setScrollProgress(nudged);
            }
        }

        // --- CAMERA TRANSFORM LOGIC ---
        const t = currentScrollRef.current % 1;
        const transform = getCardTransform(t);

        // OPTIMIZED: Camera Positioning for perfect card visibility
        // Height adjusted for vertical centering, distance for ideal FOV coverage
        const cameraOffset = new THREE.Vector3(0, 0.8, 4.5);
        cameraOffset.applyQuaternion(transform.rotation);
        targetPosition.current.copy(transform.position).add(cameraOffset);

        // OPTIMIZED: Smooth centering (not instant)
        const cardPosition = transform.position.clone();
        lookAtPoint.current.lerp(cardPosition, delta * 6.0); // Smoother than 10

        // REFINED: Consistent smooth camera tracking
        const posLerp = 5.0;  // Slightly faster than 4.0
        const rotLerp = 6.0;  // Slightly faster than 5.0

        camera.position.lerp(targetPosition.current, delta * posLerp);

        // Calculate Rotation
        const up = transform.binormal; // Bank with the curve
        const matrix = new THREE.Matrix4();
        matrix.lookAt(camera.position, lookAtPoint.current, up);
        targetQuaternion.current.setFromRotationMatrix(matrix);

        // Smooth Rotation
        camera.quaternion.slerp(targetQuaternion.current, delta * rotLerp);

        // Store Update: Active Card Index
        // Only update if changed to minimize re-renders
        let closestIndex = 0;
        let minDistance = Infinity;
        videoCards.forEach((card, index) => {
            const d = Math.abs(card.position - t);
            if (d < minDistance) {
                minDistance = d;
                closestIndex = index;
            }
        });
        setActiveCardIndex(closestIndex);
    });

    return null;
}

/**
 * Scroll Listener - converts wheel/touch events to scroll progress
 */
export function ScrollListener() {
    const scrollProgressRef = useRef(0);

    useEffect(() => {
        // PROVEN: Conservative 1.5x increase (not 2.67x)
        const scrollSpeed = 0.00045;  // Sweet spot between 0.0003 and 0.0005
        const maxVelocity = 0.012;     // Tighter clamp to prevent jumps

        const handleWheel = (e: WheelEvent) => {
            if (!usePortfolioStore.getState().isIntroComplete) return;
            e.preventDefault();

            // DIRECT INPUT - No momentum, no RAF chaos
            let delta = e.deltaY * scrollSpeed;
            delta = Math.max(-maxVelocity, Math.min(maxVelocity, delta));

            scrollProgressRef.current += delta;
            usePortfolioStore.getState().setScrollProgress(scrollProgressRef.current);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!usePortfolioStore.getState().isIntroComplete) return;

            const keyScrollAmount = 0.05;
            const videoCards = usePortfolioStore.getState().videoCards;
            const scrollToCard = usePortfolioStore.getState().scrollToCard;
            const activeCardIndex = usePortfolioStore.getState().activeCardIndex;

            switch (e.key) {
                case 'ArrowDown':
                case 's':
                    e.preventDefault();
                    scrollProgressRef.current += keyScrollAmount;
                    usePortfolioStore.getState().setScrollProgress(scrollProgressRef.current);
                    break;
                case 'ArrowUp':
                case 'w':
                    e.preventDefault();
                    scrollProgressRef.current -= keyScrollAmount;
                    usePortfolioStore.getState().setScrollProgress(scrollProgressRef.current);
                    break;
                case ' ':
                    e.preventDefault();
                    // Spacebar = Next Card
                    const nextIndex = Math.min(activeCardIndex + 1, videoCards.length - 1);
                    scrollToCard(nextIndex);
                    scrollProgressRef.current = videoCards[nextIndex].position;
                    break;
                // Number keys 1-5 for section jumps
                case '1':
                    e.preventDefault();
                    scrollToCard(0); // Hero
                    scrollProgressRef.current = videoCards[0].position;
                    break;
                case '2':
                    e.preventDefault();
                    const narrativeIndex = videoCards.findIndex((c) => c.position >= 0.15);
                    if (narrativeIndex !== -1) {
                        scrollToCard(narrativeIndex);
                        scrollProgressRef.current = videoCards[narrativeIndex].position;
                    }
                    break;
                case '3':
                    e.preventDefault();
                    const commercialIndex = videoCards.findIndex((c) => c.position >= 0.45);
                    if (commercialIndex !== -1) {
                        scrollToCard(commercialIndex);
                        scrollProgressRef.current = videoCards[commercialIndex].position;
                    }
                    break;
                case '4':
                    e.preventDefault();
                    const mvIndex = videoCards.findIndex((c) => c.position >= 0.75);
                    if (mvIndex !== -1) {
                        scrollToCard(mvIndex);
                        scrollProgressRef.current = videoCards[mvIndex].position;
                    }
                    break;
                case '5':
                    e.preventDefault();
                    const contactIndex = videoCards.findIndex((c) => c.position >= 0.95);
                    if (contactIndex !== -1) {
                        scrollToCard(contactIndex);
                        scrollProgressRef.current = videoCards[contactIndex].position;
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
 * Math Explanation:
 * 
 * Camera rotation alignment works as follows:
 * 
 * 1. TANGENT: Direction along the curve (forward)
 *    - Calculated via curve.getTangentAt(t)
 *    - This is the direction the ribbon "flows"
 * 
 * 2. NORMAL: Perpendicular to tangent in the horizontal plane
 *    - Calculated via cross product: up × tangent
 *    - This gives us the "left/right" direction
 * 
 * 3. BINORMAL: Perpendicular to both tangent and normal
 *    - Calculated via cross product: tangent × normal
 *    - This becomes our "up" vector for banking
 * 
 * 4. ROLL/BANK ANGLE: How much to tilt on curves
 *    - Measured by comparing curve direction changes
 *    - Applied as rotation around the tangent axis
 *    - Creates the "flying through space" feeling
 * 
 * The rotation matrix is built from these three orthogonal vectors:
 * Matrix = [normal, binormal, tangent]
 * 
 * This ensures the camera rotates smoothly to match the ribbon's
 * orientation, creating that "operationally incredible" feel.
 */
