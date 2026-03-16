'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Trophy, Calendar, Users, ArrowRight, ExternalLink, Award, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Achievement } from '@/types/content';

interface Props {
    achievement: Achievement;
}

export default function CompetitionTemplate({ achievement }: Props) {
    const { portfolioContent: pc = {}, title, award, team, institution, year, description, type } = achievement;
    const galleryRef = useRef(null);
    const isGalleryInView = useInView(galleryRef, { once: true, amount: 0.1 });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
    };

    return (
        <div className="bg-zinc-950 text-white min-h-screen">

            {/* BACK BUTTON */}
            <div className="absolute top-6 left-6 z-50">
                <Button variant="ghost" size="sm" asChild className="text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                    <Link href="/achievements"><ChevronLeft className="h-4 w-4 mr-1" /> Back</Link>
                </Button>
            </div>

            {/* HERO — Full-screen cinematic */}
            <section className="relative min-h-screen flex items-end overflow-hidden">
                {/* Hero image */}
                {pc.heroImageUrl && (
                    <>
                        <Image src={pc.heroImageUrl} alt={title} fill className="object-cover" priority unoptimized />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/20" />
                    </>
                )}
                {!pc.heroImageUrl && (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-red-950/30 to-zinc-950" />
                )}

                {/* Animated background grid texture */}
                <div className="absolute inset-0 opacity-5"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
                />

                <div className="container relative z-10 pb-24 pt-32">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="max-w-4xl"
                    >
                        {/* Award pill */}
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-3 mb-8">
                            <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 backdrop-blur-sm px-5 py-2.5 rounded-full">
                                <Trophy className="h-5 w-5 text-amber-400 fill-amber-400" />
                                <span className="text-amber-300 font-black text-sm uppercase tracking-widest">{award}</span>
                            </div>
                            <span className="text-zinc-500 text-sm font-medium">{type} · {year}</span>
                        </motion.div>

                        {/* Main Title */}
                        <motion.h1
                            variants={itemVariants}
                            className="font-headline text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-8"
                        >
                            {title.split(' ').map((word, i) => (
                                <span key={i} className={i % 3 === 1 ? 'text-red-500' : 'text-white'}>
                                    {word}{' '}
                                </span>
                            ))}
                        </motion.h1>

                        {/* Tagline */}
                        {pc.tagline && (
                            <motion.p variants={itemVariants} className="text-xl text-zinc-300 font-light max-w-2xl leading-relaxed">
                                {pc.tagline}
                            </motion.p>
                        )}

                        {/* Team + Institution */}
                        <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Users className="h-4 w-4" />
                                <span className="font-semibold">{team}</span>
                            </div>
                            <div className="w-px h-4 bg-zinc-700" />
                            <span className="text-zinc-500 text-sm">{institution}</span>
                            {pc.externalLinks?.slice(0, 1).map(link => (
                                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors font-medium">
                                    {link.label} <ExternalLink className="h-3 w-3" />
                                </a>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>

                {/* Decorative scroll indicator */}
                <div className="absolute bottom-8 right-8 flex flex-col items-center gap-2 text-zinc-600">
                    <span className="text-[10px] uppercase tracking-widest font-bold rotate-90 origin-center translate-y-8">Scroll</span>
                    <div className="h-16 w-px bg-gradient-to-b from-zinc-600 to-transparent" />
                </div>
            </section>

            {/* HIGHLIGHTS STRIP */}
            {pc.highlights && pc.highlights.length > 0 && (
                <section className="border-y border-white/5 bg-zinc-900/50 py-8">
                    <div className="container">
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
                            {pc.highlights.map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="px-8 py-4 text-center"
                                >
                                    <p className="text-3xl md:text-4xl font-headline font-black text-white">{h.value}</p>
                                    <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold mt-1">{h.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* PROBLEM → SOLUTION */}
            {(pc.problemStatement || pc.solutionSummary) && (
                <section className="py-24 md:py-32">
                    <div className="container max-w-5xl">
                        <div className="grid md:grid-cols-2 gap-16 md:gap-24">
                            {pc.problemStatement && (
                                <motion.div
                                    initial={{ opacity: 0, x: -40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.7 }}
                                >
                                    <div className="inline-block text-[10px] font-black uppercase tracking-[0.4em] text-red-500 mb-6 border-b border-red-500/30 pb-2">
                                        The Problem
                                    </div>
                                    <p className="text-zinc-300 text-lg leading-relaxed">{pc.problemStatement}</p>
                                </motion.div>
                            )}
                            {pc.solutionSummary && (
                                <motion.div
                                    initial={{ opacity: 0, x: 40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.7, delay: 0.15 }}
                                >
                                    <div className="inline-block text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 mb-6 border-b border-amber-400/30 pb-2">
                                        Our Solution
                                    </div>
                                    <p className="text-zinc-300 text-lg leading-relaxed">{pc.solutionSummary}</p>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* GALLERY */}
            {pc.galleryImages && pc.galleryImages.length > 0 && (
                <section ref={galleryRef} className="py-16 overflow-hidden">
                    <div className="container mb-10">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">Visual Archive</h2>
                        <p className="text-3xl font-headline font-bold mt-2">Gallery</p>
                    </div>
                    <motion.div
                        className="flex gap-4 px-8 overflow-x-auto pb-4 snap-x"
                        initial={{ x: 80, opacity: 0 }}
                        animate={isGalleryInView ? { x: 0, opacity: 1 } : {}}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {pc.galleryImages.map((url, i) => (
                            <div key={i} className="relative flex-shrink-0 w-72 md:w-96 h-52 md:h-64 rounded-lg overflow-hidden border border-white/5 snap-start">
                                <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover" unoptimized />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                            </div>
                        ))}
                    </motion.div>
                </section>
            )}

            {/* TEAM MEMBERS */}
            {pc.teamMembers && pc.teamMembers.length > 0 && (
                <section className="py-24 md:py-32 bg-zinc-900/30 border-t border-white/5">
                    <div className="container">
                        <div className="mb-16">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">The Squad</h2>
                            <p className="text-3xl font-headline font-bold mt-2">Team Members</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {pc.teamMembers.map((member, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08 }}
                                    className="group relative bg-zinc-900 border border-white/5 rounded-xl p-6 hover:border-red-500/30 hover:bg-zinc-800/50 transition-all"
                                >
                                    {member.avatarUrl ? (
                                        <div className="relative h-16 w-16 rounded-full overflow-hidden mb-4 border-2 border-white/10 group-hover:border-red-500/40 transition-colors">
                                            <Image src={member.avatarUrl} alt={member.name} fill className="object-cover" unoptimized />
                                        </div>
                                    ) : (
                                        <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4 border-2 border-white/5 text-2xl font-black text-zinc-600">
                                            {member.name.charAt(0)}
                                        </div>
                                    )}
                                    <p className="font-bold text-white text-sm">{member.name}</p>
                                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider mt-0.5">{member.role}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* VIDEO embed */}
            {pc.videoEmbedUrl && (
                <section className="py-24 md:py-32">
                    <div className="container max-w-4xl">
                        <h2 className="text-3xl font-headline font-bold mb-10 text-center">Dokumentasi Video</h2>
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                            <iframe src={pc.videoEmbedUrl} className="absolute inset-0 w-full h-full" allowFullScreen />
                        </div>
                    </div>
                </section>
            )}

            {/* FOOTER strip */}
            <section className="border-t border-white/5 py-12">
                <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <p className="text-zinc-600 text-sm uppercase tracking-widest">Codebusters · {year}</p>
                        <p className="text-white font-bold mt-1">{team} — {award}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {pc.externalLinks?.map(link => (
                            <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 rounded-full">
                                    {link.label} <ExternalLink className="ml-2 h-3 w-3" />
                                </Button>
                            </a>
                        ))}
                        <Button asChild variant="ghost" size="sm" className="text-zinc-500 hover:text-white rounded-full">
                            <Link href="/achievements">← Semua Pencapaian</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
