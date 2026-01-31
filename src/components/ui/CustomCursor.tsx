'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Custom Cursor - Holographic Target Reticle
 * A high-tech, spinning crosshair that expands on click/hover.
 */
export function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (cursorRef.current && ringRef.current) {
                // Direct DOM update for performance
                const x = e.clientX;
                const y = e.clientY;
                cursorRef.current.style.transform = `translate(${x}px, ${y}px)`;

                // Ring follows with slight delay (lerp could be added here for smoothness)
                // For now, keep it tight for precision
                ringRef.current.style.transform = `translate(${x}px, ${y}px) ${isClicking ? 'scale(0.8)' : isHovering ? 'scale(1.5) rotate(45deg)' : 'scale(1) rotate(0deg)'}`;
            }

            // Check if hovering interactive element
            const target = e.target as HTMLElement;
            const interactive = target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('[role="button"]');
            setIsHovering(!!interactive);
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isHovering, isClicking]);

    return (
        <div className="pointer-events-none fixed inset-0 z-[100] mix-blend-difference overflow-hidden">
            {/* Center Dot */}
            <div
                ref={cursorRef}
                className="absolute top-0 left-0 w-1 h-1 bg-cyan-400 rounded-full"
                style={{ marginLeft: -2, marginTop: -2 }}
            />

            {/* Spinning Reticle Ring */}
            <div
                ref={ringRef}
                className="absolute top-0 left-0 w-8 h-8 border border-cyan-400/50 rounded-full transition-all duration-300 ease-out flex items-center justify-center"
                style={{ marginLeft: -16, marginTop: -16 }}
            >
                {/* Crosshairs */}
                <div className="absolute w-full h-[1px] bg-cyan-400/30"></div>
                <div className="absolute h-full w-[1px] bg-cyan-400/30"></div>

                {/* Corner Accents */}
                <div className="absolute top-[-2px] left-[-2px] w-2 h-2 border-t border-l border-cyan-400"></div>
                <div className="absolute top-[-2px] right-[-2px] w-2 h-2 border-t border-r border-cyan-400"></div>
                <div className="absolute bottom-[-2px] left-[-2px] w-2 h-2 border-b border-l border-cyan-400"></div>
                <div className="absolute bottom-[-2px] right-[-2px] w-2 h-2 border-b border-r border-cyan-400"></div>
            </div>
        </div>
    );
}
