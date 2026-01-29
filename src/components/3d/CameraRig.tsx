'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useRibbonCurve } from '@/utils/ribbonCurve';
import * as THREE from 'three';
import { gsap } from 'gsap';

/**
 * Camera Controller - follows the ribbon curve with scroll
 * Implements smooth banking and rotation to match curve tangent/normal
 */
export function CameraRig() {
    const { camera } = useThree();
    const scrollProgress = usePortfolioStore((state) => state.scrollProgress);
    const setActiveCardIndex = usePortfolioStore((state) => state.setActiveCardIndex);
    const videoCards = usePortfolioStore((state) => state.videoCards);

    const { curve, getCardTransform } = useRibbonCurve();

    const targetPosition = useRef(new THREE.Vector3());
    const targetQuaternion = useRef(new THREE.Quaternion());
    const lookAtPoint = useRef(new THREE.Vector3());

    // Update camera based on scroll
    useFrame((state, delta) => {
        // Calculate position along curve based on scroll
        const t = scrollProgress % 1;

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

        // Smooth camera movement
        camera.position.lerp(targetPosition.current, delta * 2);

        // Create camera rotation to look at the point ahead
        const direction = lookAtPoint.current.clone().sub(camera.position).normalize();
        const up = transform.binormal; // Use curve's binormal for "up" (creates banking)

        // Calculate rotation matrix
        const matrix = new THREE.Matrix4();
        matrix.lookAt(camera.position, lookAtPoint.current, up);
        targetQuaternion.current.setFromRotationMatrix(matrix);

        // Smooth rotation with quaternion slerp
        camera.quaternion.slerp(targetQuaternion.current, delta * 3);

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
    const setScrollProgress = usePortfolioStore((state) => state.setScrollProgress);
    const scrollProgress = usePortfolioStore((state) => state.scrollProgress);

    useEffect(() => {
        let isScrolling = false;
        const scrollSpeed = 0.0003;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            const delta = e.deltaY * scrollSpeed;
            const newProgress = scrollProgress + delta;

            // Allow infinite scrolling by wrapping
            setScrollProgress(newProgress);

            isScrolling = true;
            setTimeout(() => {
                isScrolling = false;
            }, 100);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const keyScrollAmount = 0.05;

            switch (e.key) {
                case 'ArrowDown':
                case 's':
                    e.preventDefault();
                    setScrollProgress(scrollProgress + keyScrollAmount);
                    break;
                case 'ArrowUp':
                case 'w':
                    e.preventDefault();
                    setScrollProgress(scrollProgress - keyScrollAmount);
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
    }, [scrollProgress, setScrollProgress]);

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
