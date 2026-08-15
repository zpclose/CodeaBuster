'use client';

import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Clock, Users, Building2, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import { useLiveEvents } from '@/hooks/useLiveEvents';
import type { LiveEvent, LiveEventStatus } from '@/types/content';

// ----------------------------------------------------------------
// Status badge styling
// ----------------------------------------------------------------
const STATUS_CONFIG: Record<LiveEventStatus, { label: string; className: string; dot: string }> = {
    'Sedang Berlangsung': {
        label: 'Sedang Berlangsung',
        className: 'bg-green-500/10 text-green-600 border-green-500/30',
        dot: 'bg-green-500 animate-pulse',
    },
    'Akan Berlangsung': {
        label: 'Akan Berlangsung',
        className: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
        dot: 'bg-blue-500',
    },
    'Selesai': {
        label: 'Selesai',
        className: 'bg-muted text-muted-foreground border-border',
        dot: 'bg-muted-foreground',
    },
};

// ----------------------------------------------------------------
// Format tanggal: "2026-08-15" → "15 Agustus 2026"
// ----------------------------------------------------------------
function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const [year, month, day] = dateStr.split('-');
    return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

// ----------------------------------------------------------------
// Single Event Card — ukuran menyesuaikan gambar
// ----------------------------------------------------------------
function EventCard({ event, index }: { event: LiveEvent; index: number }) {
    const status = STATUS_CONFIG[event.status];
    const hasImage = !!event.imageUrl;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.45 }}
        >
            <Card className="overflow-hidden border border-border/60 bg-card shadow-none hover:border-primary/30 hover:shadow-md transition-all duration-300 group h-full">
                {/* Gambar — hanya render kalau ada, aspect ratio 16:9 */}
                {hasImage && (
                    <div className="relative w-full overflow-hidden bg-muted"
                        style={{ aspectRatio: '16 / 9' }}
                    >
                        <ImageWithSkeleton
                            src={event.imageUrl}
                            alt={event.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            skeletonClassName="rounded-none"
                        />
                        {/* Status badge overlay */}
                        <div className="absolute top-3 left-3">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-sm bg-background/80 ${status.className}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                {status.label}
                            </span>
                        </div>
                    </div>
                )}

                <CardContent className={`p-5 space-y-3 ${!hasImage ? 'pt-5' : ''}`}>
                    {/* Status badge — kalau tidak ada gambar */}
                    {!hasImage && (
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${status.className}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                        </span>
                    )}

                    {/* Kampus */}
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium uppercase tracking-widest">
                        <Building2 className="h-3 w-3" />
                        <span>{event.university}</span>
                    </div>

                    {/* Judul */}
                    <h3 className="font-headline font-bold text-lg leading-tight tracking-tight line-clamp-2">
                        {event.title}
                    </h3>

                    {/* Deskripsi */}
                    {event.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {event.description}
                        </p>
                    )}

                    {/* Meta info */}
                    <div className="space-y-1.5 pt-1">
                        {event.eventDate && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                                <span>{formatDate(event.eventDate)}{event.eventTime ? ` · ${event.eventTime}` : ''}</span>
                            </div>
                        )}
                        {event.location && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                                <span className="line-clamp-1">{event.location}</span>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border/50 pt-3">
                        {/* Nama Tim */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <Users className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                                <span className="text-xs font-semibold truncate">{event.teamName}</span>
                            </div>
                            {event.teamMembers && event.teamMembers.length > 0 && (
                                <span className="text-[10px] text-muted-foreground shrink-0">
                                    {event.teamMembers.length} anggota
                                </span>
                            )}
                        </div>

                        {/* Daftar anggota */}
                        {event.teamMembers && event.teamMembers.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {event.teamMembers.map((member, i) => (
                                    <span
                                        key={i}
                                        className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                                    >
                                        {member.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// ----------------------------------------------------------------
// Main Section Component
// ----------------------------------------------------------------
export function LiveEventsSection() {
    const { events, isLoading } = useLiveEvents({ visibleOnly: true });

    // Jangan tampilkan section kalau tidak ada event
    if (isLoading || events.length === 0) return null;

    return (
        <section className="py-20 md:py-28 bg-muted/20 border-y overflow-hidden">
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
                                <Zap className="h-3.5 w-3.5 fill-primary" />
                                Live from Campus
                            </span>
                        </div>
                        <h2 className="font-headline text-4xl md:text-5xl font-bold leading-none tracking-tighter">
                            Kegiatan <span className="text-primary italic">Berlangsung</span>
                        </h2>
                        <p className="mt-3 text-muted-foreground max-w-xl text-sm md:text-base">
                            Update langsung kegiatan, kompetisi, dan perwakilan komunitas Codebusters di berbagai kampus.
                        </p>
                    </div>

                    {/* Live indicator */}
                    {events.some(e => e.status === 'Sedang Berlangsung') && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/5 w-fit"
                        >
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-semibold text-green-600">
                                {events.filter(e => e.status === 'Sedang Berlangsung').length} event berlangsung sekarang
                            </span>
                        </motion.div>
                    )}
                </motion.div>

                {/* Event Grid — responsif, tidak kaku */}
                <div className={`grid gap-6 ${
                    events.length === 1
                        ? 'grid-cols-1 max-w-lg'
                        : events.length === 2
                            ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl'
                            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}>
                    {events.map((event, index) => (
                        <EventCard key={event.id} event={event} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
