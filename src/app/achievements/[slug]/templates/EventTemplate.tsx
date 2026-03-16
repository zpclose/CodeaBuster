'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, ChevronLeft, CalendarDays, Star, Heart, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Achievement } from '@/types/content';

interface Props {
    achievement: Achievement;
}

export default function EventTemplate({ achievement }: Props) {
    const { portfolioContent: pc = {}, title, award, team, institution, year, description, type } = achievement;
    const gallery = pc.galleryImages || [];

    return (
        <div className="bg-background text-foreground min-h-screen">

            {/* BACK */}
            <div className="fixed top-4 left-4 z-50">
                <Button variant="default" size="sm" asChild className="rounded-full shadow-lg">
                    <Link href="/achievements"><ChevronLeft className="h-4 w-4 mr-1" /> Back</Link>
                </Button>
            </div>

            {/* HERO — Photo masonry / collage */}
            <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-amber-950">
                {gallery.length > 0 ? (
                    <div className="absolute inset-0 grid grid-cols-3 gap-1 opacity-60">
                        {[...gallery, ...gallery].slice(0, 6).map((url, i) => (
                            <div key={i} className={`relative overflow-hidden ${i === 0 ? 'row-span-2 col-span-2' : ''}`}>
                                <Image src={url} alt="" fill className="object-cover" unoptimized />
                            </div>
                        ))}
                    </div>
                ) : pc.heroImageUrl ? (
                    <>
                        <Image src={pc.heroImageUrl} alt={title} fill className="object-cover opacity-50" unoptimized />
                    </>
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-950 via-amber-950/70 to-amber-950/40" />

                <div className="container relative z-10 py-32 text-amber-50">
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <div className="flex items-center gap-3 mb-6">
                            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                            <span className="text-amber-300 font-black text-sm uppercase tracking-widest">{award} · {year}</span>
                        </div>
                        <h1 className="font-headline text-5xl md:text-8xl font-black leading-tight tracking-tight mb-6">
                            {title}
                        </h1>
                        {pc.tagline && (
                            <p className="text-amber-200/80 text-xl max-w-2xl leading-relaxed">{pc.tagline}</p>
                        )}
                        <div className="mt-8 flex flex-wrap gap-3 text-sm">
                            <span className="bg-white/10 backdrop-blur rounded-full px-4 py-1.5 font-medium">{team}</span>
                            <span className="bg-white/10 backdrop-blur rounded-full px-4 py-1.5 font-medium">{type}</span>
                            <span className="bg-white/10 backdrop-blur rounded-full px-4 py-1.5 font-medium">{institution}</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* HIGHLIGHTS STRIP */}
            {pc.highlights && pc.highlights.length > 0 && (
                <section className="bg-amber-500 py-8">
                    <div className="container">
                        <div className="flex flex-wrap justify-center gap-12 divide-x divide-amber-400/40">
                            {pc.highlights.map((h, i) => (
                                <div key={i} className={`px-6 text-center ${i > 0 ? 'first:pl-0' : ''}`}>
                                    <p className="text-3xl font-headline font-black text-amber-950">{h.value}</p>
                                    <p className="text-[11px] uppercase tracking-widest text-amber-800 font-bold mt-1">{h.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ABOUT EVENT */}
            {(pc.problemStatement || pc.solutionSummary) && (
                <section className="py-24 md:py-32 container max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-16">
                        {pc.problemStatement && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <Heart className="h-8 w-8 text-amber-500 mb-6" />
                                <h3 className="text-2xl font-headline font-bold mb-4">Latar Belakang Event</h3>
                                <p className="text-muted-foreground leading-relaxed">{pc.problemStatement}</p>
                            </motion.div>
                        )}
                        {pc.solutionSummary && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.15 }}
                            >
                                <CalendarDays className="h-8 w-8 text-amber-500 mb-6" />
                                <h3 className="text-2xl font-headline font-bold mb-4">Rangkaian Kegiatan</h3>
                                <p className="text-muted-foreground leading-relaxed">{pc.solutionSummary}</p>
                            </motion.div>
                        )}
                    </div>
                </section>
            )}

            {/* PHOTO GALLERY — Masonry-inspired grid */}
            {gallery.length > 0 && (
                <section className="py-16 bg-muted/20 border-y">
                    <div className="container">
                        <div className="flex items-center gap-3 mb-10">
                            <Camera className="h-5 w-5 text-amber-500" />
                            <h2 className="text-2xl font-headline font-bold">Momen Kegiatan</h2>
                        </div>
                        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
                            {gallery.map((url, i) => (
                                <motion.div
                                    key={i}
                                    className="relative break-inside-avoid rounded-xl overflow-hidden"
                                    style={{ aspectRatio: i % 3 === 0 ? '1/1.3' : i % 3 === 1 ? '1/0.8' : '1/1' }}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.06 }}
                                >
                                    <Image src={url} alt={`Moment ${i + 1}`} fill className="object-cover" unoptimized />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* TEAM */}
            {pc.teamMembers && pc.teamMembers.length > 0 && (
                <section className="py-24 container max-w-5xl">
                    <h2 className="text-2xl font-headline font-bold mb-10">Tim Pelaksana</h2>
                    <div className="flex flex-wrap gap-6">
                        {pc.teamMembers.map((member, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07 }}
                                className="flex flex-col items-center gap-2 text-center group"
                            >
                                {member.avatarUrl ? (
                                    <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-amber-200 group-hover:border-amber-500 transition-colors shadow">
                                        <Image src={member.avatarUrl} alt={member.name} fill className="object-cover" unoptimized />
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 rounded-full border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center font-black text-amber-600 text-xl">
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
                </section>
            )}

            {/* VIDEO */}
            {pc.videoEmbedUrl && (
                <section className="py-16 container max-w-4xl">
                    <h2 className="text-2xl font-headline font-bold mb-8 text-center">Video Dokumenter</h2>
                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-200">
                        <iframe src={pc.videoEmbedUrl} className="absolute inset-0 w-full h-full" allowFullScreen />
                    </div>
                </section>
            )}

            {/* FOOTER */}
            <footer className="bg-amber-500 py-10">
                <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-amber-950">
                        <p className="font-black text-lg">{team}</p>
                        <p className="text-sm opacity-80">{award} · {year} · {institution}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {pc.externalLinks?.map(link => (
                            <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="secondary" className="bg-amber-950/20 text-amber-950 hover:bg-amber-950/30 rounded-full border-0">
                                    {link.label} <ExternalLink className="ml-2 h-3 w-3" />
                                </Button>
                            </a>
                        ))}
                        <Button asChild size="sm" className="bg-amber-950 text-amber-50 hover:bg-amber-900 rounded-full">
                            <Link href="/achievements">← Kembali</Link>
                        </Button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
