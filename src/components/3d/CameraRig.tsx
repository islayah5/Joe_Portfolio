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

        // 1. INERTIAL PHYSIC LOOP
        // Smoothly interpolate current scroll towards target scroll
        // Damping factor of 2.0 creates a heavier, more impactful feel
        const damping = 2.0;
        currentScrollRef.current = THREE.MathUtils.lerp(
            currentScrollRef.current,
            targetScroll,
            delta * damping
        );

        // 2. MAGNETIC SNAP & DYNAMIC FOCUS (STICKY LOCK)
        // If velocity is low, snap to nearest card and LOCK focus
        const velocity = Math.abs(targetScroll - currentScrollRef.current);
        const snapThreshold = 0.002; // Increased threshold for earlier catch
        const snapStrength = 4.0 * delta; // Much stronger pull (Sticky)

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

        // Apply Sticky Snap
        // If we are close (0.08) and relatively slow, the magnet engages
        if (closestDist < 0.08 && velocity < 0.01) {
            isSnapping = true;
            activeCardPosition = snapTarget;

            // Magnetic Pull - Force the target towards the card center
            // This creates the "Freeze" feeling
            const nudged = THREE.MathUtils.lerp(targetScroll, snapTarget, snapStrength);

            // If very close, just lock it hard to avoid micro-jitter
            if (closestDist < 0.001) {
                if (targetScroll !== snapTarget) setScrollProgress(snapTarget);
            } else if (Math.abs(nudged - targetScroll) > 0.000001) {
                setScrollProgress(nudged);
            }
        }

        // --- CAMERA TRANSFORM LOGIC ---
        const t = currentScrollRef.current % 1;
        const transform = getCardTransform(t);

        // Position: "Film Crane" Offset
        // Sits slightly ABOVE and BEHIND the rail for a cinematic view
        const cameraOffset = new THREE.Vector3(0, 0.5, 4.0);
        cameraOffset.applyQuaternion(transform.rotation);
        targetPosition.current.copy(transform.position).add(cameraOffset);

        // LookAt: DYNAMIC FOCUS SYSTEM
        // When Moving -> Look Ahead (Anticipation)
        // When Stopped -> Look DIRECTLY at Card (Framing)

        // Calculate "Look Ahead" point
        const lookAheadOffset = 0.08; // How far ahead to look when moving
        const focusOffset = THREE.MathUtils.lerp(0, lookAheadOffset, Math.min(1, velocity * 200));

        const focusT = (t + focusOffset) % 1;
        const focusTransform = getCardTransform(focusT);

        // If we are snapping/stopped, verify we are looking at the CARD CENTER
        // (Adjust focus point to ensure the card is dead center in frame)
        if (isSnapping && activeCardPosition !== -1) {
            // Exact card position
            const exactCardTransform = getCardTransform(activeCardPosition);
            lookAtPoint.current.lerp(exactCardTransform.position, delta * 5);
        } else {
            // Normal flight mode
            lookAtPoint.current.copy(focusTransform.position);
        }

        // Apply Smooth Movement to Camera (Damped)
        camera.position.lerp(targetPosition.current, delta * 3.0);

        // Calculate Rotation
        const up = transform.binormal; // Bank with the curve
        const matrix = new THREE.Matrix4();
        matrix.lookAt(camera.position, lookAtPoint.current, up);
        targetQuaternion.current.setFromRotationMatrix(matrix);

        // Apply Smooth Rotation
        camera.quaternion.slerp(targetQuaternion.current, delta * 4.0);

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
        const scrollSpeed = 0.0003;

        const handleWheel = (e: WheelEvent) => {
            if (!usePortfolioStore.getState().isIntroComplete) return;
            e.preventDefault();

            const delta = e.deltaY * scrollSpeed;
            scrollProgressRef.current += delta;

            // Update store
            usePortfolioStore.getState().setScrollProgress(scrollProgressRef.current);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const keyScrollAmount = 0.05;

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
                    // Spacebar can trigger flip
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
