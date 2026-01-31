'use client';

import { useEffect, useState } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { motion, AnimatePresence } from 'framer-motion';

export function IntroSequence() {
    const isIntroComplete = usePortfolioStore((state) => state.isIntroComplete);
    const setIntroComplete = usePortfolioStore((state) => state.setIntroComplete);
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Sequence Timeline
        // 0s: Start
        // 1s: Text 1 (JOE IRIZARRY)
        // 3s: Text 2 (DIRECTOR / EDITOR)
        // 5s: Curtain Lift

        const timer1 = setTimeout(() => setStep(1), 500);
        const timer2 = setTimeout(() => setStep(2), 2500);
        const timer3 = setTimeout(() => {
            setStep(3); // Fade out
            setTimeout(() => setIntroComplete(), 1000); // Trigger state change after fade
        }, 4500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    if (isIntroComplete) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black pointer-events-none">
            <AnimatePresence>
                {step < 3 && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                        className="flex flex-col items-center justify-center"
                    >
                        {step >= 1 && (
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="text-6xl md:text-9xl font-black text-white tracking-tighter mb-4 font-display"
                            >
                                JOE IRIZARRY
                            </motion.h1>
                        )}

                        {step >= 2 && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: '100%' }}
                                transition={{ duration: 0.8 }}
                                className="h-[2px] bg-cyan-500 mb-4"
                            />
                        )}

                        {step >= 2 && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-cyan-400 tracking-[0.5em] text-sm md:text-xl font-bold uppercase"
                            >
                                Director / Editor / VFX
                            </motion.p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cinematic Shutter Effect (Optional, can add SVG shutters here) */}
        </div>
    );
}
