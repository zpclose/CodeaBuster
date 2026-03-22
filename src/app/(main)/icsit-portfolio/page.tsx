'use client'
import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useDynamicPageImages } from '@/hooks/useDynamicPageImages';
import { Award, Calendar, Users, Trophy, Linkedin, Mail, ArrowRight, Activity, BrainCircuit, Database, Download, BookOpen } from 'lucide-react';

import { motion } from 'framer-motion';

const teamMembers = [
  {
    name: 'Andi Ryaas Saputra Effendy',
    role: 'Project Leader',
    imageId: 'member-tu',
    linkedin: '#',
  },
  {
    name: 'Nicholas Albhe Indriananda',
    role: 'Articles & Problem Identification',
    imageId: 'member-umb',
    linkedin: '#',
  },
  {
    name: 'Femas Hernanda',
    role: 'Speaker',
    imageId: 'sifonix-baskara',
    linkedin: '#',
  },
  {
    name: 'Putera Rayhan Hidayat',
    role: 'Articles & Problem Identification',
    imageId: 'sifonix-citra',
    linkedin: '#',
  },
  {
    name: 'Muhammad Firdaus',
    role: 'UI/UX Designer',
    imageId: 'sifonix-ahmad',
    linkedin: '#',
  }
];

export default function IcsitPortfolioPage() {
  const { images: dynamicImages } = useDynamicPageImages('icsit');
  const heroUrl = dynamicImages['icsit-hero']?.imageUrl;
  const wireframeUrl = dynamicImages['architecture-diagram']?.imageUrl;
  const mockupUrls = [dynamicImages['project-iot-dashboard']?.imageUrl, dynamicImages['case-study-hero']?.imageUrl];
  const certificateUrl = dynamicImages['icsit-certificate']?.imageUrl;
  const prototypeUrls = [
    dynamicImages['icsit-prototype-1']?.imageUrl,
    dynamicImages['icsit-prototype-2']?.imageUrl,
    dynamicImages['icsit-prototype-3']?.imageUrl
  ];

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="bg-background text-foreground font-sans">

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="relative pt-24 pb-16 bg-muted/10 overflow-hidden"
      >
        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start items-center gap-4">

                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
                  INTERNATIONAL AWARD
                  <span className="block text-3xl md:text-4xl font-semibold text-foreground mt-2">ASEAN Youth Innovation Competition 2025</span>
                </h1>
              </div>
              <p className="mt-4 text-lg text-muted-foreground font-medium">
                Tim S.NGR - <span className="font-bold text-primary">Universitas Mercu Buana</span>
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-center md:justify-start gap-3 text-foreground">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  <span className="font-semibold">International Conference on Sustainable Innovation and Technology</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 text-foreground">
                  <Award className="h-6 w-6 text-muted-foreground" />
                  <span className="font-semibold">Excellence Award</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 text-foreground">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                  <span className="font-semibold">17 Desember 2025, Bandung, Indonesia</span>
                </div>
              </div>

              <Button asChild size="lg" className="mt-10 bg-primary hover:bg-primary/90 text-primary-foreground">
                <a href="#solution">Lihat Arsitektur Proyek <ArrowRight className="ml-2" /></a>
              </Button>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative h-80 w-full"
            >
              {heroUrl && (
                <Image
                  src={heroUrl}
                  alt="ICSIT Award"
                  fill
                  className="rounded-lg object-cover shadow-2xl"
                  priority
                />
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Certificate Section */}
      <motion.section
        id="certificate"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="py-20 md:py-28 bg-muted/20"
      >
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Sertifikat Penghargaan</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Bukti pengakuan atas keunggulan dan inovasi yang dicapai oleh Tim S.NGR.
            </p>
          </div>
          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="overflow-hidden shadow-2xl border-muted">
              <CardContent className="p-0">
                {certificateUrl && (
                  <Image
                    src={certificateUrl}
                    alt="Sertifikat ICSIT"
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                  />
                )}
              </CardContent>
            </Card>
            <div className="mt-6 text-center">
            </div>
          </div>
        </div>
      </motion.section>

      {/* Project Showcase Section */}
      <motion.section
        id="project"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="py-20 md:py-28"
      >
        <div className="container">
          {/* Latar Belakang & Masalah */}
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Masalah yang Kami Pecahkan</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Instansi pelayanan publik kerap menghadapi tantangan dalam mengelola antrean secara efektif akibat keterbatasan sistem prediktif dan data yang terfragmentasi. Ketidakpastian waktu layanan berdampak pada menurunnya efisiensi operasional serta kualitas pengalaman masyarakat. Permasalahan ini menuntut pendekatan berbasis data yang mampu memberikan proyeksi dan dukungan pengambilan keputusan secara lebih akurat.
            </p>
          </div>

          {/* Proses Desain */}
          <div className="mt-20 max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold tracking-tight text-center text-foreground mb-12">Proses Pengembangan Sistem Kami</h3>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="relative h-80 w-full">
                {wireframeUrl && <ImageWithSkeleton src={wireframeUrl} alt="Arsitektur Sistem" fill className="rounded-lg object-cover shadow-lg" />}
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-lg">Konsep & Desain Arsitektur</h4>
                    <p className="text-muted-foreground">Merancang arsitektur sistem IoT yang terintegrasi, memilih sensor yang tepat, dan merancang topologi jaringan yang efisien.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-lg">Pengembangan Prototipe Hardware</h4>
                    <p className="text-muted-foreground">Membangun node sensor IoT, melakukan pengkodean firmware, dan verifikasi konektivitas data ke gateway.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-lg">Integrasi Platform & UX</h4>
                    <p className="text-muted-foreground">Mengembangkan antarmuka dashboard monitoring berbasis web dan mengintegrasikannya dengan backend data untuk real-time monitoring.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Solusi (Desain Final) */}
          <div id="solution" className="mt-20 md:mt-28">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Pendekatan dan Metodologi Pengembangan</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Penelitian ini dikembangkan menggunakan pendekatan data-driven dengan tujuan meningkatkan efisiensi pelayanan publik melalui sistem prediksi antrean. Proses pengembangan dilakukan secara bertahap dan sistematis untuk memastikan validitas serta keberlanjutan solusi.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8 }}
              className="mt-12"
            >
              <Carousel className="w-full max-w-4xl mx-auto"
                opts={{
                  align: "start",
                  loop: true,
                }}
              >
                <CarouselContent>
                  {mockupUrls.map((url, index) => (
                    <CarouselItem key={index}>
                      <Card className="overflow-hidden border-2">
                        <CardContent className="p-0">
                          {url && (
                            <div className="relative h-[25rem] w-full">
                              <ImageWithSkeleton src={url} alt={`Mockup ${index + 1}`} fill className="object-cover" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-[-50px]" />
                <CarouselNext className="right-[-50px]" />
              </Carousel>
            </motion.div>
            
            <div className="mt-12 max-w-3xl mx-auto">
              <Card className="bg-muted/10 border-muted">
                <CardContent className="p-8 text-center">
                  <p className="text-xl italic text-foreground">“Pendekatan data-driven yang digunakan dalam sistem ini mampu menjawab permasalahan ketidakpastian antrean pada layanan publik, dengan arsitektur yang dirancang untuk mendukung skalabilitas dan keberlanjutan.”</p>
                  <p className="mt-4 font-semibold text-foreground">- Jack Febrian Rusdi, Ph.D. Chairman ICSIT'25</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Prototype Section */}
      <motion.section
        id="prototype"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="py-20 md:py-28 bg-background"
      >
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Prototipe Antarmuka Mobile</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Visualisasi solusi berbasis mobile untuk memudahkan akses masyarakat terhadap sistem prediksi antrean secara fleksibel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {prototypeUrls.map((url, index) => {
              if (!url) return null;
              return (
                <div key={index} className="flex justify-center">
                  <div className="relative mx-auto border-[#0a0a0a] bg-[#0a0a0a] border-[8px] rounded-[2rem] h-[500px] w-[250px] shadow-xl overflow-hidden group">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#0a0a0a] rounded-b-xl z-20"></div>
                    <Image
                      src={url}
                      alt={`Prototype Screen ${index + 1}`}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Academic Value Section */}
      <motion.section
        id="academic-value"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="py-20 md:py-28 bg-muted/20"
      >
        <div className="container max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="flex justify-center md:justify-start">
              <BookOpen className="h-24 w-24 text-primary/20" />
            </div>
            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Nilai Akademik dan Kontribusi</h2>
              <p className="text-lg text-muted-foreground">
                Penelitian ini berkontribusi pada penerapan teknologi prediktif dalam bidang pelayanan publik serta menunjukkan bagaimana pendekatan berbasis data dapat digunakan untuk menjawab permasalahan nyata. Karya ini memperoleh pengakuan internasional pada ASEAN Youth Innovation Competition sebagai bentuk apresiasi terhadap relevansi dan potensi implementasinya.
              </p>
            </div>
          </div>
        </div>
      </motion.section>



    </div>
  );
}
