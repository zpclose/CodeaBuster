'use client';

import Image from 'next/image';
import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import { StrictImage } from '@/components/ui/strict-image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Users, FolderKanban, BrainCircuit, Linkedin, Github, Users2, Handshake, Briefcase, Star, TrendingUp, Code, GitBranch, CheckCircle, GitMerge, MessageSquare, HelpCircle, Lightbulb, GraduationCap, Wrench, Zap, Link as LinkIcon, HardHat, BarChart, Wifi, Activity, Trophy, ArrowRight, Calendar, MapPin, Clock, Award, Target } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { motion, useInView, useSpring, useTransform, useScroll } from 'framer-motion';
import React, { useEffect, useRef } from 'react';
import Autoplay from "embla-carousel-autoplay";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/firebase';

// T_PP Dynamic hooks
import { useTickerItems } from '@/hooks/useTickerItems';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useAchievements } from '@/hooks/useAchievements';
import { useDynamicPageImages } from '@/hooks/useDynamicPageImages';

const features = [
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Komunitas Kolaboratif',
    description: 'Terhubung dengan mahasiswa berbakat dari Telkom University dan Universitas Mercu Buana.',
    link: '/members',
  },
  {
    icon: <GraduationCap className="h-8 w-8 text-primary" />,
    title: 'Program & Acara',
    description: 'Ikuti workshop, webinar, dan hackathon untuk meningkatkan skill dan portofolio Anda.',
    link: '/programs',
  },
  {
    icon: <FolderKanban className="h-8 w-8 text-primary" />,
    title: 'Proyek Inovatif',
    description: 'Berkolaborasi dalam proyek-proyek nyata yang memecahkan masalah dan membangun masa depan.',
    link: '/projects',
  },
];

// Static fallback ticker texts
const fallbackTickerTexts = [
  "Maya S. Mengirim Pull Request → Proyek Fintech Protocol. (+12 PRs Last Hour)",
  "Mentor Risa K. Selesai code review → Proyek UI/UX Accessibility.",
  "Tim Alpha Meminta bantuan → Komponen Database Scalability.",
  "Kevin L. Mengirim ide solusi → Diskusi Global Trading Platform.",
  "Sifonix v2.0 Telah di-merge ke Main Branch.",
  "Tim S.NGR Memenangkan International Award di ICSIT 2025.",
];

const stats = [
  { label: 'Proyek Selesai', value: 25, icon: FolderKanban, suffix: '+' },
  { label: 'Anggota Aktif', value: 30, icon: Users, suffix: '+' },
  { label: 'Penghargaan', value: 8, icon: Trophy, suffix: '+' },
  { label: 'Mitra Industri', value: 8, icon: Handshake, suffix: '+' },
];

