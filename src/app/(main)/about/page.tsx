'use client';

import { AdminImage } from '@/components/ui/admin-image';
import { Button } from '@/components/ui/button';
import { Award, BrainCircuit, Quote, ShieldCheck, Users, Scale, ArrowDown, Lightbulb } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { StrictImage } from '@/components/ui/strict-image';
import Image from 'next/image';
import { useDynamicPageImages } from '@/hooks/useDynamicPageImages';

const codebustersCode = [
  {
    icon: <Award className="h-10 w-10 text-primary" />,
    title: 'Mastery over Memorization',
    description: 'Kami menekankan keahlian praktis melalui proyek nyata, bukan sekadar teori.',
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'Collaborative Excellence',
    description: 'Kami menumbuhkan budaya peer-review dan kerja tim profesional untuk hasil terbaik.',
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    title: 'Ethical Innovation',
    description: 'Setiap proyek didorong oleh tanggung jawab etis dan dampak sosial yang positif.',
  },
  {
    icon: <Scale className="h-10 w-10 text-primary" />,
    title: 'Digital Ethics',
    description: 'Penekanan dalam kurikulum pada privasi data, keamanan, dan dampak sosial AI.',
  },
];

export default function AboutPage() {
  const heroRef = useRef(null);
  const { scrollYProgress: heroScrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const textY = useTransform(heroScrollYProgress, [0, 1], ['0%', '150%']);

  const { images: aboutImages } = useDynamicPageImages('about');
  const rectorPlaceholder = PlaceHolderImages.find(p => p.id === 'masterclass-speaker')?.imageUrl;
  const rectorImageUrl = aboutImages['masterclass-speaker']?.imageUrl || rectorPlaceholder;

  const telkomLogoUrl = PlaceHolderImages.find(p => p.id === 'telkom-university-logo-potrait')?.imageUrl;

  // Note: AdminImage akan auto-fetch dari Firestore menggunakan slotId + pageCategory
  // Tidak perlu manual fetch dengan useStrictPageImages lagi

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const heroContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.4,
      },
    },
  };

  const heroChildVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.43, 0.13, 0.23, 0.96]
      },
    },
  };

  const textContentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const textItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };


  return (
    <div className="bg-background text-foreground">
      {/* SECTION 1: HERO - KINETIC MANIFESTO */}
      <motion.section
        ref={heroRef}
        className="relative bg-black text-white min-h-screen flex items-center overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={heroContainerVariants}
      >
        {/* STRICT PRIORITY: Skeleton muncul sampai image loaded, tidak ada flash */}
        <AdminImage 
          slotId="about-page-hero"
          pageCategory="about"
          alt="About Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/30" />

        <div className="relative z-10 w-full px-6 sm:px-8">
          <div className="grid md:grid-cols-1 gap-8 items-center">
            {/* Left Column: Text Content */}
            <motion.div className="z-20 text-white" style={{ y: textY }}>
              <motion.div variants={heroChildVariants}>
                <span className="font-semibold text-primary tracking-widest text-sm uppercase">The Genesis</span>
              </motion.div>

              <motion.h1
                className="font-headline text-5xl md:text-[5.5rem] font-bold mt-4 leading-none"
                variants={heroChildVariants}
              >
                The Core of Innovation.
              </motion.h1>

              <motion.div
                className="h-1 bg-primary my-8"
                initial={{ width: 0 }}
                animate={{ width: '50%' }}
                transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
              />

              <motion.p
                className="text-lg text-gray-200 max-w-xl"
                variants={heroChildVariants}
              >
                Website ini dibuat oleh Codebusters Telkom sebagai pusat informasi resmi untuk memperkuat identitas Codebusters dan menyediakan ruang yang terstruktur untuk aktivitas, dokumentasi, dan kolaborasi anggota.
              </motion.p>

              <motion.div className="mt-10" variants={heroChildVariants}>
                <Button size="lg" variant="default">
                  Jelajahi Visi Kami
                  <ArrowDown className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 3: THE STRATEGIC ALLIANCE */}
      <motion.section
        className="py-20 md:py-28 bg-background"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="container">
          <h2 className="font-headline text-4xl font-bold text-center mb-16">Rektor</h2>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="relative h-96 w-full max-w-sm mx-auto">
              {rectorImageUrl &&
                <Image
                  src={rectorImageUrl}
                  alt="Rektor Telkom University"
                  fill
                  className="object-cover object-top rounded-lg shadow-2xl"
                  unoptimized
                />
              }
            </div>
            <div className="border-l-4 border-primary pl-8">
              <Quote className="h-16 w-16 text-primary/10 mb-4" />
              <blockquote className="text-2xl font-serif italic text-foreground/90">
                "Codebusters adalah bukti nyata komitmen Telkom University dalam mencetak talenta digital berkelas dunia. Melalui kolaborasi strategis dan kurikulum yang relevan, kami membangun fondasi bagi para pemimpin teknologi masa depan Indonesia."
              </blockquote>
              <div className="mt-6">
                <p className="font-bold text-lg font-headline text-foreground">Prof. Dr. Suyanto, S.T., M.Sc.</p>
                <p className="text-sm text-muted-foreground font-semibold">Rektor, Telkom University</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION: OUR CORE VALUES (NEW DESIGN) */}
      <motion.section
        className="py-20 md:py-28"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-headline text-3xl font-bold md:text-4xl">Our Core Values</h2>
            <p className="mt-4 text-muted-foreground">Empat pilar yang menjadi fondasi budaya dan etos kerja di Codebusters.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {codebustersCode.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 150 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative h-36 w-36 flex items-center justify-center rounded-full bg-primary/5 border border-primary/10 transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-110">
                  <div className="absolute inset-2 rounded-full border-2 border-dashed border-primary/20 animate-spin-slow"></div>
                  {item.icon}
                </div>
                <h3 className="font-headline text-xl mt-6 font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-2 max-w-xs">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* SECTION: THE CODEBUSTERS ENGINE */}
      <motion.section
        className="py-20 md:py-32 bg-background overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="container grid lg:grid-cols-2 gap-20 items-center">
          {/* Image Collage - Grand Architectural Mosaic */}
          <div className="relative h-[750px] w-full max-w-2xl mx-auto">
            {/* Image 1: Grand Anchor Top Right (BIG - Abstract Decoration) */}
            <motion.div
              className="absolute top-0 right-0 w-[70%] h-[500px] overflow-hidden shadow-2xl border-2 border-border z-10 group"
              initial={{ opacity: 0, x: 100, scale: 1.1 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* STRICT PRIORITY: AdminImage dengan slot mode */}
              <AdminImage 
                slotId="about-us-decoration"
                pageCategory="about"
                alt="Dekorasi Abstract"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>

            {/* Image 2: Central Focus Overlapping Left (SMALL - About Us Photo) */}
            <motion.div
              className="absolute top-[200px] left-0 w-[60%] h-[400px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.4)] border-2 border-border z-20 group"
              initial={{ opacity: 0, x: -100, scale: 0.9 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* STRICT PRIORITY: AdminImage dengan slot mode */}
              <AdminImage 
                slotId="about-us-image"
                pageCategory="about"
                alt="About Us"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>

            {/* Image 3: Telkom Logo Bottom Right */}
            <motion.div
              className="absolute bottom-0 right-[10%] w-[45%] h-[250px] z-30 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] dark:bg-black/30 dark:border-white/10"
              initial={{ opacity: 0, y: 100, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            >
              {/* Inner container: inset-4 to give visual padding so logo doesn't bleed to edges */}
              <div style={{ position: 'absolute', inset: '32px' }}>
                <StrictImage
                  slotId="telkom-university-logo-potrait"
                  pageCategory="global"
                  alt="Telkom University Logo"
                  fill
                  objectFit="contain"
                />
              </div>
            </motion.div>
          </div>

          <motion.div
            className="text-left"
            variants={textContentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h2
              variants={textItemVariants}
              className="font-headline text-4xl md:text-5xl font-bold text-foreground leading-tight"
            >
              The <span className="text-primary">Codebusters Engine</span>
            </motion.h2>
            <motion.blockquote
              variants={textItemVariants}
              className="mt-6 pl-4 border-l-4 border-primary text-lg text-muted-foreground italic"
            >
              "Tim inti kami adalah produk dari talenta Codebusters, bertanggung jawab untuk membangun, memelihara, dan mengamankan platform ini."
            </motion.blockquote>
            <motion.div
              variants={textItemVariants}
              className="mt-6 text-base text-muted-foreground space-y-4 max-w-3xl"
            >
              <p>
                Tim inti Tel-Nect dibentuk melalui proses seleksi dan pengembangan yang terstruktur di lingkungan Codebusters. Tanggung jawab atas pengembangan, pemeliharaan, dan pengamanan platform ini diemban dengan mengedepankan standar akademik, ketelitian teknis, serta praktik rekayasa perangkat lunak yang dapat dipertanggungjawabkan.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

    </div>
  );
}
