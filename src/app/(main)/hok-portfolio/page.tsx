'use client';

import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Award, Target, Zap, Activity, BarChart3, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const teamMembers = [
    {
        id: '01',
        name: 'Ryan Andreas Wijaya',
        role: 'Team Captain & Roamer',
        specialization: 'Tactical Shotcalling & Map Vision',
        description: 'Bertanggung jawab atas koordinasi mikro dan makro di medan tempur serta inisiasi pertempuran strategis.',
        operationalImpact: 'Memastikan efisiensi rotasi dan penguasaan visi peta secara maksimal.'
    },
    {
        id: '02',
        name: 'Ahmad Fahamal',
        role: 'Clash Lane',
        specialization: 'Frontline Stability & Zoning',
        description: 'Unit pertahanan utama yang bertugas membuka ruang bagi penyerang dan mengganggu formasi lawan.',
        operationalImpact: 'Menyerap kerusakan maksimal lawan dalam teamfight untuk mengamankan carry tim.'
    },
    {
        id: '03',
        name: 'Ihsan Putra Wijaya',
        role: 'Jungler',
        specialization: 'Objective Execution & Burst Damage',
        description: 'Fokus pada penguasaan objektif besar (Dragon/Lord) dan rotasi hutan yang efisien.',
        operationalImpact: 'Menjamin ketersediaan buff dan kendali penuh atas ritme ekonomi tim.'
    },
    {
        id: '04',
        name: 'Yuan Pratama Putra',
        role: 'Marksman',
        specialization: 'Late-game Hypercarry',
        description: 'Penyedia output kerusakan terbesar dalam fase krusial pertandingan melalui penempatan posisi yang presisi.',
        operationalImpact: 'Mengamankan kemenangan melalui penetrasi basis lawan di fase akhir.'
    },
    {
        id: '05',
        name: 'Heru Saputro',
        role: 'Midlane',
        specialization: 'Rotation Support & CC Control',
        description: 'Penghubung utama seluruh jalur dengan kemampuan kontrol area tinggi dan pembersihan minion cepat.',
        operationalImpact: 'Membatasi pergerakan lawan di area jalur tengah dan memberikan bantuan instan ke sidelane.'
    },
];

const performanceMetrics = [
    { label: 'Cumulative Win Rate', value: '78%', icon: BarChart3 },
    { label: 'Avg. Gold Lead @10m', value: '+2.4k', icon: Activity },
    { label: 'Major Objective Control', icon: Target, value: '90%' },
    { label: 'Peak Win Streak', icon: Zap, value: '5 Games' },
];

export default function HokPortfolioPage() {
    const unifiedVisual = "https://firebasestorage.googleapis.com/v0/b/studio-8681629558-68f05.firebasestorage.app/o/HOK%20Achievement%2F321.jpeg?alt=media&token=1bffa2e0-0ef2-45d4-840a-20c609e267a9";

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white pb-32 overflow-x-hidden font-body">

            {/* 1. HERO SECTION */}
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
                            SKYWAY <span className="text-primary italic">HOK</span>
                        </h1>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-y-6 md:gap-x-12 text-xs md:text-sm font-bold uppercase tracking-[0.2em] border-t-2 border-b-2 border-border/60 py-10 md:py-12 mt-16 max-w-6xl mx-auto px-4">
                            <div className="text-foreground whitespace-nowrap">KCS Honor of Kings 2025</div>
                            <div className="hidden md:block w-0.5 h-10 bg-border/60" />
                            <div className="text-foreground whitespace-nowrap">Runner Up </div>
                            <div className="hidden md:block w-0.5 h-10 bg-border/60" />
                            <div className="text-foreground whitespace-nowrap">Class of Innovation</div>
                        </div>
                    </motion.div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-black text-muted/5 -z-0 pointer-events-none select-none">
                    HOK
                </div>
            </section>

            {/* 2. STRATEGY ARCHIVE */}
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
                                <Badge variant="outline" className="text-primary border-primary/30 uppercase tracking-widest px-4 py-1">Tactical Analysis</Badge>
                                <h2 className="text-5xl font-headline font-bold leading-tight uppercase tracking-tighter">
                                    <span className="text-primary italic">Strategy </span> Archive.
                                </h2>
                            </div>

                            <div className="space-y-6 relative group">
                                <Quote className="absolute -top-6 -left-6 h-12 w-12 text-primary/10 -z-10" />
                                <blockquote className="text-lg md:text-xl text-muted-foreground leading-relaxed italic border-l-4 border-primary pl-6 py-2">
                                    &quot;Keunggulan kami bukan hanya pada refleks mekanik, tetapi pada kemampuan membaca pergerakan lawan tiga langkah ke depan.&quot;
                                </blockquote>
                                <div className="flex items-center gap-4 pl-10">
                                    <div className="h-0.5 w-10 bg-primary/40" />
                                    <div>
                                        <p className="text-xs font-black tracking-[0.3em] uppercase text-foreground">Ryan Andreas Wijaya</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Team Captain</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="lg:col-span-7 relative"
                        >
                            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-[6px] border-card group">
<ImageWithSkeleton 
                                    src={unifiedVisual}
                                    alt="HOK Victory Moment"
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 3. ROSTER REGISTRY */}
            <section className="py-32 bg-background border-b-2">
                <div className="container max-w-6xl">
                    <div className="flex items-center gap-6 mb-24">
                        <div className="h-px flex-1 bg-border" />
                        <h2 className="text-[11px] font-black uppercase tracking-[0.6em] text-muted-foreground">Elite Roster</h2>
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
                                <div className="grid lg:grid-cols-12 gap-12 items-center">
                                    <div className="absolute -left-10 top-0 text-[12rem] font-black text-muted/10 -z-0 select-none leading-none group-hover:text-primary/5 transition-colors duration-700">
                                        {member.id}
                                    </div>

                                    <div className="lg:col-span-4 relative z-10 space-y-4">
                                        <h4 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter uppercase leading-[0.8]">
                                            {member.name.split(' ')[0]} <br />
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
                                {idx < teamMembers.length - 1 && <div className="mt-12 h-px w-full bg-border/30" />}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. CLOSING NARRATIVE */}
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
                            &quot;Juara 2 bukan akhir, tapi langkah awal untuk terus berkembang dan siap menghadapi tantangan berikutnya dengan semangat yang lebih besar.&quot;
                        </blockquote>

                        <div className="pt-12 space-y-6">
                            <div className="h-1 w-20 bg-primary mx-auto" />
                            <div className="space-y-2">
                                <p className="font-black uppercase tracking-[0.5em] text-sm text-muted-foreground">Closing Narrative</p>
                                <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
                                    Tim Skyway dibentuk pada tahun 2025 di Universitas Mercu Buana sebagai representasi keunggulan taktis dan disiplin dalam ekosistem Honor of Kings. Melalui dedikasi dan sinkronisasi yang tinggi, kami terus berkomitmen untuk mengharumkan nama institusi di kancah kompetitif.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