function AnimatedNumber({ value, prefix = '', suffix = '', isInt = true }: { value: number, prefix?: string, suffix?: string, isInt?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const spring = useSpring(0, {
    damping: 100,
    stiffness: 100,
    mass: 5
  });

  const display = useTransform(spring, (current) => {
    const formatted = isInt ? Math.round(current).toLocaleString() : current.toFixed(1);
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

function ChairpersonCollage({ mainImageSlot, secondaryImageSlot }: { mainImageSlot?: string, secondaryImageSlot?: string }) {
  const collageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: collageRef,
    offset: ['start end', 'end start']
  });

  const imageOneY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
  const imageTwoY = useTransform(scrollYProgress, [0, 1], ['5%', '-15%']);

  return (
    <div ref={collageRef} className="relative h-[450px] min-h-[450px]">
      <div className="absolute inset-0 bg-dots-pattern opacity-10" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground)/.2) 1px, transparent 1px)', backgroundSize: '10px 10px' }} />

      {secondaryImageSlot && (
        <motion.div
          className="absolute bottom-0 left-0 h-2/3 w-3/5 rounded-2xl overflow-hidden shadow-lg z-10"
          style={{ y: imageTwoY }}
          initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
          whileInView={{ opacity: 1, scale: 1, rotate: -8 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        >
          <StrictImage 
            slotId={secondaryImageSlot} 
            pageCategory="home" 
            alt="Mentorship session" 
            fill 
            className="object-cover" 
          />
        </motion.div>
      )}

      {mainImageSlot && (
        <motion.div
          className="absolute top-0 right-0 h-4/5 w-7/12 rounded-2xl overflow-hidden shadow-2xl border-4 border-card z-20"
          style={{ y: imageOneY }}
          initial={{ opacity: 0, scale: 0.9, rotate: 3 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 5 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.1 }}
        >
          <StrictImage 
            slotId={mainImageSlot} 
            pageCategory="home" 
            alt="Chairperson" 
            fill 
            className="object-cover" 
          />
        </motion.div>
      )}
    </div>
  );
}

export default function Home() {
  const { user } = useUser();
  const heroRef = useRef<HTMLElement>(null);

  // --- T_PP Dynamic Hooks ---
  const { activeItems: tickerItems, error: tickerError } = useTickerItems();
  const { members: allMembers, isLoading: loadingAll } = useTeamMembers({ activeOnly: true });
  const { achievements: showcaseItems } = useAchievements({ activeOnly: true });
  
  // Prioritize: Executive → Division Director (Aufa & Daffa first) → Others (up to 4)
  const executiveMembers = allMembers.filter(m => {
    const t = (m.tier || '').toLowerCase();
    return t.includes('executive') || t.includes('council') || t.includes('ketua');
  });
  const directorMembers = allMembers.filter(m => {
    const t = (m.tier || '').toLowerCase();
    return t.includes('director') || t.includes('division');
  });
  
  // Sort directors: Aufa and Daffa first (case-insensitive)
  const sortedDirectors = [...directorMembers].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    const isAufaA = nameA.includes('aufa');
    const isAufaB = nameB.includes('aufa');
    const isDaffaA = nameA.includes('daffa');
    const isDaffaB = nameB.includes('daffa');
    
    if (isAufaA && !isAufaB) return -1;
    if (!isAufaA && isAufaB) return 1;
    if (isDaffaA && !isDaffaB) return -1;
    if (!isDaffaA && isDaffaB) return 1;
    return 0;
  });
  
  const otherMembers = allMembers.filter(m => {
    const t = (m.tier || '').toLowerCase();
    return !t.includes('executive') && !t.includes('council') && !t.includes('ketua') && !t.includes('director') && !t.includes('division');
  });
  
  const managementTeam = [...executiveMembers, ...sortedDirectors, ...otherMembers].slice(0, 4);
  const isLoadingTeam = loadingAll;

  const featuredAchievement = showcaseItems.find(a => a.isHallOfFame) || showcaseItems[0];
  const sideItems = showcaseItems.filter(a => a.id !== featuredAchievement?.id).slice(0, 2);

  const { images: globalImages } = useDynamicPageImages('global');
  
  const telkomLogo = PlaceHolderImages.find(p => p.id === 'telkom-university-logo-potrait');
  const mercuBuanaLogo = PlaceHolderImages.find(p => p.id === 'mercu-buana-logo-square');
  const effectiveTelkomLogoUrl = globalImages['telkom-university-logo-potrait']?.imageUrl || telkomLogo?.imageUrl;
  const effectiveMercuBuanaLogoUrl = globalImages['mercu-buana-logo-square']?.imageUrl || mercuBuanaLogo?.imageUrl;

  // -------------------------

  const rawTickerTexts = (tickerItems && tickerItems.length > 0 && !tickerError)
    ? tickerItems.map(item => item.text)
    : fallbackTickerTexts;
  const duplicatedTickerTexts = [...rawTickerTexts, ...rawTickerTexts];

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.8,
        ease: "easeOut"
      },
    }),
  };

  // Carousel slot IDs
  const carouselSlots = ['homepage-carousel-collaboration', 'homepage-carousel-mentorship'];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative h-screen w-full overflow-hidden"
      >
        <StrictImage
          slotId="hero-background-main"
          pageCategory="home"
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 container h-full flex flex-col justify-center">
          <div className="max-w-3xl">
            <motion.h1
              className="font-headline text-5xl md:text-7xl font-bold text-white text-shadow-md"
              initial="hidden"
              animate="visible"
              custom={0}
              variants={textVariants}
            >
              Welcome to
              <span className="block text-primary text-shadow-glow-primary">Tel-Nect</span>
            </motion.h1>
            <motion.p
              className="mt-6 text-lg md:text-xl text-white text-shadow-md max-w-2xl"
              initial="hidden"
              animate="visible"
              custom={1}
              variants={textVariants}
            >
              Sarana terpusat bagi seluruh anggota Codebusters untuk mengakses dokumentasi, publikasi, dan inisiatif organisasi secara jelas dan terstruktur.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Ticker Tape Section */}
      <section className="bg-zinc-950 text-zinc-400 py-3 w-full overflow-hidden border-y border-zinc-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-20" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-zinc-950 to-transparent z-20" />
          <div className="absolute left-6 z-30 flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-md">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Forge Feed</span>
          </div>
          <motion.div
            className="flex whitespace-nowrap items-center"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ ease: 'linear', duration: 40, repeat: Infinity }}
          >
            <div className="w-[200px] flex-shrink-0"></div>
            {duplicatedTickerTexts.map((text, index) => (
              <div key={index} className="flex items-center px-12 group">
                <span className="text-zinc-300 text-xs font-medium tracking-wide group-hover:text-white transition-colors uppercase">
                  {text}
                </span>
                <div className="ml-12 h-1 w-1 rounded-full bg-zinc-800" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Tel-Nect Section */}
      <section className="py-20 md:py-32 bg-card overflow-hidden">
        <div className="container grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Tentang <span className="text-primary">Tel-Nect</span>
            </h2>
            <blockquote className="mt-6 pl-4 border-l-4 border-primary text-lg text-muted-foreground italic">
              "Tel-Nect hadir sebagai ruang kolaborasi yang menyatukan ide, talenta, dan semangat untuk membangun ekosistem digital yang lebih terarah."
            </blockquote>
            <div className="mt-6 text-base text-muted-foreground space-y-4">
              <p>
                Tel-Nect adalah platform yang dikembangkan oleh Codebusters Telkom sebagai pusat informasi dan dipersembahkan untuk Codebusters termasuk Codebusters Pusat sebagai platform resmi yang menyatukan informasi, dokumentasi, dan aktivitas komunitas dalam satu tempat. Melalui inisiatif ini, kami menghadirkan ruang yang lebih terstruktur bagi anggota untuk berkolaborasi, membangun proyek, dan mengelola kegiatan secara transparan.
              </p>
              <p>
                Tel-Nect dirancang untuk memperkuat komunikasi antar anggota sekaligus memudahkan cabang lain dalam mengakes informasi dibawah naungan Codebusters Telkom University.
              </p>
            </div>
            <div className="mt-10 flex items-center justify-start gap-4">
              {effectiveTelkomLogoUrl && (
                <Image src={effectiveTelkomLogoUrl} alt="Telkom University Logo" width={200} height={64} className="h-16 w-auto object-contain" unoptimized />
              )}
              <div className="h-12 w-px bg-border shrink-0" />
              {effectiveMercuBuanaLogoUrl && (
                <Image src={effectiveMercuBuanaLogoUrl} alt="Universitas Mercu Buana Logo" width={200} height={64} className="h-16 w-auto object-contain" unoptimized />
              )}
            </div>
            <Button size="lg" asChild className="mt-12">
              <Link href="/about">Pelajari Visi Kami</Link>
            </Button>
          </div>
          <div className="relative h-[600px] w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-xl">
            <Carousel
              className="w-full h-full"
              plugins={[Autoplay({ delay: 3000, stopOnInteraction: false })]}
              opts={{ loop: true }}
            >
              <CarouselContent>
                {carouselSlots.map((slotId, index) => (
                  <CarouselItem key={index}>
                    <div className="relative h-[600px] w-full">
                      <StrictImage
                        slotId={slotId}
                        pageCategory="home"
                        alt={`Slide ${index + 1}`}
                        fill
                        className="object-cover"
                        skeletonClassName="rounded-lg"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </section>

      {/* The Telkom University Advantage Section */}
      <section className="relative py-20 md:py-24 bg-primary text-primary-foreground overflow-hidden">
        <svg className="absolute top-0 left-0 w-96 h-96 text-white/20 transform -translate-x-1/4 -translate-y-1/4" fill="none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M 100, 0 a 100,100 0 1,1 0,200 a 100,100 0 1,1 0,-200" stroke="currentColor" strokeWidth="1" fill="none" />
          <path d="M 50,50 L 150,150 M 150,50 L 50,150" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>
        <svg className="absolute bottom-0 right-0 w-96 h-96 text-white/20 transform translate-x-1/4 translate-y-1/4" fill="none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M 100, 0 a 100,100 0 1,1 0,200 a 100,100 0 1,1 0,-200" stroke="currentColor" strokeWidth="1" fill="none" />
          <path d="M 50,50 L 150,150 M 150,50 L 50,150" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>
        <div className="container text-center max-w-3xl mx-auto relative z-10">
          {effectiveTelkomLogoUrl && (
            <Image src={effectiveTelkomLogoUrl} alt="Telkom University Logo" width={200} height={80} className="mx-auto mb-6 h-20 w-auto filter-white object-contain" unoptimized />
          )}
          <h2 className="font-headline text-3xl md:text-4xl font-bold">
            The Telkom University Advantage
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
            Semua program dan proyek di Tel-Nect divalidasi oleh metodologi akademik dan standar industri yang ketat dari Telkom University, memastikan setiap kontribusi memiliki standar keunggulan yang sama.
          </p>
        </div>
      </section>

      {/* Message from Chairperson Section */}
      <section className="py-20 md:py-24 bg-card">
        <div className="container grid md:grid-cols-2 gap-12 items-center">
          <ChairpersonCollage mainImageSlot="collage-chairperson-main" secondaryImageSlot="collage-chairperson-secondary" />
          <div className="space-y-6">
            <p className="font-semibold text-primary tracking-widest text-sm underline">SINCE 2024</p>
            <div className="flex items-center gap-4">
              <h2 className="font-headline text-4xl font-bold">
                Pesan dari <span className="text-primary underline">Chairperson</span>
              </h2>
            </div>
            <blockquote className="border-l-4 border-primary pl-4 text-lg italic text-muted-foreground">
              Sejak awal berdirinya, Codebusters Telkom dibangun sebagai ruang belajar dan kolaborasi bagi mahasiswa yang ingin berkembang di bidang teknologi.
            </blockquote>
            <div className="text-base text-muted-foreground space-y-4">
              <p>
                Pembuatan website ini adalah langkah penting bagi kami untuk menghadirkan platform yang lebih tertata, terbuka, dan mudah diakses oleh seluruh anggota. Harapannya, halaman ini dapat menjadi pusat informasi yang membantu setiap cabang dan individu untuk terus terhubung serta berkembang bersama.
              </p>
              <p>Terima kasih kepada seluruh anggota yang telah ikut berkontribusi.</p>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm">
                <StrictImage slotId="management-lacienta" pageCategory="home" alt="Mochamad Kevin K." fill className="object-cover object-top" skeletonClassName="rounded-full" />
              </div>
              <div>
                <p className="font-semibold">Mochamad Kevin K.</p>
                <p className="text-sm text-primary">Chairperson, Tel-Nect</p>
              </div>
              <ImageWithSkeleton src="https://firebasestorage.googleapis.com/v0/b/studio-8681629558-68f05.firebasestorage.app/o/A1%2FSignature%2011.png?alt=media&token=35181cf6-6bb7-464b-89bc-8bba10971d5f" alt="Signature" width={250} height={100} className="ml-auto opacity-70" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 bg-background text-foreground">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-2">Why Choose Tel-Nect</Badge>
            <h2 className="font-headline text-3xl font-bold md:text-4xl mt-4">
              Pusat Keunggulan untuk Talenta Digital
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={feature.title} className="block group">
                <Card className="relative text-center h-full p-8 bg-transparent border-none shadow-none transition-colors duration-300">
                  <div className="inline-block p-4 bg-primary/10 rounded-full mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="font-headline text-xl">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT STATISTICS SECTION */}
      <section className="py-20 bg-muted/30 border-y overflow-hidden">
        <div className="container">
          <div className="flex flex-wrap md:flex-nowrap justify-between items-center">
            {stats.map((stat, idx) => (
              <React.Fragment key={idx}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex-1 text-center py-6"
                >
                  <h3 className="text-4xl md:text-6xl font-headline font-bold text-foreground">
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </h3>
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-[0.3em] mt-2">{stat.label}</p>
                </motion.div>
                {idx < stats.length - 1 && (
                  <div className="hidden md:block w-px h-12 bg-border/60 mx-2" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE OF EXCELLENCE SECTION */}
      <section className="py-24 md:py-32 bg-background overflow-hidden">
        <div className="container">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="font-headline text-4xl md:text-6xl font-bold leading-none tracking-tighter">
                Showcase of <br /> <span className="text-primary italic">Community Excellence</span>
              </h2>
            </div>
            <Button asChild variant="outline" className="rounded-full px-8 border-primary text-primary hover:bg-primary hover:text-white transition-all">
              <Link href={user ? "/achievements" : "/login"}>
                Lihat Semua Pencapaian <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {featuredAchievement && (
              <motion.div className="lg:col-span-7" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <Link href="/achievements" className="block h-full">
                  <Card className="h-full border-2 border-border/50 overflow-hidden group shadow-none hover:border-primary/30 transition-all duration-500">
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      {(() => { const img = featuredAchievement.thumbnailUrl || PlaceHolderImages.find(p => p.id === featuredAchievement.thumbnailId)?.imageUrl; return img ? <ImageWithSkeleton src={img} alt={featuredAchievement.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /> : null; })()}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-6 right-6">
                        <Badge className="bg-amber-500 text-black font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-none">{featuredAchievement.award}</Badge>
                      </div>
                      <div className="absolute bottom-8 left-8 right-8">
                        <p className="text-[10px] font-black uppercase text-primary tracking-[0.4em] mb-2">{featuredAchievement.category} · {featuredAchievement.year}</p>
                        <h3 className="text-3xl font-headline font-bold text-white uppercase tracking-tighter leading-tight">{featuredAchievement.title}</h3>
                      </div>
                    </div>
                    <CardContent className="p-8">
                      <p className="text-muted-foreground leading-relaxed">{featuredAchievement.description}</p>
                      <p className="mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">{featuredAchievement.team} • {featuredAchievement.institution}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )}

            <div className="lg:col-span-5 flex flex-col gap-8">
              {sideItems.map((item, i) => {
                const img = item.thumbnailUrl || PlaceHolderImages.find(p => p.id === item.thumbnailId)?.imageUrl;
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * (i + 1) }}>
                    <Link href="/achievements">
                      <Card className="border-none bg-muted/50 hover:bg-muted transition-colors group">
                        <CardContent className="p-6 flex gap-6 items-start">
                          <div className="relative h-24 w-24 rounded-xl overflow-hidden shrink-0 shadow-lg bg-muted/50">
                            {img && <ImageWithSkeleton src={img} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" skeletonClassName="rounded-xl" />}
                          </div>
                          <div className="space-y-2">
                            <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-primary/30 text-primary">{item.award}</Badge>
                            <h4 className="font-headline font-bold text-lg leading-tight uppercase">{item.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}

              {/* "Ingin Mencetak Prestasi Berikutnya?" Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-auto"
              >
                <div className="bg-primary p-8 rounded-2xl text-primary-foreground relative overflow-hidden group">
                  <Star className="absolute top-[-20px] right-[-20px] h-32 w-32 opacity-10 rotate-12 transition-transform duration-700 group-hover:rotate-45" />
                  <h4 className="font-headline text-2xl font-bold mb-2">Ingin Mencetak Prestasi Berikutnya?</h4>
                  <p className="text-sm text-primary-foreground/80 mb-6 max-w-xs">Gabung dengan tim proyek kami dan wujudkan inovasimu bersama talenta terbaik.</p>
                  <Button asChild variant="secondary" className="w-full bg-white text-primary hover:bg-white/90">
                    <Link href={user ? "/submit-proposal" : "/login"}>Ajukan Ide Proyek</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Management Team Section */}
      <section id="team" className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl font-bold md:text-4xl">Meet Our Executive Council</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Jajaran pemimpin yang menentukan arah inovasi Komunitas Codebusters.
              <span className="block">(Telkom University & Universitas Mercu Buana)</span>
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {isLoadingTeam ? (
              <div className="col-span-full text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading team members...</p>
              </div>
            ) : managementTeam.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">No team members found.</p>
              </div>
            ) : (
              managementTeam.map((member, idx) => {
                const placeholderImage = PlaceHolderImages.find(p => p.id === member.imageId);
                const imageUrl = member.imageUrl || placeholderImage?.imageUrl;
                const isTelkom = member.university?.toLowerCase().includes('telkom');
                const logoSlotId = isTelkom ? 'telkom-university-logo-potrait' : 'mercu-buana-logo-square';

                return (
                  <div key={member.id} className="group relative flex flex-col">
                    <div className="relative aspect-[3/4] overflow-hidden cut-corner-image shadow-md transition-shadow hover:shadow-xl bg-muted/20">
                      {imageUrl && (
                        <ImageWithSkeleton
                          src={imageUrl}
                          alt={member.name}
                          fill
                          className="object-cover object-top grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute top-6 left-6 h-12 w-12 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center p-2.5 border border-white/10 shrink-0">
                        <div className="relative w-full h-full filter-white opacity-80">
                          {isTelkom ? (
                            effectiveTelkomLogoUrl && <Image src={effectiveTelkomLogoUrl} fill alt="Telkom Logo" className="object-contain" unoptimized />
                          ) : (
                            effectiveMercuBuanaLogoUrl && <Image src={effectiveMercuBuanaLogoUrl} fill alt="Mercu Buana Logo" className="object-contain" unoptimized />
                          )}
                        </div>
                      </div>
                      <div className="absolute inset-y-0 right-0 w-12 bg-black/40 backdrop-blur-xl translate-x-full group-hover:translate-x-0 transition-transform duration-300 flex flex-col items-center justify-center gap-6 border-l border-white/10">
                        <a href={member.socials?.linkedin && member.socials.linkedin !== '#' ? member.socials.linkedin : '#'} target="_blank" rel="noopener noreferrer" className={`transition-colors ${member.socials?.linkedin && member.socials.linkedin !== '#' ? 'text-white/70 hover:text-white' : 'text-white'}`}>
                          <Linkedin className="h-5 w-5" />
                        </a>
                        <div className="w-px h-10 bg-white/20" />
                        <a href={member.socials?.github && member.socials.github !== '#' ? member.socials.github : '#'} target="_blank" rel="noopener noreferrer" className={`transition-colors ${member.socials?.github && member.socials.github !== '#' ? 'text-white/70 hover:text-white' : 'text-white'}`}>
                          <Github className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                    <div className="mt-8 relative">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">{member.role}</p>
                          <h3 className="font-headline text-3xl font-bold text-foreground leading-none tracking-tighter uppercase">{member.name}</h3>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground/20 font-mono">0{idx + 1}</span>
                      </div>
                      <div className="mt-4 h-px w-full bg-border/50" />
                      <p className="mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">{member.university}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
