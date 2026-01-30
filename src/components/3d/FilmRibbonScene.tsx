'use client';

import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { VideoCard } from './VideoCard';
import { CameraRig, ScrollListener } from './CameraRig';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useRibbonCurve } from '@/utils/ribbonCurve';
import * as THREE from 'three';

/**
 * Main 3D Scene - The Infinite Film Ribbon
 */
export function FilmRibbonScene() {
    const videoCards = usePortfolioStore((state) => state.videoCards);
    const { getCardTransform } = useRibbonCurve();

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
            >
                {/* Camera Controller */}
                <CameraRig />

                {/* Lighting */}
                <ambientLight intensity={0.2} />
                <directionalLight position={[10, 10, 5]} intensity={0.5} />
                <pointLight position={[-10, -10, -5]} intensity={0.3} color="#00ffff" />

                {/* Environment & Atmosphere */}
                <Stars
                    radius={100}
                    depth={50}
                    count={5000}
                    factor={4}
                    saturation={0}
                    fade
                    speed={0.5}
                />

                {/* Fog for depth */}
                <fog attach="fog" args={['#000000', 10, 50]} />

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

                {/* Floating particles that react to speed */}
                <ParticleField />

                {/* Post-Processing Effects */}
                <EffectComposer>
                    {/* Bloom for that filmic glow */}
                    <Bloom
                        intensity={0.3}
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
                        opacity={0.05}
                    />
                </EffectComposer>
            </Canvas>
        </>
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
