'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAchievements } from '@/hooks/useAchievements';
import { useStrictPageImages } from '@/hooks/useStrictPageImages';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import {
    ArrowRight,
    ChevronDown,
    Trophy,
    Search,
    Quote,
    Lock,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, useInView, useSpring, useTransform, AnimatePresence } from 'framer-motion';

const categories = ['Semua', 'Kompetisi', 'Proyek Industri', 'Riset'];
const years = ['Semua', 2025, 2024, 2023];

function AnimatedNumber({ value, suffix = '' }: { value: number, suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const spring = useSpring(0, { damping: 50, stiffness: 100 });
    const display = useTransform(spring, (current) => Math.round(current).toLocaleString() + suffix);

    useEffect(() => {
        if (isInView) spring.set(value);
    }, [isInView, value, spring]);

    return <motion.span ref={ref}>{display}</motion.span>;
}

const getLinkForAchievement = (achievement: any) => {
    if (achievement.portfolioSlug === 'hok-portfolio') return '/hok-portfolio';
    if (achievement.portfolioSlug === 'mlbb-portfolio') return '/mlbb-portfolio';
    if (achievement.portfolioSlug === 'sifonix-portfolio') return '/sifonix-portfolio';
    if (achievement.portfolioSlug === 'icsit-portfolio') return '/icsit-portfolio';
    if (achievement.title && achievement.title.toLowerCase().includes('honor of kings')) return '/hok-portfolio';
    if (achievement.title && achievement.title.toLowerCase().includes('hok')) return '/hok-portfolio';
    if (achievement.title && achievement.title.toLowerCase().includes('mlbb')) return '/mlbb-portfolio';
    if (achievement.portfolioSlug) return `/achievements/${achievement.portfolioSlug}`;
    if (achievement.caseStudyLink) return achievement.caseStudyLink;
    if (achievement.id === 'ui-ux-challenge-winner') return "/sifonix-portfolio";
    if (achievement.id === 'icsit-competition-winner' || (achievement.title && achievement.title.includes('ICSIT'))) return "/icsit-portfolio";
    if (achievement.id === 'mlbb-campus-winner-2025') return "/mlbb-portfolio";
    return `/achievements`;
};


function AchievementHero({ customLogo, customLogoIsCustom, customLogoIsLoading }: { customLogo?: string; customLogoIsCustom?: boolean; customLogoIsLoading?: boolean }) {
    const src = customLogo;
    
    if (customLogoIsLoading) {
        return (
            <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-background">
                <div className="container relative z-10">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-12">
                        <div className="max-w-4xl">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 mb-6"
                            >
                                <div className="h-0.5 w-12 bg-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Registry of Excellence</span>
                            </motion.div>
                            <h1 className="font-headline text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase mb-8">
                                Impact <br /> <span className="text-muted-foreground/20">Archive.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                                Arsip pencapaian, kemenangan kompetisi, serta kontribusi anggota yang mencerminkan keunggulan Codebusters
                            </p>
                        </div>
                        <div className="flex flex-col items-center md:items-center gap-8 w-full md:w-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="relative w-48 h-64 md:w-64 md:h-80"
                            >
                                <div className="w-full h-full bg-muted animate-pulse" />
                            </motion.div>
                            <div className="grid grid-cols-3 gap-8 md:gap-16 border-t pt-12 w-full md:w-auto">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Awards</p>
                                    <p className="text-4xl font-headline font-bold"><AnimatedNumber value={15} suffix="+" /></p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Members</p>
                                    <p className="text-4xl font-headline font-bold"><AnimatedNumber value={30} suffix="+" /></p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Chapters</p>
                                    <p className="text-4xl font-headline font-bold">02</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (!src || !customLogoIsCustom) return null;
    
    return (
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-background">
            <div className="container relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between gap-12">
                    <div className="max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 mb-6"
                        >
                            <div className="h-0.5 w-12 bg-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Registry of Excellence</span>
                        </motion.div>
                        <h1 className="font-headline text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase mb-8">
                            Impact <br /> <span className="text-muted-foreground/20">Archive.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                            Arsip pencapaian, kemenangan kompetisi, serta kontribusi anggota yang mencerminkan keunggulan Codebusters
                        </p>
                    </div>
                    <div className="flex flex-col items-center md:items-center gap-8 w-full md:w-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="relative w-48 h-64 md:w-64 md:h-80"
                        >
                            <img
                                src={src}
                                alt="Official Registry Emblem"
                                className="w-full h-full object-contain"
                            />
                        </motion.div>
                        <div className="grid grid-cols-3 gap-8 md:gap-16 border-t pt-12 w-full md:w-auto">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Awards</p>
                                <p className="text-4xl font-headline font-bold"><AnimatedNumber value={15} suffix="+" /></p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Members</p>
                                <p className="text-4xl font-headline font-bold"><AnimatedNumber value={30} suffix="+" /></p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Chapters</p>
                                <p className="text-4xl font-headline font-bold">02</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FeaturedShowcase({ achievements }: { achievements: any[] }) {
    const featured = achievements.find(a => a.isHallOfFame) || achievements.find(a => a.id === 'icsit-competition-winner') || achievements[0];

    if (!featured) return null;

    let displayImageUrl = featured.thumbnailUrl;
    if (!displayImageUrl && featured.thumbnailId) {
        const p = PlaceHolderImages.find(img => img.id === featured.thumbnailId);
        if (p) displayImageUrl = p.imageUrl;
    }

    let displayCuratorUrl = featured.curatorImageUrl;
    if (!displayCuratorUrl && featured.curatorImageId) {
        const p = PlaceHolderImages.find(img => img.id === featured.curatorImageId);
        if (p) displayCuratorUrl = p.imageUrl;
    }

    return (
        <section className="py-24 md:py-32 bg-background relative overflow-hidden border-y">
            <div className="container max-w-7xl">
                <div className="flex flex-col">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative w-full mb-16 group"
                    >
                        <div className="relative aspect-video md:aspect-[21/9] w-full overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] border-[10px] border-card bg-muted">
                            {displayImageUrl && (
                                <ImageWithSkeleton
                                    src={displayImageUrl}
                                    alt={featured.title}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
                                    priority
                                />
                            )}
                            <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

                            <div className="absolute bottom-6 right-6">
                                <div className="bg-background/90 backdrop-blur-md border-l-2 border-primary px-3 py-1.5 shadow-xl">
                                    <p className="text-[7px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Official Award</p>
                                    <p className="text-[10px] font-headline font-bold text-foreground">{featured.award}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid lg:grid-cols-12 gap-12 md:gap-20">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-7 space-y-8"
                        >
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2.5 bg-primary/5 border border-primary/20 px-3 py-1 rounded-full">
                                    <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Global Achievement Record</span>
                                </div>
                                <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tighter leading-[0.9] mb-6">
                                    {featured.title.split(' ').slice(0, -1).join(' ')} <br />
                                    <span className="text-primary italic">{featured.title.split(' ').slice(-1)}</span>
                                </h2>
                            </div>

                            <div className="space-y-6 relative">
                                <div className="absolute -left-6 top-0 bottom-0 w-0.5 bg-primary/10" />
                                <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-light italic max-w-2xl">
                                    "{featured.description}"
                                </p>

                                <div className="flex flex-wrap gap-10 pt-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Project Identity</p>
                                        <p className="text-base font-medium">{featured.team}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Chapter Office</p>
                                        <p className="text-base font-medium">Codebusters {featured.institution.split(' ').slice(-2).join(' ')}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="lg:col-span-5 flex flex-col justify-between"
                        >
                            {featured.curatorQuote && (
                                <div className="pt-10 lg:pt-0 lg:pl-12 border-t lg:border-t-0 lg:border-l border-dashed border-border/60">
                                    <div className="space-y-8">
                                        <Quote className="h-10 w-10 text-primary/10" />
                                        <div className="space-y-6">
                                            <p className="text-sm md:text-base font-serif italic text-muted-foreground leading-relaxed">
                                                "{featured.curatorQuote}"
                                            </p>
                                            <div className="flex items-center gap-5">
                                                {displayCuratorUrl && (
                                                    <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-primary/20 shrink-0 grayscale">
                                                        <ImageWithSkeleton src={displayCuratorUrl} alt="Curator" fill className="object-cover" />
                                                    </div>
                                                )}
                                                <div className="space-y-0.5">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-foreground">
                                                        {featured.curatorName}
                                                    </p>
                                                    <p className="text-[8px] font-bold text-primary uppercase tracking-widest">
                                                        {featured.curatorTitle}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-10 lg:pl-12">
                                <Button asChild className="group w-full text-[9px] font-black uppercase tracking-[0.3em] rounded-none px-8 py-6 h-auto shadow-xl transition-all hover:bg-foreground hover:text-background" variant="default">
                                    <Link href={getLinkForAchievement(featured)}>
                                        Open Case File <ArrowRight className="ml-2.5 h-3 w-3 transition-transform group-hover:translate-x-2" />
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function AchievementsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    // Use dynamic page images hook for all images including the logo
    const { images: dynamicImages, isLoading: isDynamicImagesLoading } = useStrictPageImages('global');
    const customLogoUrl = dynamicImages['impact-archive-logo']?.adminUrl || dynamicImages['impact-archive-logo']?.placeholderUrl;
    const customLogoIsCustom = dynamicImages['impact-archive-logo']?.isCustom;

    const { achievements, isLoading } = useAchievements({ activeOnly: true });
    const { achievements: hallOfFameAchievements, isLoading: isLoadingHOF } = useAchievements({ hallOfFameOnly: true });
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [activeYear, setActiveYear] = useState<string | number>('Semua');

    const awardsCount = useMemo(() => achievements.filter(a => a.category === 'Kompetisi').length, [achievements]);
    const projectsCount = useMemo(() => achievements.filter(a => a.category === 'Proyek Industri' || a.category === 'Karya Individu').length, [achievements]);
    const researchCount = useMemo(() => achievements.filter(a => a.type?.toLowerCase().includes('riset') || a.type?.toLowerCase().includes('paper')).length, [achievements]);

    const telkomLogo = PlaceHolderImages.find(p => p.id === 'telkom-university-logo-potrait');
    const mercuBuanaLogo = PlaceHolderImages.find(p => p.id === 'mercu-buana-logo-square');

    const filteredAchievements = useMemo(() => {
        return achievements.filter(achievement => {
            const categoryMatch = activeCategory === 'Semua' || achievement.category === activeCategory;
            const yearMatch = activeYear === 'Semua' || achievement.year === activeYear;
            return categoryMatch && yearMatch;
        });
    }, [achievements, activeCategory, activeYear]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    if (isLoading || isLoadingHOF || isUserLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground animate-pulse tracking-widest uppercase font-bold">Loading Archives...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="bg-background text-foreground antialiased pb-32">
                <AchievementHero customLogo={customLogoUrl} customLogoIsCustom={customLogoIsCustom} customLogoIsLoading={isDynamicImagesLoading} />
                <FeaturedShowcase achievements={hallOfFameAchievements} />

                <section className="py-32">
                    <div className="container">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-20 gap-8">
                            <div className="space-y-2">
                                <h2 className="text-4xl font-headline text-muted-foreground/20 font-black uppercase tracking-tighter">Achievement Gallery</h2>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.5em] font-black">Verified Community Records</p>
                            </div>
                        </div>

                        <div className="bg-muted/10 border border-dashed border-muted-foreground/20 rounded-lg p-12 text-center">
                            <Lock className="h-16 w-16 mx-auto mb-6 text-muted-foreground/40" />
                            <h3 className="text-2xl font-headline font-bold mb-4">Akses Terbatas</h3>
                            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                Untuk melihat semua pencapaian dan prestasi anggota Codebusters, silakan login terlebih dahulu.
                            </p>
                            <Button asChild size="lg">
                                <Link href="/login">Login untuk Melihat Semua</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground antialiased pb-32">
            <AchievementHero customLogo={customLogoUrl} customLogoIsCustom={customLogoIsCustom} customLogoIsLoading={isDynamicImagesLoading} />

            <FeaturedShowcase achievements={achievements} />

            <section className="py-32">
                <div className="container">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-20 gap-8">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-headline text-muted-foreground/20 font-black uppercase tracking-tighter">Achievement Gallery</h2>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.5em] font-black">Verified Community Records</p>
                        </div>

                        <div className="flex flex-wrap gap-4 items-center p-2 bg-muted/20 border rounded-none">
                            <div className="flex gap-1">
                                {categories.map(category => (
                                    <Button
                                        key={category}
                                        size="sm"
                                        variant={activeCategory === category ? 'default' : 'ghost'}
                                        onClick={() => setActiveCategory(category)}
                                        className="text-[10px] uppercase tracking-widest font-bold h-9 rounded-none"
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>
                            <div className="w-px h-6 bg-border mx-2 hidden sm:block"></div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest h-9 px-4 rounded-none">
                                        Year: {activeYear} <ChevronDown className="ml-2 h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-32 rounded-none" align="end">
                                    {years.map(year => (<DropdownMenuItem key={year} onSelect={() => setActiveYear(year)} className="text-[10px] font-bold uppercase">{year}</DropdownMenuItem>))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <AnimatePresence mode='popLayout'>
                            {filteredAchievements.map((achievement) => {
                                // Resolve Image: Prioritize URL from DB, then look up via ID
                                let displayImageUrl = achievement.thumbnailUrl;
                                if (!displayImageUrl && achievement.thumbnailId) {
                                    const p = PlaceHolderImages.find(img => img.id === achievement.thumbnailId);
                                    if (p) displayImageUrl = p.imageUrl;
                                }

                                const isTelkom = achievement.institution.toLowerCase().includes('telkom');

                                return (
                                    <motion.div
                                        key={achievement.id}
                                        layout
                                        variants={{
                                            hidden: { opacity: 0, scale: 0.95, y: 20 },
                                            visible: { opacity: 1, scale: 1, y: 0 }
                                        }}
                                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                        whileHover={{ y: -10 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                    >
                                        <Link href={getLinkForAchievement(achievement)} className="block h-full group">
                                            <Card className="h-full flex flex-col overflow-hidden rounded-none border-2 border-border bg-card hover:border-foreground/20 transition-all duration-500 shadow-sm hover:shadow-2xl">
                                                <div className="relative aspect-video w-full overflow-hidden border-b-2 bg-muted/10">
                                                    {displayImageUrl && (
                                                        <ImageWithSkeleton
                                                            src={displayImageUrl}
                                                            alt={achievement.title}
                                                            fill
                                                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                                        />
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                    <div className="absolute top-4 right-4">
                                                        <Badge className="bg-primary/90 backdrop-blur-md hover:bg-primary text-white border-none font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-none">
                                                            {achievement.year}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <CardContent className="p-8 flex-grow flex flex-col">
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">
                                                        {achievement.award}
                                                    </p>
                                                    <h3 className="font-headline text-2xl font-bold text-foreground leading-tight mb-4 uppercase tracking-tighter">
                                                        {achievement.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 font-light">
                                                        {achievement.description}
                                                    </p>
                                                </CardContent>

                                                <CardFooter className="px-8 py-6 border-t-2 border-border/50 flex items-center justify-between bg-muted/5 group-hover:bg-background transition-colors duration-500">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-8 w-8 flex items-center justify-center shrink-0">
                                                            {isTelkom ? (
                                                                <> {telkomLogo && <ImageWithSkeleton src={telkomLogo.imageUrl} alt="TU" width={32} height={32} className="h-10 object-contain grayscale group-hover:grayscale-0 transition-all" />} </>
                                                            ) : (
                                                                <> {mercuBuanaLogo && <ImageWithSkeleton src={mercuBuanaLogo.imageUrl} alt="UMB" width={32} height={32} className="h-10 object-contain grayscale group-hover:grayscale-0 transition-all" />} </>
                                                            )}
                                                        </div>

                                                        <div className="w-px h-6 bg-border/80" />

                                                        <div className="flex flex-col">
                                                            <p className="text-base text-foreground/80 font-normal leading-tight">{achievement.team}</p>
                                                            <p className="text-[11px] text-muted-foreground leading-none font-normal uppercase tracking-widest mt-1.5">Codebusters {isTelkom ? 'Telkom' : 'Mercu Buana'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-muted-foreground/30 transform group-hover:translate-x-1 group-hover:text-primary transition-all duration-500">
                                                        <ArrowRight className="h-5 w-5" />
                                                    </div>
                                                </CardFooter>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>

                    {filteredAchievements.length === 0 && (
                        <div className="text-center py-32 border-2 border-dashed rounded-none bg-muted/10">
                            <Search className="h-12 w-12 text-muted-foreground/20 mx-auto mb-6" />
                            <p className="text-muted-foreground font-bold uppercase tracking-[0.4em] text-[10px]">No records match criteria.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
