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

        // 1. INERTIAL PHYSIC LOOP
        // Smoothly interpolate current scroll towards target scroll
        // Damping factor of 2.0 creates a heavier, more impactful feel
        const damping = 2.0;
        currentScrollRef.current = THREE.MathUtils.lerp(
            currentScrollRef.current,
            targetScroll,
            delta * damping
        );

        // 2. MAGNETIC SNAP
        // If velocity is very low, snap to nearest card
        const velocity = Math.abs(targetScroll - currentScrollRef.current);
        const snapThreshold = 0.001; // How slow we need to be to snap
        const snapStrength = 0.5 * delta; // Gentle pull strength

        if (velocity < snapThreshold) {
            // Find nearest card position
            let closestDist = Infinity;
            let snapTarget = -1;

            videoCards.forEach(card => {
                const dist = Math.abs(card.position - currentScrollRef.current);
                if (dist < closestDist) {
                    closestDist = dist;
                    snapTarget = card.position;
                }
            });

            // Only snap if we are close enough (don't snap across the whole map)
            if (closestDist < 0.1 && snapTarget !== -1) {
                // Nudge the ACTUAL target in the store towards the snap target
                // This creates a physical "pull" that feels natural
                const nudged = THREE.MathUtils.lerp(targetScroll, snapTarget, snapStrength);

                // Only write if significant change to avoid thrashing
                if (Math.abs(nudged - targetScroll) > 0.00001) {
                    setScrollProgress(nudged);
                }
            }
        }

        // Calculate position along curve based on smoothed scroll
        const t = currentScrollRef.current % 1;

        // Get transform data at current position
        const transform = getCardTransform(t);

        // Camera offset from the path (behind and slightly above the active card)
        const cameraOffset = new THREE.Vector3(0, 0.5, 3);

        // Rotate offset by the curve's rotation
        cameraOffset.applyQuaternion(transform.rotation);

        // Set target position
        targetPosition.current.copy(transform.position).add(cameraOffset);

        // Calculate look-at point (slightly ahead on the curve)
        const lookAheadT = (t + 0.05) % 1;
        const lookAheadTransform = getCardTransform(lookAheadT);
        lookAtPoint.current.copy(lookAheadTransform.position);

        // Smooth camera movement (secondary smoothing for position)
        camera.position.lerp(targetPosition.current, delta * 3);

        // Create camera rotation to look at the point ahead
        const up = transform.binormal; // Use curve's binormal for "up" (creates banking)

        // Calculate rotation matrix
        const matrix = new THREE.Matrix4();
        matrix.lookAt(camera.position, lookAtPoint.current, up);
        targetQuaternion.current.setFromRotationMatrix(matrix);

        // Smooth rotation with quaternion slerp
        camera.quaternion.slerp(targetQuaternion.current, delta * 2);

        // Determine active card based on proximity
        let closestIndex = 0;
        let closestDistance = Infinity;

        videoCards.forEach((card, index) => {
            const cardTransform = getCardTransform(card.position);
            const distance = camera.position.distanceTo(cardTransform.position);

            if (distance < closestDistance) {
                closestDistance = distance;
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
