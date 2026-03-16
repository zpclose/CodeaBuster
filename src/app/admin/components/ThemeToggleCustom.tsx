'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function ThemeToggleCustom({ className, scale = 1 }: { className?: string; scale?: number }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className={cn("w-16 h-8 rounded-full bg-muted animate-pulse", className)} />;

    const isDark = theme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
                "relative flex items-center cursor-pointer border-none p-0 outline-none transition-transform duration-300 active:scale-[0.98] w-full",
                className
            )}
            style={{ transform: `scale(${scale})` }}
            aria-label="Toggle Theme"
        >
            {/* Track */}
            <motion.div
                className="relative flex-1 h-12 rounded-2xl overflow-hidden shadow-inner border border-white/10"
                animate={{
                    backgroundColor: isDark ? "#0f172a" : "#3b82f6",
                    background: isDark
                        ? "linear-gradient(to bottom, #020617, #0f172a)"
                        : "linear-gradient(to bottom, #60a5fa, #93c5fd)"
                }}
                transition={{ duration: 0.5 }}
            >
                {/* Day Elements (Clouds) */}
                <AnimatePresence>
                    {!isDark && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute inset-0 pointer-events-none"
                        >
                            <div className="absolute bottom-1 right-12 w-10 h-6 bg-white/60 rounded-full blur-[1px]" />
                            <div className="absolute bottom-3 left-16 w-12 h-6 bg-white/80 rounded-full" />
                            <div className="absolute top-2 right-16 w-8 h-4 bg-white/40 rounded-full blur-[2px]" />
                            <div className="absolute bottom-1 left-8 w-10 h-5 bg-white/50 rounded-full blur-[1px]" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Night Elements (Stars) */}
                <AnimatePresence>
                    {isDark && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 pointer-events-none"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                                <motion.div
                                    key={i}
                                    className="absolute bg-white rounded-full w-[2px] h-[2px]"
                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                    transition={{
                                        duration: Math.random() * 2 + 1,
                                        repeat: Infinity,
                                        delay: Math.random() * 2
                                    }}
                                    style={{
                                        top: `${Math.random() * 80 + 10}%`,
                                        left: `${Math.random() * 90 + 5}%`
                                    }}
                                />
                            ))}
                            <motion.div
                                className="absolute top-2 left-10 w-8 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                                animate={{
                                    opacity: [0, 1, 0],
                                    x: [0, 50],
                                    y: [0, 25]
                                }}
                                transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    repeatDelay: 4
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Thumb (Sun/Moon) container with constrained movement */}
                <div className={cn(
                    "absolute inset-1 flex items-center transition-all duration-300",
                    isDark ? "justify-end" : "justify-start"
                )}>
                    <motion.div
                        layout
                        className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center overflow-hidden"
                        animate={{
                            backgroundColor: isDark ? "#cbd5e1" : "#facc15",
                            boxShadow: isDark
                                ? "inset -2px -2px 5px rgba(0,0,0,0.2), 0 0 12px rgba(255,255,255,0.15)"
                                : "0 0 20px rgba(234,179,8,0.7), inset -1px -1px 4px rgba(0,0,0,0.1)"
                        }}
                    >
                        {/* Moon Craters - Natural and varied - shifted to the right as per user request */}
                        {isDark && (
                            <div className="absolute inset-0">
                                <div className="absolute top-2 right-2 w-3 h-3 bg-slate-400/40 rounded-full blur-[0.4px]" />
                                <div className="absolute top-5 right-5 w-1.5 h-1.5 bg-slate-400/40 rounded-full blur-[0.4px]" />
                                <div className="absolute bottom-2 right-3 w-2 h-2 bg-slate-400/40 rounded-full blur-[0.4px]" />
                                <div className="absolute top-4 right-1.5 w-2 h-2 bg-slate-400/40 rounded-full blur-[0.4px]" />
                                <div className="absolute bottom-3 right-1 w-2.5 h-2.5 bg-slate-400/40 rounded-full blur-[0.4px]" />
                            </div>
                        )}

                        {/* Sun Core Glow - Centered Circle */}
                        {!isDark && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-8 h-8 bg-gradient-to-br from-yellow-100 to-transparent opacity-60 rounded-full blur-[2px]" />
                            </div>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </button>
    );
}
