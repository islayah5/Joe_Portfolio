'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { cardShaderVertex, cardShaderFragment, cardBackShaderFragment } from '@/shaders/cardShaders';

interface VideoCardProps {
    id: string;
    position: THREE.Vector3;
    rotation: THREE.Quaternion;
    thumbnail: string;
    title: string;
    description: string;
    credits: string[];
    index: number;
}

export function VideoCard({
    id,
    position,
    rotation,
    thumbnail,
    title,
    description,
    credits,
    index,
}: VideoCardProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    const [hovered, setHovered] = useState(false);
    const activeCardIndex = usePortfolioStore((state) => state.activeCardIndex);
    const flippedCards = usePortfolioStore((state) => state.flippedCards);
    const toggleCardFlip = usePortfolioStore((state) => state.toggleCardFlip);
    const openPlayer = usePortfolioStore((state) => state.openPlayer);

    const isActive = activeCardIndex === index;
    const isFlipped = flippedCards.has(id);

    // Load thumbnail texture (using placeholder for now)
    // In production, you'd load the actual YouTube thumbnail
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

        // Animate flip rotation
        const targetRotationY = isFlipped ? Math.PI : 0;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
            groupRef.current.rotation.y,
            targetRotationY,
            delta * 8
        );

        // Subtle floating animation when active
        if (isActive) {
            groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.001;
        }
    });

    const handleClick = () => {
        if (isActive) {
            // If already active, open the YouTube player
            openPlayer(id);
        }
    };

    const handlePointerDown = (e: any) => {
        e.stopPropagation();
    };

    return (
        <group
            ref={groupRef}
            position={position}
            quaternion={rotation}
        >
            {/* Front Face - Video Thumbnail */}
            <mesh
                ref={meshRef}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
                onClick={handleClick}
                onPointerDown={handlePointerDown}
            >
                <planeGeometry args={[3.555, 2, 32, 32]} /> {/* 16:9 aspect ratio */}
                <shaderMaterial
                    vertexShader={cardShaderVertex}
                    fragmentShader={cardShaderFragment}
                    uniforms={frontUniforms}
                    side={THREE.FrontSide}
                />
            </mesh>

            {/* Back Face - Typography/Credits */}
            <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[3.555, 2, 16, 16]} />
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
                    <planeGeometry args={[3.8, 2.25]} />
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
