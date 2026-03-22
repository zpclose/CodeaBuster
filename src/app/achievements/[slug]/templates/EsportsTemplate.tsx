'use client';

import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Award, Target, Zap, Activity, BarChart3, Quote, ChevronLeft, Search, Binary, FileCheck, ShieldCheck, FileText, Fingerprint, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Achievement } from '@/types/content';

interface Props {
    achievement: Achievement;
}

interface EsportsTeamMember {
    id: string;
    name: string;
    role: string;
    specialization: string;
    description: string;
    operationalImpact: string;
}

export default function EsportsTemplate({ achievement }: Props) {
    const { portfolioContent: pc = {} } = achievement;
    const { title, award, team, institution, year, description, type, thumbnailUrl } = achievement;

    const mercuBuanaLogo = PlaceHolderImages.find(p => p.id === 'mercu-buana-logo-square');

    const teamMembers: EsportsTeamMember[] = pc.teamMembers?.map((m, i) => ({
        id: String(i + 1).padStart(2, '0'),
        name: m.name || 'Team Member',
        role: m.role || 'Player',
        specialization: m.specialization || 'Tactical Excellence',
        description: m.description || 'Contributing to team success through dedication and skill.',
        operationalImpact: m.operationalImpact || 'Key contributor to team performance and victories.'
    })) || [
        { id: '01', name: 'Player One', role: 'Team Captain', specialization: 'Strategic Leadership', description: 'Leading the team to victory through tactical decisions.', operationalImpact: 'Overall team coordination and strategy.' },
        { id: '02', name: 'Player Two', role: 'Core Player', specialization: 'Main Role', description: 'Primary contributor in competitive matches.', operationalImpact: 'Key performance in crucial moments.' },
        { id: '03', name: 'Player Three', role: 'Support', specialization: 'Team Support', description: 'Ensuring team sustainability and backup.', operationalImpact: 'Maintaining team balance and flexibility.' },
        { id: '04', name: 'Player Four', role: 'Flex Player', specialization: 'Versatile Play', description: 'Adaptable player for multiple positions.', operationalImpact: 'Strategic substitution and adaptation.' },
        { id: '05', name: 'Player Five', role: 'Analyst', specialization: 'Game Analysis', description: 'Analyzing opponents and strategies.', operationalImpact: 'Data-driven strategic planning.' },
    ];

    const performanceMetrics = [
        { label: 'Cumulative Win Rate', value: pc.highlights?.[0]?.value || '75%', icon: BarChart3 },
        { label: 'Avg. Gold Lead @10m', value: pc.highlights?.[1]?.value || '+2.0k', icon: Activity },
        { label: 'Major Objective Control', value: pc.highlights?.[2]?.value || '85%', icon: Target },
        { label: 'Peak Win Streak', value: pc.highlights?.[3]?.value || '5 Games', icon: Zap },
    ];

    const strategicPhases = pc.strategicPhases?.length ? pc.strategicPhases : [
        { title: 'Phase I: Early Capitalization', focus: 'Resource Acquisition', protocol: 'Fokus utama pada pengamanan sumber daya dan minimalisasi kesalahan posisi.', metrics: 'Target: Selisih emas minimal 1.5k sebelum menit ke-5.' },
        { title: 'Phase II: Systemic Consolidation', focus: 'Map Control', protocol: 'Pengambilan kendali atas area strategis melalui penghancuran struktur pertahanan.', metrics: 'Target: Penguasaan 70% area peta pada menit ke-12.' },
        { title: 'Phase III: Strategic Resolution', focus: 'Final Execution', protocol: 'Eksekusi akhir melibatkan koordinasi kolektif dalam perebutan objektif besar.', metrics: 'Target: Penyelesaian skenario kemenangan di bawah menit ke-20.' },
    ];

    const readinessAudit = pc.readinessAudit?.length ? pc.readinessAudit : [
        { id: 'MET-01', title: 'Meta Environmental Scanning', detail: 'Analisis mingguan terhadap perubahan statistik untuk menyesuaikan komposisi tim.' },
        { id: 'SIM-02', title: 'Strategic Scrimmage Simulation', detail: 'Simulasi pertandingan melawan tim dengan berbagai gaya permainan.' },
        { id: 'AUD-03', title: 'Performance Review Audit', detail: 'Setiap hasil pertandingan diproses melalui tinjauan rekaman digital.' },
    ];

    const heroImageUrl = pc.heroImageUrl || thumbnailUrl;
    const certificateImageUrl = pc.certificateImageUrl;
    const gameTitle = type?.toUpperCase() || 'ESPORTS';
    const teamName = team || 'Team';

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white pb-32 overflow-x-hidden font-body">

            {/* BACK BUTTON */}
            <div className="absolute top-6 left-6 z-50">
                <Button variant="ghost" size="sm" asChild className="text-foreground/70 hover:text-foreground hover:bg-primary/10 rounded-full">
                    <Link href="/achievements"><ChevronLeft className="h-4 w-4 mr-1" /> Back</Link>
                </Button>
            </div>

            {/* 1. ARCHITECTURAL HERO SECTION */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden border-b-2 bg-muted/5">
                <div className="container relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="max-w-6xl mx-auto text-center"
                    >
                        <div className="inline-flex items-center gap-3 mb-10 bg-primary/10 border-2 border-primary/30 px-6 py-2 rounded-full">
                            <Award className="h-5 w-5 text-primary" />
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Official Record</span>
                        </div>

                        <h1 className="font-headline text-7xl md:text-[14rem] font-black tracking-tighter leading-[0.75] mb-12">
                            {teamName.split(' ')[0]} <span className="text-primary italic">{gameTitle}</span>
                        </h1>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-y-6 md:gap-x-12 text-xs md:text-sm font-bold uppercase tracking-[0.2em] border-t-2 border-b-2 border-border/60 py-10 md:py-12 mt-16 max-w-6xl mx-auto px-4">
                            <div className="text-foreground whitespace-nowrap">{title}</div>
                            <div className="hidden md:block w-0.5 h-10 bg-border/60" />
                            <div className="text-foreground whitespace-nowrap">{award}</div>
                            <div className="hidden md:block w-0.5 h-10 bg-border/60" />
                            <div className="text-foreground whitespace-nowrap">{year}</div>
                        </div>
                    </motion.div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-black text-muted/5 -z-0 pointer-events-none select-none">
                    ELITE
                </div>
            </section>

            {/* 2. THE MONUMENT OF VICTORY */}
            <section className="py-24 md:py-32 bg-background border-b-2 overflow-hidden">
                <div className="container max-w-7xl">
                    <div className="grid lg:grid-cols-12 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="lg:col-span-5 space-y-8"
                        >
                            <div className="space-y-4">
                                <Badge variant="outline" className="text-primary border-primary/30 uppercase tracking-widest px-4 py-1">The Achievement</Badge>
                                <h2 className="text-5xl font-headline font-bold leading-tight uppercase tracking-tighter">
                                    Journey <br/> <span className="text-primary italic">To </span> Victory.
                                </h2>
                            </div>

                            <div className="space-y-6 relative group">
                                <Quote className="absolute -top-6 -left-6 h-12 w-12 text-primary/10 -z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
                                <blockquote className="text-lg md:text-xl text-muted-foreground leading-relaxed italic border-l-4 border-primary pl-6 py-2">
                                    &quot;{pc.curatorQuote || 'Hasil ini merupakan buah dari proses yang konsisten dan kerja sama tim. Setiap pertandingan selalu dengan persiapan yang matang, komunikasi terbuka, serta evaluasi berkelanjutan.'}&quot;
                                </blockquote>
                                <div className="flex items-center gap-4 pl-10">
                                    <div className="h-0.5 w-10 bg-primary/40" />
                                    <div>
                                        <p className="text-xs font-black tracking-[0.3em] uppercase text-foreground">{pc.curatorName || teamMembers[0]?.name}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{pc.curatorTitle || 'Tactical Strategic Lead'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-10 border-t-2">
                                {performanceMetrics.map((metric, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                                            <metric.icon className="h-3 w-3 text-primary" />
                                            {metric.label}
                                        </p>
                                        <p className="text-3xl font-headline font-bold">{metric.value}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="lg:col-span-7 relative"
                        >
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-[6px] border-card group">
                                {heroImageUrl && (
                                    <ImageWithSkeleton
                                        src={heroImageUrl}
                                        alt={title}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                                    <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-lg shadow-lg border-l-4 border-primary">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Certified Record</p>
                                        <p className="text-sm font-bold text-foreground">{award}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 3. OFFICIAL ACHIEVEMENT CERTIFICATION (Optional - Show if certificate provided) */}
            {certificateImageUrl && (
                <section className="py-24 md:py-40 bg-muted/10 border-b-2 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '40px 40px, 200px 200px, 200px 200px' }} />

                    <div className="container max-w-7xl relative z-10">
                        <div className="grid lg:grid-cols-12 gap-20 items-center">
                            <motion.div
                                initial={{ opacity: 0, y: 60 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                className="lg:col-span-7"
                            >
                                <div className="relative group">
                                    <div className="absolute -inset-10 bg-primary/5 rounded-[3rem] blur-3xl group-hover:bg-primary/10 transition-all duration-700 -z-10" />
                                    <div className="absolute inset-4 translate-x-4 translate-y-4 border-[3px] border-primary/10 rounded-2xl -z-10" />

                                    <Card className="overflow-hidden border-[4px] border-white shadow-[0_40px_100px_-15px_rgba(0,0,0,0.2)] relative bg-white rounded-2xl transition-transform duration-500 group-hover:scale-[1.01]">
                                        <div className="absolute top-8 left-8 z-20 flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-white/50 text-foreground px-5 py-2 rounded-xl shadow-xl">
                                            <div className="relative">
                                                <ShieldCheck className="h-5 w-5 text-green-600" />
                                                <div className="absolute inset-0 bg-green-500/20 blur-md animate-pulse" />
                                            </div>
                                        </div>

                                        {mercuBuanaLogo && (
                                            <motion.div
                                                className="absolute bottom-8 right-8 z-30 flex items-center justify-center p-3 bg-white/60 backdrop-blur-md border border-white/50 rounded-xl shadow-lg transition-all duration-500 group-hover:bg-white/80"
                                            >
                                                <div className="relative h-10 w-10 opacity-90">
                                                    <ImageWithSkeleton src={mercuBuanaLogo.imageUrl} alt="UMB Seal" fill className="object-contain grayscale group-hover:grayscale-0 transition-all" />
                                                </div>
                                                <div className="ml-3 text-left">
                                                    <p className="text-[7px] font-black uppercase tracking-widest text-muted-foreground leading-tight">Institutional<br/>Security Seal</p>
                                                    <p className="text-[9px] font-bold text-foreground">UMB-CBM</p>
                                                </div>
                                            </motion.div>
                                        )}

                                        <CardContent className="p-0 relative z-10 bg-muted/5">
                                            <div className="relative aspect-[1.414/1] w-full flex items-center justify-center group-hover:bg-transparent transition-colors duration-700">
                                                <div className="relative w-[90%] h-[90%] overflow-hidden rounded-lg shadow-inner">
                                                    <ImageWithSkeleton
                                                        src={certificateImageUrl}
                                                        alt="Official Certificate"
                                                        fill
                                                        className="object-contain p-2 md:p-4 transition-transform duration-1000 group-hover:scale-[1.03]"
                                                    />
                                                </div>
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.02] rotate-[-15deg]">
                                                    <p className="text-8xl font-black uppercase tracking-[0.5em] leading-none">ARCHIVE<br/>CERTIFIED<br/>ENCRYPTED</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="lg:col-span-5 space-y-12"
                            >
                                <div className="space-y-6">
                                    <Badge variant="outline" className="text-primary border-primary/40 bg-primary/5 uppercase tracking-[0.4em] px-5 py-2 font-black text-[10px]">CERTIFICATION</Badge>
                                    <h3 className="text-6xl font-headline font-bold uppercase tracking-tighter leading-[0.85]">
                                        OFFICIAL <br/> ACHIEVEMENT <br/> <span className="text-primary italic underline underline-offset-8">RECORD</span>.
                                    </h3>
                                </div>

                                <div className="space-y-8">
                                    <div className="grid gap-6">
                                        <div className="flex gap-6 items-center p-5 rounded-2xl bg-white border shadow-sm group hover:border-primary/30 transition-colors">
                                            <div className="h-12 w-12 shrink-0 bg-muted/50 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                                <Binary className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Document Index</p>
                                                <p className="text-sm font-mono font-bold tracking-tight">ID: CERT-{gameTitle}-2025-{Math.floor(Math.random() * 900) + 100}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-6 items-center p-5 rounded-2xl bg-white border shadow-sm group hover:border-primary/30 transition-colors">
                                            <div className="h-12 w-12 shrink-0 bg-muted/50 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">ISSUING AUTHORITY</p>
                                                <p className="text-[14px] font-mono font-bold tracking-tight opacity-60 break-all">{title}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-6 items-center p-5 rounded-2xl bg-white border shadow-sm group hover:border-primary/30 transition-colors">
                                            <div className="h-12 w-12 shrink-0 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-500">
                                                <Fingerprint className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Verification Status</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                                    <p className="text-[11px] font-black uppercase text-green-600 tracking-widest">Authenticity Confirmed ⏺ {year}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-card border-l-4 border-primary rounded-r-2xl shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-[0.05]">
                                            <Lock className="h-12 w-12" />
                                        </div>
                                        <p className="italic text-muted-foreground text-sm leading-relaxed relative z-10">
                                            &quot;Penghargaan ini merupakan dokumentasi formal dalam kompetisi serta pengakuan atas pencapaian performa di tingkat institusi.&quot;
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            )}

            {/* 4. SYSTEMIC PHASE AUDIT */}
            <section className="py-24 md:py-32 bg-muted/5 border-b-2">
                <div className="container max-w-6xl">
                    <div className="text-center mb-20">
                        <h3 className="text-3xl font-headline font-bold uppercase tracking-tighter mb-4">Strategic Execution Phases</h3>
                        <p className="text-muted-foreground max-w-2xl mx-auto">Dokumentasi protokol operasional yang diterapkan secara sistematis dalam setiap fase pertandingan resmi guna memastikan efisiensi sumber daya.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {strategicPhases.map((phase, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.2 }}
                                viewport={{ once: true }}
                            >
                                <Card className="h-full border-none shadow-sm bg-card hover:bg-white transition-all duration-300">
                                    <CardContent className="p-8 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{phase.focus}</span>
                                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-black">0{idx+1}</div>
                                        </div>
                                        <h4 className="text-xl font-bold font-headline uppercase">{phase.title}</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed italic">&quot;{phase.protocol}&quot;</p>
                                        <div className="pt-4 border-t border-dashed">
                                            <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Audit Criteria</p>
                                            <p className="text-xs font-semibold">{phase.metrics}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. DESIGNATED ROSTER */}
            <section className="py-32 bg-background">
                <div className="container max-w-6xl">
                    <div className="flex items-center gap-6 mb-24">
                        <div className="h-px flex-1 bg-border" />
                        <h2 className="text-[11px] font-black uppercase tracking-[0.6em] text-muted-foreground">Designated Roster</h2>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    <div className="grid grid-cols-1 gap-12">
                        {teamMembers.map((member, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                                className="relative group"
                            >
                                <Card className="overflow-hidden border-none shadow-none bg-transparent">
                                    <CardContent className="p-0">
                                        <div className="grid lg:grid-cols-12 gap-12 items-center">
                                            <div className="absolute -left-10 top-0 text-[12rem] font-black text-muted/10 -z-0 select-none leading-none group-hover:text-primary/5 transition-colors duration-700">
                                                {member.id}
                                            </div>

                                            <div className="lg:col-span-4 relative z-10 space-y-4">
                                                <h4 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter uppercase leading-[0.8]">
                                                    {member.name.split(' ')[0]} <br/>
                                                    <span className="text-primary italic">{member.name.split(' ').slice(1).join(' ')}</span>
                                                </h4>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Designated Role</p>
                                                    <p className="text-sm font-bold text-foreground">{member.role}</p>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-5 relative z-10">
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Technical Specialization</p>
                                                        <p className="text-base font-bold italic tracking-tight">&quot;{member.specialization}&quot;</p>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-6 py-2">
                                                        {member.description}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-3 relative z-10 flex flex-col gap-4 items-end">
                                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">Operational Impact</p>
                                                <div className="text-right">
                                                    <p className="text-xs font-semibold text-foreground italic leading-relaxed">
                                                        {member.operationalImpact}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                {idx < teamMembers.length - 1 && <div className="mt-12 h-px w-full bg-border/30" />}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. PERFORMANCE READINESS AUDIT */}
            <section className="py-24 md:py-32 bg-muted/5 border-t-2 border-b-2">
                <div className="container max-w-6xl">
                    <div className="grid lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-4 space-y-6">
                            <Badge variant="outline" className="text-primary border-primary/30 uppercase tracking-widest">Performance Audit</Badge>
                            <h3 className="text-3xl font-headline font-bold uppercase tracking-tighter">Systemic Readiness <span className="text-primary italic">Audit</span>.</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{pc.performanceAuditDescription || 'Serangkaian protokol persiapan yang diterapkan guna memastikan konsistensi performa seluruh anggota dalam setiap siklus kompetisi resmi dengan mengacu pada pembaruan meta permainan.'}</p>
                        </div>
                        <div className="lg:col-span-8 grid md:grid-cols-3 gap-6">
                            {readinessAudit.map((protocol, idx) => (
                                <Card key={idx} className="border-none bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                {idx === 0 && <Search className="h-5 w-5 text-primary" />}
                                                {idx === 1 && <Binary className="h-5 w-5 text-primary" />}
                                                {idx === 2 && <FileCheck className="h-5 w-5 text-primary" />}
                                            </div>
                                            <span className="text-[9px] font-mono text-muted-foreground">{protocol.id}</span>
                                        </div>
                                        <h5 className="font-bold text-xs uppercase tracking-wider">{protocol.title}</h5>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">{protocol.detail}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. FINAL NARRATIVE */}
            <section className="py-40 border-t-2 bg-muted/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 transform translate-x-1/2" />
                <div className="container max-w-4xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center space-y-12"
                    >
                        <div className="relative inline-block">
                            <div className="relative h-16 w-16 mx-auto opacity-20 animate-pulse">
                                <ImageWithSkeleton
                                    src="https://firebasestorage.googleapis.com/v0/b/studio-8681629558-68f05.firebasestorage.app/o/Komponen%2Fthropy_cup_winner_medal_sport_icon_228609.png?alt=media&token=3f78eece-0a46-4d5a-8392-5a2d9c3c7b77"
                                    alt="Trophy"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                        </div>

                        <blockquote className="text-4xl md:text-5xl font-headline font-bold leading-[0.9] tracking-tighter italic">
                            &quot;{pc.closingQuote || description || `${award} bukan akhir, tapi langkah awal untuk terus berkembang dan siap menghadapi tantangan berikutnya dengan semangat yang lebih besar.`}&quot;
                        </blockquote>

                        <div className="pt-12 space-y-6">
                            <div className="h-1 w-20 bg-primary mx-auto" />
                            <div className="space-y-2">
                                <p className="font-black uppercase tracking-[0.5em] text-sm text-muted-foreground">Closing Narrative</p>
                                <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
                                    Tim {teamName} dibentuk pada tahun {year} di {institution} {pc.closingNarrative || 'sebagai representasi keunggulan taktis dan disiplin dalam ekosistem kompetitif. Melalui dedikasi dan sinkronisasi yang tinggi, kami terus berkomitmen untuk mengharumkan nama institusi di kancah' + ' ' + gameTitle + '.'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
