'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Creates a twisted 3D curve path that loops through space
 * The curve uses Catmull-Rom spline for smooth interpolation
 */
export function createRibbonCurve(): THREE.CatmullRomCurve3 {
    // Define control points for the curve - creates a figure-8 / infinity loop in 3D
    const points: THREE.Vector3[] = [];
    const segments = 20;
    const radius = 15;
    const heightVariation = 8;

    for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;

        // Create a twisted figure-8 path in 3D space
        const x = radius * Math.sin(t) * Math.cos(t * 0.5);
        const y = heightVariation * Math.sin(t * 1.5);
        const z = radius * Math.cos(t) * Math.sin(t * 0.5);

        points.push(new THREE.Vector3(x, y, z));
    }

    // Create Catmull-Rom curve (smooth spline through points)
    return new THREE.CatmullRomCurve3(points, true); // true = closed loop
}

/**
 * Get position and rotation data for a card along the curve
 * Includes the "banking" rotation to align with curve twist
 */
export function getCardTransform(
    curve: THREE.CatmullRomCurve3,
    t: number // Position along curve (0-1)
) {
    // Get point on curve  const position = curve.getPointAt(t);

    // Get tangent (forward direction)
    const tangent = curve.getTangentAt(t).normalize();

    // Calculate the binormal (banking direction)
    // We use a slightly offset point to calculate the normal plane
    const offset = 0.001;
    const posA = curve.getPointAt(Math.max(0, t - offset));
    const posB = curve.getPointAt(Math.min(1, t + offset));
    const tangentA = posB.clone().sub(posA).normalize();

    // Create a rotation matrix that aligns the card with the curve
    // The card "banks" into curves like a flying camera
    const up = new THREE.Vector3(0, 1, 0);
    const normal = new THREE.Vector3().crossVectors(up, tangent).normalize();
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

    // Calculate roll angle based on curve curvature
    const curvePoint = curve.getPointAt(t);
    const nextPoint = curve.getPointAt((t + 0.01) % 1);
    const curvature = nextPoint.clone().sub(curvePoint).normalize();
    const rollAngle = Math.atan2(curvature.x, curvature.z) * 0.5; // Dampened banking

    // Create rotation quaternion
    const matrix = new THREE.Matrix4();
    matrix.makeBasis(normal, binormal, tangent.clone().negate());
    const rotation = new THREE.Quaternion().setFromRotationMatrix(matrix);

    // Apply bank/roll
    const rollQuaternion = new THREE.Quaternion().setFromAxisAngle(tangent, rollAngle);
    rotation.multiply(rollQuaternion);

    return {
        position,
        rotation,
        tangent,
        normal,
        binormal,
        rollAngle,
    };
}

/**
 * Hook to get curve and helper functions
 */
export function useRibbonCurve() {
    const curve = useMemo(() => createRibbonCurve(), []);

    return {
        curve,
        getCardTransform: (t: number) => getCardTransform(curve, t),
        getTotalLength: () => curve.getLength(),
    };
}
