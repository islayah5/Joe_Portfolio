'use client';

import { useEffect, useRef } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';

/**
 * Custom Cursor - trailing blend-mode spotlight
 */
export function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const trailRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            }

            if (trailRef.current) {
                // Smooth trail with delay
                setTimeout(() => {
                    if (trailRef.current) {
                        trailRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
                    }
                }, 50);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <>
            {/* Trail */}
            <div
                ref={trailRef}
                className="fixed top-0 left-0 w-32 h-32 rounded-full pointer-events-none z-50 mix-blend-difference"
                style={{
                    background: 'radial-gradient(circle, rgba(0,255,255,0.3) 0%, transparent 70%)',
                    transform: 'translate(-50%, -50%)',
                    transition: 'transform 0.15s ease-out',
                }}
            />

            {/* Cursor dot */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-2 h-2 bg-cyan-400 rounded-full pointer-events-none z-50 mix-blend-difference"
                style={{
                    transform: 'translate(-50%, -50%)',
                }}
            />
        </>
    );
}
