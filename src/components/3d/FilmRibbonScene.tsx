'use client';

import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Text, useProgress } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { VideoCard } from './VideoCard';
import { CameraRig, ScrollListener } from './CameraRig';
import { usePortfolioStore } from '@/store/usePortfolioStore';
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
 * Z-Axis Tunnel Navigation - Main 3D Scene
 * Cards on linear Z-stack, static camera, no rotation
 * Eliminates motion sickness from curve-based tumbling
 */
export function FilmRibbonScene() {
    const videoCards = usePortfolioStore((state) => state.videoCards);
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
                    position: [0, 0, 10],
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
                {/* Loading Tracker */}
                <LoadingTracker />

                {/* Static Camera Controller */}
                <CameraRig />

                {/* Cinematic Lighting - Teal & Orange */}
                <ambientLight intensity={0.1} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} color="#cffafe" />
                <pointLight position={[-10, -10, -5]} intensity={0.5} color="#fbbf24" />

                {/* Starfield - More prominent with breathing room */}
                <Stars
                    radius={100}
                    depth={80}
                    count={15000}  // Increased for better immersion
                    factor={6}
                    saturation={0}
                    fade
                    speed={1}
                />

                {/* Atmospheric Fog */}
                <fog attach="fog" args={['#050810', 20, 100]} />

                {/* Video Cards - Simplified props, no position/rotation */}
                {videoCards.map((card, index) => (
                    <VideoCard
                        key={card.id}
                        id={card.id}
                        index={index}
                        thumbnail={card.thumbnail}
                        title={card.title}
                        description={card.description}
                        credits={card.credits}
                    />
                ))}

                {/* Section Markers - Static positions on Z-axis */}
                <SectionMarker text="NARRATIVE" position={[0, 4, -15]} />
                <SectionMarker text="COMMERCIAL" position={[0, 4, -45]} />
                <SectionMarker text="MUSIC VIDEO" position={[0, 4, -75]} />

                {/* Floating Particles */}
                <ParticleField />

                {/* Post-Processing Effects */}
                <EffectComposer>
                    <Bloom
                        intensity={0.5}
                        luminanceThreshold={0.2}
                        luminanceSmoothing={0.9}
                        mipmapBlur
                    />
                    <ChromaticAberration
                        blendFunction={BlendFunction.NORMAL}
                        offset={new THREE.Vector2(0.0005, 0.0005)}
                    />
                    <Noise
                        premultiply
                        blendFunction={BlendFunction.ADD}
                        opacity={0.08}
                    />
                </EffectComposer>
            </Canvas>
        </>
    );
}

/**
 * Section Marker - Static 3D text labels
 * No rotation - always face camera
 */
function SectionMarker({ text, position }: { text: string; position: [number, number, number] }) {
    return (
        <Text
            position={position}
            fontSize={1.5}
            color="white"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.1}
        >
            {text}
            <meshStandardMaterial
                color="white"
                emissive="white"
                emissiveIntensity={0.5}
                toneMapped={false}
            />
        </Text>
    );
}

/**
 * Particle Field - Ambient floating particles
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
