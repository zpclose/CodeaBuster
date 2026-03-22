'use client';

import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Linkedin, Github, Users, ShieldCheck, Handshake, TrendingUp, Layers, Server, Lightbulb, UserCheck, HardHat, Trophy, ArrowRight, BookOpen, LineChart, Cpu, CheckCircle, GitMerge } from 'lucide-react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useCouncilDirectives } from '@/hooks/useCouncilDirectives';

// Hardcoded directives (Static for now, but linked to dynamic leaders via ID)
const recentDirectives = [
  {
    title: "Peluncuran Program Mentorship 2.0",
    date: "2024-07-15",
    status: "DISETUJUI",
    description: "Program mentorship baru dengan integrasi AI untuk penjodohan mentor-mentee yang lebih akurat.",
    leaderId: "ketua-umum",
  },
  {
    title: "Standarisasi Proses Kontribusi Proyek",
    date: "2024-07-10",
    status: "DALAM PENGEMBANGAN",
    description: "Menetapkan pedoman dan alur kerja standar untuk pengajuan, peninjauan, dan kontribusi pada proyek komunitas.",
    leaderId: "kepala-divisi-proyek",
  },
  {
    title: "Kemitraan Strategis dengan Startup Lokal",
    date: "2024-06-28",
    status: "SELESAI",
    description: "Menjalin kemitraan resmi dengan 3 startup teknologi untuk menyediakan studi kasus nyata dan peluang magang.",
    leaderId: "wakil-ketua",
  }
]

const governingPrinciples = [
  {
    title: 'Integritas',
    description: 'Setiap keputusan dan tindakan didasarkan pada kejujuran, tanggung jawab, serta komitmen untuk menjaga kepercayaan anggota dan mitra organisasi.',
  },
  {
    title: 'Kolaborasi',
    description: 'Kami mendorong kerja sama yang terbuka dan setara, dengan menghargai peran setiap individu dalam mencapai tujuan bersama.',
  },
  {
    title: 'Berdampak',
    description: 'Kepemimpinan diarahkan untuk menghasilkan kontribusi nyata melalui program, kebijakan, dan inisiatif yang memberikan manfaat berkelanjutan.',
  },
  {
    title: 'Keterbukaan',
    description: 'Kami menjunjung keterbukaan dalam komunikasi dan proses pengambilan keputusan, serta membuka ruang bagi masukan, evaluasi, dan dialog yang konstruktif dari seluruh anggota.',
  },
];

