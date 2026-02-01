'use client';

import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Text, useProgress } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { VideoCard } from './VideoCard';
import { CameraRig, ScrollListener } from './CameraRig';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useRibbonCurve } from '@/utils/ribbonCurve';
import * as THREE from 'three';

/**
 * Loading Progress Tracker - Updates store with loading state
 * Must be used inside Canvas component
 */
function LoadingTracker() {
    const { progress } = useProgress();

    useEffect(() => {
        const setSceneLoadProgress = usePortfolioStore.getState().setSceneLoadProgress;
        const setSceneReady = usePortfolioStore.getState().setSceneReady;

        setSceneLoadProgress(progress);

        // Mark scene as ready when fully loaded
        if (progress === 100) {
            // Small delay to ensure everything is rendered
            setTimeout(() => setSceneReady(true), 500);
        }
    }, [progress]);

    return null;
}

/**
 * Main 3D Scene - The Infinite Film Ribbon
 */
export function FilmRibbonScene() {
    const videoCards = usePortfolioStore((state) => state.videoCards);
    const { getCardTransform } = useRibbonCurve();
    const isDragging = useRef(false);

    // Prevent drag-to-black by tracking pointer down/up
    const handlePointerDown = () => {
        isDragging.current = true;
    };

    const handlePointerUp = () => {
        isDragging.current = false;
    };

    return (
        <>
            <ScrollListener />

            <Canvas
                camera={{
                    position: [0, 2, 10],
                    fov: 50,
                    near: 0.1,
                    far: 1000,
                }}
                gl={{
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.2,
                }}
                dpr={[1, 2]}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
            >
                {/* Loading Tracker - must be inside Canvas */}
                <LoadingTracker />
                {/* Camera Controller */}
                <CameraRig />

                {/* Lighting - Cinematic Teal & Orange Setup */}
                <ambientLight intensity={0.1} /> {/* Darker ambient */}
                <directionalLight position={[10, 10, 5]} intensity={1.5} color="#cffafe" /> {/* Cool Key */}
                <pointLight position={[-10, -10, -5]} intensity={0.5} color="#fbbf24" /> {/* Warm Rim */}

                {/* Environment & Atmosphere */}
                <Stars
                    radius={100}
                    depth={50}
                    count={7000} // More stars
                    factor={4}
                    saturation={0}
                    fade
                    speed={1} // Faster twinkle
                />

                {/* Fog for depth - matches global gradient */}
                <fog attach="fog" args={['#050810', 10, 60]} />

                {/* Video Cards along the ribbon */}
                {videoCards.map((card, index) => {
                    const transform = getCardTransform(card.position);

                    return (
                        <VideoCard
                            key={card.id}
                            id={card.id}
                            position={transform.position}
                            rotation={transform.rotation}
                            thumbnail={card.thumbnail}
                            title={card.title}
                            description={card.description}
                            credits={card.credits}
                            index={index}
                        />
                    );
                })}

                {/* Section Markers */}
                <SectionMarker text="NARRATIVE" position={0.13} />
                <SectionMarker text="COMMERCIAL" position={0.43} />
                <SectionMarker text="MUSIC VIDEO" position={0.73} />
                <SectionMarker text="CONTACT" position={0.93} />

                {/* Floating particles that react to speed */}
                <ParticleField />

                {/* Post-Processing Effects */}
                <EffectComposer>
                    {/* Bloom for that filmic glow */}
                    <Bloom
                        intensity={0.5} // Increased bloom
                        luminanceThreshold={0.2}
                        luminanceSmoothing={0.9}
                        mipmapBlur
                    />

                    {/* Chromatic Aberration for cinematic feel */}
                    <ChromaticAberration
                        blendFunction={BlendFunction.NORMAL}
                        offset={new THREE.Vector2(0.0005, 0.0005)}
                        radialModulation={false}
                        modulationOffset={0}
                    />

                    {/* Film grain noise */}
                    <Noise
                        premultiply
                        blendFunction={BlendFunction.ADD}
                        opacity={0.08} // Slightly more grain
                    />
                </EffectComposer>
            </Canvas>
        </>
    );
}

/**
 * 3D Text Marker Component
 */
function SectionMarker({ text, position }: { text: string; position: number }) {
    const { getCardTransform } = useRibbonCurve();
    const transform = getCardTransform(position);

    // Offset text slightly above the ribbon
    const textOffset = new THREE.Vector3(0, 3, 0);
    textOffset.applyQuaternion(transform.rotation);
    const finalPos = transform.position.clone().add(textOffset);

    return (
        <group position={finalPos} quaternion={transform.rotation}>
            <Text
                color="white"
                fontSize={1.5}
                maxWidth={20}
                lineHeight={1}
                letterSpacing={0.1}
                textAlign="center"
                anchorX="center"
                anchorY="middle"
            >
                {text}
                <meshStandardMaterial
                    color="white"
                    emissive="white"
                    emissiveIntensity={0.5}
                    toneMapped={false}
                />
            </Text>
        </group>
    );
}

/**
 * Particle Field - floating debris that reacts to scroll speed
 */
function ParticleField() {
    const particlesRef = useRef<THREE.Points>(null);

    // Create particle geometry
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particleCount}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.02}
                color="#ffffff"
                transparent
                opacity={0.3}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
}
