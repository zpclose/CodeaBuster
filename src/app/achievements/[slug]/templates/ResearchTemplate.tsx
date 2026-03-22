'use client';

import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, ChevronLeft, BookOpen, Users, Award, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Achievement } from '@/types/content';

interface Props {
    achievement: Achievement;
}

export default function ResearchTemplate({ achievement }: Props) {
    const { portfolioContent: pc = {}, title, award, team, institution, year, description, type } = achievement;

    return (
        <div className="bg-background text-foreground min-h-screen font-sans">

            {/* BACK */}
            <div className="fixed top-6 left-6 z-50">
                <Button variant="ghost" size="sm" asChild className="rounded-full bg-background/80 backdrop-blur-sm border">
                    <Link href="/achievements"><ChevronLeft className="h-4 w-4 mr-1" /> Back</Link>
                </Button>
            </div>

            {/* HEADER — Paper-style */}
            <section className="pt-28 pb-16 border-b-4 border-foreground">
                <div className="container max-w-4xl">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                        <div className="flex items-center gap-3 mb-6">
                            <FlaskConical className="h-5 w-5 text-primary" />
                            <span className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground">{type} · {year}</span>
                            <Badge variant="secondary" className="rounded-none font-black text-[10px] uppercase tracking-wider px-3">{award}</Badge>
                        </div>

                        <h1 className="font-headline text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6">
                            {title}
                        </h1>

                        {pc.tagline && (
                            <p className="text-xl italic text-muted-foreground leading-relaxed border-l-4 border-primary pl-6 max-w-2xl">
                                {pc.tagline}
                            </p>
                        )}

                        <div className="mt-8 flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span><strong>{team}</strong> · {institution}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Hero image — full width */}
            {pc.heroImageUrl && (
                <div className="relative w-full h-72 md:h-96 border-b overflow-hidden">
                    <ImageWithSkeleton src={pc.heroImageUrl} alt={title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
                </div>
            )}

            {/* ABSTRACT */}
            {pc.problemStatement && (
                <section className="py-16 border-b">
                    <div className="container max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground mb-4">Abstract / Latar Belakang</h2>
                            <p className="text-foreground/80 leading-relaxed text-lg max-w-3xl">
                                {pc.problemStatement}
                            </p>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* FINDINGS / HIGHLIGHTS */}
            {pc.highlights && pc.highlights.length > 0 && (
                <section className="py-16 bg-muted/20 border-b">
                    <div className="container max-w-4xl">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground mb-10">Key Findings & Metrics</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {pc.highlights.map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-background border-2 border-foreground/10 p-6 rounded-none"
                                >
                                    <p className="text-4xl font-headline font-black">{h.value}</p>
                                    <div className="h-0.5 w-8 bg-primary mt-3 mb-2" />
                                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{h.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* METHODOLOGY / SOLUTION */}
            {pc.solutionSummary && (
                <section className="py-16 border-b">
                    <div className="container max-w-4xl">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground mb-4">Metodologi & Pendekatan</h2>
                        <p className="text-foreground/80 leading-relaxed text-lg max-w-3xl">{pc.solutionSummary}</p>
                    </div>
                </section>
            )}

            {/* GALLERY — grid */}
            {pc.galleryImages && pc.galleryImages.length > 0 && (
                <section className="py-16 border-b">
                    <div className="container max-w-4xl">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground mb-8">Dokumentasi Visual</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {pc.galleryImages.map((url, i) => (
                                <motion.div
                                    key={i}
                                    className="relative aspect-video rounded overflow-hidden border border-foreground/10"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <ImageWithSkeleton src={url} alt={`Doc ${i + 1}`} fill className="object-cover" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* TEAM — formal credits style */}
            {pc.teamMembers && pc.teamMembers.length > 0 && (
                <section className="py-16 border-b">
                    <div className="container max-w-4xl">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground mb-8">Authors & Contributors</h2>
                        <div className="space-y-4">
                            {pc.teamMembers.map((member, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.07 }}
                                    className="flex items-center gap-4 py-3 border-b border-dashed border-foreground/10 last:border-0"
                                >
                                    {member.avatarUrl ? (
                                        <div className="relative h-10 w-10 rounded-full overflow-hidden border flex-shrink-0">
                                            <ImageWithSkeleton src={member.avatarUrl} alt={member.name} fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <div className="h-10 w-10 rounded-full border-2 border-foreground/20 flex items-center justify-center font-black text-sm flex-shrink-0">
                                            {member.name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-semibold">{member.name}</span>
                                        <span className="text-muted-foreground text-sm ml-3">— {member.role}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* REFERENCES / LINKS */}
            {pc.externalLinks && pc.externalLinks.length > 0 && (
                <section className="py-16 border-b bg-muted/10">
                    <div className="container max-w-4xl">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground mb-6">References & Links</h2>
                        <div className="space-y-2">
                            {pc.externalLinks.map((link, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm">
                                    <span className="text-muted-foreground font-mono">[{i + 1}]</span>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-center gap-1">
                                        {link.label} <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* VIDEO */}
            {pc.videoEmbedUrl && (
                <section className="py-16 container max-w-4xl">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground mb-8">Video Presentasi</h2>
                    <div className="relative aspect-video border overflow-hidden">
                        <iframe src={pc.videoEmbedUrl} className="absolute inset-0 w-full h-full" allowFullScreen />
                    </div>
                </section>
            )}

            {/* FOOTER */}
            <footer className="border-t-4 border-foreground py-10">
                <div className="container max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                        <BookOpen className="inline h-4 w-4 mr-1" />
                        Codebusters / {institution} / {year}
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/achievements">← Semua Pencapaian</Link>
                    </Button>
                </div>
            </footer>
        </div>
    );
}