function InteractivePrinciples() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePrinciple = governingPrinciples[activeIndex];

  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  return (
    <Card className="shadow-lg overflow-hidden">
      <div className="relative flex border-b bg-muted p-1">
        {governingPrinciples.map((principle, index) => (
          <button
            key={principle.title}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "relative flex-1 py-2.5 px-3 text-center text-sm font-medium transition-colors z-10",
              activeIndex === index ? "text-primary-foreground" : "text-muted-foreground hover:text-primary"
            )}
          >
            {principle.title}
          </button>
        ))}
        <motion.div
          layoutId="active-principle-pill"
          className="absolute inset-0 h-full bg-primary rounded-md z-0"
          style={{
            width: `${100 / governingPrinciples.length}%`,
          }}
          animate={{ x: `${activeIndex * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>
      <CardContent className="p-8 min-h-[180px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col md:flex-row items-center gap-8 w-full"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
              <div className="flex-shrink-0 p-4 bg-primary/10 rounded-full h-20 w-20 flex items-center justify-center">
                <span className="font-headline text-3xl font-bold text-primary">0{activeIndex + 1}</span>
              </div>
            </motion.div>
            <div className="text-center md:text-left">
              <h3 className="font-headline text-2xl font-bold text-foreground">
                {activePrinciple.title}
              </h3>
              <p className="mt-2 text-muted-foreground text-base">
                {activePrinciple.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}


export default function ManagementPage() {
  const { members, isLoading: isLoadingMembers } = useTeamMembers();
  const { directives, isLoading: isLoadingDirectives } = useCouncilDirectives();

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } },
  };

  // Get all unique tiers from members
  const uniqueTiers = useMemo(() => {
    const tiers = new Set(members.map(m => m.tier).filter(Boolean));
    const sorted = Array.from(tiers).sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      // Executive always first
      if (aLower.includes('executive') || aLower.includes('council') || aLower.includes('ketua')) return -1;
      if (bLower.includes('executive') || bLower.includes('council') || bLower.includes('ketua')) return 1;
      return a.localeCompare(b);
    });
    return sorted;
  }, [members]);

  // Group members by tier
  const membersByTier = useMemo(() => {
    const grouped: Record<string, typeof members> = {};
    members.filter(m => m.isActive).forEach(member => {
      const tier = member.tier || 'Other';
      if (!grouped[tier]) grouped[tier] = [];
      grouped[tier].push(member);
    });
    return grouped;
  }, [members]);

  // Determine section style based on tier name
  const getSectionStyle = (tier: string) => {
    const t = tier.toLowerCase();
    if (t.includes('executive') || t.includes('council') || t.includes('ketua')) {
      return { layout: 'grid-cols-1 lg:grid-cols-2', cardStyle: 'flex-row h-full', imageSize: 'h-32 w-32', showQuote: true };
    }
    return { layout: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4', cardStyle: 'text-center', imageSize: 'h-64 w-full', showQuote: false };
  };

  const sectionTitles: Record<string, string> = {
    'Executive Council': 'Executive Council',
    'Division Director': 'Division Directors',
    'Head to Tribe': 'Heads',
    'Staff': 'Staff',
  };

  const getSectionTitle = (tier: string) => {
    // Check exact match first
    if (sectionTitles[tier]) return sectionTitles[tier];
    
    // For other tiers, capitalize first letter
    const t = tier.toLowerCase();
    if (t.includes('executive') || t.includes('council') || t.includes('ketua')) {
      return 'Executive Council';
    }
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  // Filter and sort active directives
  const activeDirectives = useMemo(() => {
    return directives
      .filter(d => d.isActive)
      .sort((a, b) => a.order - b.order || new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [directives]);

  const timelineRef = useRef(null);
  const isTimelineInView = useInView(timelineRef, { once: true, amount: 0.2 });

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <motion.section
        className="relative w-full overflow-hidden bg-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="container py-20 md:py-28">
          <div className="max-w-4xl">
            <motion.h1
              className="font-headline text-5xl font-bold md:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Meet The Architects of Excellence
            </motion.h1>
            <motion.p
              className="mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Para pemimpin visioner yang mengarahkan kolaborasi dan standar keunggulan di jaringan Codebusters.
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Main Content Section */}
      <motion.section
        className="py-16 md:py-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="container">
          {isLoadingMembers ? (
            <div className="text-center py-12 text-muted-foreground">Loading team structure...</div>
          ) : (
            <div className="space-y-16">
              {/* Dynamic Sections for Each Tier */}
              {uniqueTiers.map(tier => {
                const tierMembers = membersByTier[tier] || [];
                if (tierMembers.length === 0) return null;
                
                const style = getSectionStyle(tier);
                const isExecutive = style.showQuote;

                return (
                  <div key={tier}>
                    <h2 className="font-headline text-3xl font-bold md:text-4xl border-b pb-4 mb-8">{getSectionTitle(tier)}</h2>
                    <div className={`grid ${style.layout} gap-8`}>
                      {tierMembers.map(member => {
                        const placeholderImage = PlaceHolderImages.find(p => p.id === member.imageId);
                        const displayImageUrl = member.imageUrl || (member as any).logoUrl || placeholderImage?.imageUrl;

                        if (isExecutive) {
                          // Executive Council Style
                          return (
                            <motion.div
                              key={member.id}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.5 }}
                            >
                              <Card className="group flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border">
                                <CardContent className="p-8">
                                  <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-8">
                                    {displayImageUrl && (
                                      <div className="relative h-32 w-32 rounded-full flex-shrink-0 overflow-hidden border-4 border-card shadow-lg transition-all duration-300 group-hover:border-primary/20">
                                        <ImageWithSkeleton
                                          src={displayImageUrl}
                                          alt={`Photo of ${member.name}`}
                                          fill
                                          className="object-cover object-top"
                                          data-ai-hint={placeholderImage?.imageHint}
                                        />
                                      </div>
                                    )}
                                    <div>
                                      <h3 className="font-headline text-2xl font-bold">{member.name}</h3>
                                      <p className="font-semibold text-primary">{member.role}</p>
                                      <p className="text-sm text-muted-foreground font-medium">{member.university}</p>
                                    </div>
                                  </div>
                                  <blockquote className="mt-6 text-base text-muted-foreground italic border-l-2 border-primary pl-4 py-2">
                                    "{member.quote || 'Visioner yang berdedikasi.'}"
                                  </blockquote>
                                </CardContent>
                                <CardFooter className="bg-muted p-4 flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-0">
                                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-start">
                                    <Button asChild size="sm" variant="ghost" className={member.socials?.linkedin ? 'text-muted-foreground' : 'text-white'}>
                                      <a href={member.socials?.linkedin || '#'} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s LinkedIn`}>
                                        <Linkedin />
                                        <span>LinkedIn</span>
                                      </a>
                                    </Button>
                                    <Button asChild size="sm" variant="ghost" className={member.socials?.github ? 'text-muted-foreground' : 'text-white'}>
                                      <a href={member.socials?.github || '#'} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s GitHub`}>
                                        <Github />
                                        <span>GitHub</span>
                                      </a>
                                    </Button>
                                  </div>
                                </CardFooter>
                              </Card>
                            </motion.div>
                          );
                        }

                        // Other Tiers Style (Division Directors, Staff, etc.)
                        return (
                          <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="flex"
                          >
                            <Card className="group text-center overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border w-full flex flex-col">
                              <CardContent className="p-0 flex-shrink-0">
                                <div className="relative h-64 w-full">
                                  {displayImageUrl && (
                                    <ImageWithSkeleton
                                      src={displayImageUrl}
                                      alt={member.name}
                                      fill
                                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                    />
                                  )}
                                </div>
                              </CardContent>
                              <CardHeader className="p-4 flex-shrink-0">
                                <CardTitle className="font-bold text-lg">{member.name}</CardTitle>
                                <p className="text-sm text-primary">{member.role}</p>
                              </CardHeader>
                              <CardFooter className="p-4 pt-0 mt-auto">
                                <div className="flex justify-center space-x-3 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <a href={member.socials?.linkedin || '#'} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></a>
                                  <a href={member.socials?.github || '#'} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Github className="h-5 w-5" /></a>
                                </div>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {uniqueTiers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No active team members found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.section>

      {/* NEW SECTION: Recent Council Directives & Initiatives */}
      <motion.section
        className="py-16 md:py-24 bg-card"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-headline text-3xl font-bold md:text-4xl">Keputusan &amp; Inisiatif Terbaru Dewan</h2>
            <p className="mt-4 text-muted-foreground">
              Transparansi dalam aksi. Lihat keputusan dan inisiatif strategis yang baru-baru ini disahkan oleh dewan pengurus.
            </p>
          </div>

          {/* Timeline */}
          <div ref={timelineRef} className="relative max-w-2xl mx-auto pl-8 md:pl-0">
            {/* The vertical line */}
            <motion.div
              className="absolute left-4 md:left-1/2 md:-translate-x-1/2 h-full w-0.5 bg-border top-0"
              initial={{ height: 0 }}
              animate={{ height: isTimelineInView ? '100%' : 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />

            {isLoadingDirectives ? (
              <div className="text-center py-12 text-muted-foreground w-full">Loading council directives...</div>
            ) : activeDirectives.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground w-full">Belum ada inisiatif terbaru saat ini.</div>
            ) : activeDirectives.map((directive, index) => {
              const isLeft = index % 2 === 0;
              const leader = members.find(l => l.id === directive.leaderId);
              const placeholderImage = leader ? PlaceHolderImages.find(p => p.id === leader.imageId) : null;
              const leaderImageUrl = leader?.imageUrl || (leader as any)?.logoUrl || placeholderImage?.imageUrl;

              const statusStyles = {
                DISETUJUI: { icon: Lightbulb, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500' },
                SELESAI: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500' },
                'DALAM PENGEMBANGAN': { icon: Layers, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500' },
              };
              const style = statusStyles[directive.status as keyof typeof statusStyles] || statusStyles['DALAM PENGEMBANGAN'];
              const StatusIcon = style.icon;

              return (
                <div key={index} className={`relative mb-12 flex flex-col md:flex-row items-start md:items-center ${isLeft ? 'md:justify-start' : 'md:justify-end'}`}>
                  {/* The card */}
                  <motion.div
                    className={`w-full md:w-1/2 pl-8 md:pl-0 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}
                    initial={{ opacity: 0, x: isLeft ? -20 : 20 }} // Less dramatic movement for cleaner mobile
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }} // Slightly adjusted viewport
                    transition={{ duration: 0.6, delay: index * 0.1 }} // Reduced delay
                  >
                    <Card className={`relative group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${style.border} border-l-4`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold uppercase ${style.color}`}>{directive.status}</span>
                        </div>
                        <h3 className="font-headline text-lg font-bold">{directive.title}</h3>
                        <p className="text-muted-foreground mt-1 text-sm">{directive.description}</p>
                        {leader && (
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                            {leaderImageUrl && <ImageWithSkeleton src={leaderImageUrl} alt={leader.name} width={24} height={24} className="rounded-full h-6 w-6 object-cover" />}
                            <span className="text-xs font-semibold text-muted-foreground">{leader.name}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* The dot on the timeline */}
                  <div
                    className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10 top-0 md:top-auto"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.2 + 0.2 }}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${style.bg} ring-8 ring-card bg-background`}>
                        <StatusIcon className={`h-5 w-5 ${style.color}`} />
                      </div>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* REPLACEMENT SECTION: Our Governing Philosophy */}
      <motion.section
        className="py-16 md:py-24 bg-background"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-headline text-3xl font-bold md:text-4xl">Prinsip Kepemimpinan</h2>
            <p className="mt-4 text-muted-foreground">
              Empat pilar fundamental yang memandu setiap keputusan, inisiatif, dan strategi yang diambil oleh dewan pengurus.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <InteractivePrinciples />
          </div>
        </div>
      </motion.section>
    </div>
  );
}
