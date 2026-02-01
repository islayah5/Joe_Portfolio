'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { cardShaderVertex, cardShaderFragment, cardBackShaderFragment } from '@/shaders/cardShaders';
import { useStackLayout } from '@/utils/stackLayout';

interface VideoCardProps {
    id: string;
    thumbnail: string;
    title: string;
    description: string;
    credits: string[];
    index: number;
}

export function VideoCard({
    id,
    thumbnail,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    title,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    description,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    credits,
    index,
}: VideoCardProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const { viewport } = useThree();

    const [hovered, setHovered] = useState(false);
    const activeCardIndex = usePortfolioStore((state) => state.activeCardIndex);
    const scrollProgress = usePortfolioStore((state) => state.scrollProgress);
    const flippedCards = usePortfolioStore((state) => state.flippedCards);
    const openPlayer = usePortfolioStore((state) => state.openPlayer);

    const isActive = activeCardIndex === index;
    const isFlipped = flippedCards.has(id);

    // Get stack layout calculator
    const { getCardTransform } = useStackLayout();

    // Load thumbnail texture
    const texture = useLoader(TextureLoader, thumbnail);

    // Shader uniforms for the front face
    const frontUniforms = useMemo(
        () => ({
            uTexture: { value: texture },
            uTime: { value: 0 },
            uHoverIntensity: { value: 0 },
            uGlitchIntensity: { value: 0.3 },
            uTintColor: { value: new THREE.Color(0x00ffff) },
        }),
        [texture]
    );

    // Shader uniforms for the back face
    const backUniforms = useMemo(
        () => ({
            uBackgroundColor: { value: new THREE.Color(0x0a0a0a) },
            uTime: { value: 0 },
            uGlowIntensity: { value: 1.0 },
        }),
        []
    );

    // BASE CARD SIZE - smaller for breathing room
    // 16:9 aspect ratio, sized to fit within 65vh/80vw
    const baseWidth = 4.8;
    const baseHeight = 2.7;

    // Animation loop
    useFrame((state, delta) => {
        if (!meshRef.current || !groupRef.current) return;

        // Update shader time
        frontUniforms.uTime.value = state.clock.elapsedTime;
        backUniforms.uTime.value = state.clock.elapsedTime;

        // Animate hover intensity
        const targetHover = hovered || isActive ? 1 : 0;
        frontUniforms.uHoverIntensity.value = THREE.MathUtils.lerp(
            frontUniforms.uHoverIntensity.value,
            targetHover,
            delta * 5
        );

        // Calculate target transform from stack layout
        const targetTransform = getCardTransform(
            index,
            activeCardIndex,
            scrollProgress % 1 // Fractional part for smooth interpolation
        );

        // POSITION: Smooth lerp to target Z-position
        groupRef.current.position.lerp(targetTransform.position, delta * 5);

        // ROTATION: Handle Y-axis flip for card details
        // But NEVER rotate on X or Z axes (no tumbling!)
        const targetRotationY = isFlipped ? Math.PI : 0;
        groupRef.current.rotation.set(
            0, // X: always 0
            THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, delta * 8),
            0  // Z: always 0
        );

        // SCALE: Apply depth-based scaling with breathing room constraint
        const { scale, opacity } = targetTransform;

        // VISIBILITY: Hide distant cards completely (fixes z-index bleed-through)
        const distance = Math.abs(index - activeCardIndex);
        if (distance > 2) {
            // Cards more than 2 positions away are completely hidden
            groupRef.current.visible = false;
            return; // Skip rest of frame updates
        }

        groupRef.current.visible = true;

        // Clamp scale to ensure active card respects 65vh/80vw
        let finalScale = scale;
        if (isActive) {
            // Calculate max scale based on viewport to ensure breathing room
            const viewportConstraint = Math.min(
                (viewport.height * 0.65) / baseHeight,
                (viewport.width * 0.80) / baseWidth
            );
            finalScale = Math.min(scale, viewportConstraint);
        }

        groupRef.current.scale.lerp(
            new THREE.Vector3(finalScale, finalScale, 1),
            delta * 5
        );

        // OPACITY: Fade distant cards (applied to materials in render)
        if (meshRef.current.material) {
            const material = meshRef.current.material as THREE.ShaderMaterial;
            material.opacity = opacity;
            material.transparent = opacity < 1;
        }

        // Disable floating animation during scroll (reduces visual noise)
        // Only subtle float when completely stationary and active
        if (isActive && Math.abs(scrollProgress - activeCardIndex) < 0.01) {
            const floatAmount = Math.sin(state.clock.elapsedTime * 2) * 0.0005;
            groupRef.current.position.y += floatAmount;
        }
    });

    const handleClick = () => {
        if (isActive) {
            // If already active, open the YouTube player
            openPlayer(id);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePointerDown = (e: any) => {
        e.stopPropagation();
    };

    return (
        <group ref={groupRef}>
            {/* Front Face - Video Thumbnail */}
            <mesh
                ref={meshRef}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
                onClick={handleClick}
                onPointerDown={handlePointerDown}
            >
                <planeGeometry args={[baseWidth, baseHeight, 32, 32]} />
                <shaderMaterial
                    vertexShader={cardShaderVertex}
                    fragmentShader={cardShaderFragment}
                    uniforms={frontUniforms}
                    side={THREE.FrontSide}
                />
            </mesh>

            {/* Back Face - Typography/Credits */}
            <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[baseWidth, baseHeight, 16, 16]} />
                <shaderMaterial
                    vertexShader={cardShaderVertex}
                    fragmentShader={cardBackShaderFragment}
                    uniforms={backUniforms}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Active indicator glow */}
            {isActive && (
                <mesh position={[0, 0, -0.02]}>
                    <planeGeometry args={[baseWidth + 0.3, baseHeight + 0.3]} />
                    <meshBasicMaterial
                        color={0x00ffff}
                        transparent
                        opacity={0.2 + Math.sin(Date.now() * 0.003) * 0.1}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}
        </group>
    );
}
