'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Z-Axis Stack Layout System
 * 
 * Replaces the curve-based ribbon navigation with a linear stack
 * Cards positioned along Z-axis, no rotation, pure depth-based navigation
 * Eliminates motion sickness from tumbling/rotation effects
 */

export interface CardTransform {
    position: THREE.Vector3;
    rotation: THREE.Euler;      // Always [0, 0, 0] - cards face camera
    scale: number;              // Closer = larger (perspective effect)
    opacity: number;            // Closer = more opaque
}

/**
 * Calculate card transform based on its position in the stack
 * 
 * @param cardIndex - Index of this card (0, 1, 2, 3...)
 * @param activeIndex - Currently active/focused card index
 * @param scrollProgress - Fine scroll interpolation (0-1 between cards)
 * @returns Transform with position, rotation, scale, opacity
 */
export function getCardStackTransform(
    cardIndex: number,
    activeIndex: number,
    scrollProgress: number
): CardTransform {
    // Spacing between cards on Z-axis (in Three.js units)
    const CARD_SPACING = 15;

    // Calculate this card's position relative to active card
    const relativeIndex = cardIndex - activeIndex;
    const baseZOffset = relativeIndex * CARD_SPACING;

    // Apply smooth scroll interpolation
    // scrollProgress ranges from 0-1 as we scroll toward next card
    const scrollDelta = scrollProgress * CARD_SPACING;
    const finalZ = baseZOffset - scrollDelta;

    // POSITION: Cards are centered (X=0, Y=0), only Z changes
    // Active card sits at Z=0, others behind or in front
    const position = new THREE.Vector3(0, 0, finalZ);

    // ROTATION: ALWAYS zero - cards always face camera
    // This is the key difference from curve navigation
    const rotation = new THREE.Euler(0, 0, 0);

    // SCALE: Distance-based scaling for depth perception
    // Cards further away are smaller (perspective effect)
    const distanceFromCamera = Math.abs(finalZ + 10); // Camera at Z=10
    const baseScale = 1.0;

    // Scale formula: further = smaller, but cap at 0.3 minimum
    const scaleByDistance = Math.max(0.3, 1 - (distanceFromCamera / 60));
    let scale = baseScale * scaleByDistance;

    // Clamp active card scale to ensure breathing room
    // Max 65vh/80vw constraint will be applied in component
    if (Math.abs(finalZ) < 1) {
        scale = Math.min(scale, 1.0);
    }

    // OPACITY: Fade out distant cards for depth
    // Cards beyond 30 units are completely transparent
    const opacity = Math.max(0, Math.min(1, 1 - (distanceFromCamera / 40)));

    return {
        position,
        rotation,
        scale,
        opacity,
    };
}

/**
 * Hook for stack layout - provides transform calculator
 */
export function useStackLayout() {
    return useMemo(() => ({
        getCardTransform: getCardStackTransform,
    }), []);
}

/**
 * Get total scroll length based on number of cards
 */
export function getScrollLength(cardCount: number): number {
    return cardCount - 1; // 0 to (n-1)
}
