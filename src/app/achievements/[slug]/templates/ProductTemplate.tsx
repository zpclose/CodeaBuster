'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, ChevronLeft, Layers, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Achievement } from '@/types/content';

interface Props {
    achievement: Achievement;
}

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

export default function ProductTemplate({ achievement }: Props) {
    const { portfolioContent: pc = {}, title, award, team, institution, year, description, type, category } = achievement;

    return (
        <div className="bg-background text-foreground min-h-screen">

            {/* BACK */}
            <div className="fixed top-6 left-6 z-50">
                <Button variant="ghost" size="sm" asChild className="rounded-full bg-background/80 backdrop-blur-sm border">
                    <Link href="/achievements"><ChevronLeft className="h-4 w-4 mr-1" /> Back</Link>
                </Button>
            </div>

            {/* HERO — Clean & airy */}
            <section className="pt-28 pb-16 md:pt-40 md:pb-24 container max-w-6xl">
                <motion.div variants={stagger} initial="hidden" animate="visible">
                    <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
                        <div className="h-px flex-1 max-w-12 bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">{award}</span>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <motion.h1 variants={fadeUp} className="font-headline text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85] mb-6">
                                {title}
                            </motion.h1>
                            {pc.tagline && (
                                <motion.p variants={fadeUp} className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md">
                                    {pc.tagline}
                                </motion.p>
                            )}
                            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                <span className="px-3 py-1 bg-muted rounded-full font-medium">{team}</span>
                                <span className="px-3 py-1 bg-muted rounded-full font-medium">{type}</span>
                                <span className="px-3 py-1 bg-muted rounded-full font-medium">{year}</span>
                            </motion.div>
                            {pc.externalLinks && pc.externalLinks.length > 0 && (
                                <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
                                    {pc.externalLinks.map(link => (
                                        <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" variant="outline" className="rounded-full">
                                                {link.label} <ExternalLink className="ml-2 h-3 w-3" />
                                            </Button>
                                        </a>
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        {/* Hero visual — device mockup style */}
                        {pc.heroImageUrl && (
                            <motion.div
                                variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.8 } } }}
                                className="relative"
                            >
                                <div className="relative mx-auto w-72 md:w-80">
                                    {/* Device frame */}
                                    <div className="relative border-[12px] border-foreground/10 bg-foreground/5 rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[9/19]">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-foreground/10 rounded-b-2xl z-10" />
                                        <Image src={pc.heroImageUrl} alt={title} fill className="object-cover" unoptimized />
                                    </div>
                                    {/* Glow effect */}
                                    <div className="absolute inset-0 -z-10 blur-3xl opacity-20 scale-75 bg-primary rounded-full" />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </section>

            {/* HIGHLIGHTS */}
            {pc.highlights && pc.highlights.length > 0 && (
                <section className="py-12 bg-muted/30 border-y">
                    <div className="container max-w-6xl">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {pc.highlights.map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-background rounded-2xl p-6 text-center shadow-sm border"
                                >
                                    <p className="text-3xl font-headline font-black text-primary">{h.value}</p>
                                    <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-wider">{h.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* PROBLEM / SOLUTION */}
            {(pc.problemStatement || pc.solutionSummary) && (
                <section className="py-24 md:py-32 container max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-16">
                        {pc.problemStatement && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="w-10 h-1 bg-destructive mb-6 rounded-full" />
                                <h3 className="text-2xl font-headline font-bold mb-4">Masalah yang Dihadapi</h3>
                                <p className="text-muted-foreground leading-relaxed">{pc.problemStatement}</p>
                            </motion.div>
                        )}
                        {pc.solutionSummary && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.15 }}
                            >
                                <div className="w-10 h-1 bg-primary mb-6 rounded-full" />
                                <h3 className="text-2xl font-headline font-bold mb-4">Solusi Kami</h3>
                                <p className="text-muted-foreground leading-relaxed">{pc.solutionSummary}</p>
                            </motion.div>
                        )}
                    </div>
                </section>
            )}

            {/* GALLERY — alternating layout */}
            {pc.galleryImages && pc.galleryImages.length > 0 && (
                <section className="py-16 border-t">
                    <div className="container max-w-6xl">
                        <h2 className="text-sm font-black uppercase tracking-[0.4em] text-muted-foreground mb-12">
                            <Layers className="inline h-4 w-4 mr-2" />Screens & Visuals
                        </h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {pc.galleryImages.map((url, i) => (
                                    <motion.div
                                        key={i}
                                        className="relative aspect-[9/16] rounded-2xl overflow-hidden border bg-muted shadow-sm"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.07 }}
                                    >
                                        <Image src={url} alt={`Screen ${i + 1}`} fill className="object-cover" unoptimized />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* TEAM */}
            {pc.teamMembers && pc.teamMembers.length > 0 && (
                <section className="py-24 md:py-32 bg-muted/20 border-t">
                    <div className="container max-w-6xl">
                        <h2 className="text-3xl font-headline font-bold mb-12">Tim Pengembang</h2>
                        <div className="flex flex-wrap gap-4">
                            {pc.teamMembers.map((member, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08 }}
                                    className="flex items-center gap-3 bg-background border rounded-full pl-1 pr-5 py-1 shadow-sm"
                                >
                                    {member.avatarUrl ? (
                                        <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                                            <Image src={member.avatarUrl} alt={member.name} fill className="object-cover" unoptimized />
                                        </div>
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 font-black text-primary text-sm">
                                            {member.name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-semibold">{member.name}</p>
                                        <p className="text-[11px] text-muted-foreground">{member.role}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* VIDEO */}
            {pc.videoEmbedUrl && (
                <section className="py-24 md:py-32 container max-w-4xl">
                    <h2 className="text-3xl font-headline font-bold mb-10 text-center">Demo Video</h2>
                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border">
                        <iframe src={pc.videoEmbedUrl} className="absolute inset-0 w-full h-full" allowFullScreen />
                    </div>
                </section>
            )}

            {/* FOOTER */}
            <section className="border-t py-12">
                <div className="container max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <p className="text-muted-foreground text-sm">{institution} · {year}</p>
                        <p className="font-bold mt-0.5">{team} · <span className="text-primary">{award}</span></p>
                    </div>
                    <Button asChild variant="outline" className="rounded-full">
                        <Link href="/achievements">← Kembali ke Semua Pencapaian</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
