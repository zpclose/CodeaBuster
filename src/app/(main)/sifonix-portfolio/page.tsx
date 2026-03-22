'use client'
import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useDynamicPageImages } from '@/hooks/useDynamicPageImages';
import { Calendar, Trophy, ArrowRight, FolderKanban, Users } from 'lucide-react';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

const solutionSteps = [
  {
    title: "Landing Page NEUROVIA",
    description: "Halaman pembuka ini dirancang untuk memberikan pengenalan awal terhadap sistem pembelajaran serta membangun keterlibatan pengguna sejak pertama kali aplikasi digunakan.",
    imageId: "sifonix-mockup-1",
  },
  {
    title: "Platform Access Login",
    description: "Masuk ke sistem untuk mengakses materi pembelajaran, proyek, dan layanan akademik yang tersedia.",
    imageId: "sifonix-mockup-2",
  },
  {
    title: "Homepage",
    description: "Halaman utama yang menyajikan ringkasan pembelajaran, progres pengguna, serta akses cepat ke materi, latihan, dan modul yang sedang dipelajari dalam satu tampilan terintegrasi.",
    imageId: "sifonix-mockup-3",
  },
  {
    title: "Learning Module",
    description: "Rangkaian materi pembelajaran yang disusun untuk mendukung pemahaman konseptual dan penerapan praktis melalui konten, latihan, dan evaluasi.",
    imageId: "sifonix-mockup-4",
  },
  {
    title: "Academic Community",
    description: "Lingkungan belajar kolaboratif yang mendorong pertukaran pengetahuan, diskusi akademik, dan penguatan pemahaman antar peserta.",
    imageId: "sifonix-mockup-5",
  },
  {
    title: "Lesson Content",
    description: "Halaman ini menyajikan materi pembelajaran yang telah dipilih, termasuk penjelasan utama, media pendukung, dan referensi.",
    imageId: "sifonix-mockup-6",
  },
  {
    title: "Academic Learning Assistant",
    description: "Asisten pembelajaran yang membantu menjawab pertanyaan, memberikan penjelasan tambahan, dan membimbing pengguna selama proses belajar.",
    imageId: "sifonix-mockup-7",
  }
];


function SolutionShowcase() {
  return (
    <div id="solution" className="bg-muted/10">
      <div className="container text-center py-20 md:py-28 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Solusi Desain E-Learning yang Berpusat pada Pengguna</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Memperkenalkan platform e-learning yang intuitif, menarik, dan aksesibel, dirancang untuk mengubah cara siswa belajar. Sebuah perjalanan visual fitur-fitur utama Sifonix.
        </p>
      </div>

      <div className="relative">
        {solutionSteps.map((step, index) => (
          <FeatureScene
            key={step.imageId}
            index={index}
            title={step.title}
            description={step.description}
            imageId={step.imageId}
            isOdd={index % 2 !== 0}
          />
        ))}
      </div>
    </div>
  );
}

function FeatureScene({ index, title, description, imageId, isOdd }: { index: number, title: string, description: string, imageId: string, isOdd: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const { images: dynamicImages } = useDynamicPageImages('sifonix');
  const imageUrl = dynamicImages[imageId]?.imageUrl;


  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const mockupVariants = {
    hidden: { opacity: 0, x: isOdd ? 100 : -100, scale: 0.9 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <section
      ref={ref}
      className={cn(
        "relative h-screen min-h-[700px] w-full flex items-center overflow-hidden px-4 md:px-8",
        isOdd ? "bg-muted/30" : "bg-muted/10"
      )}
    >
      <motion.div
        className={cn(
          "container mx-auto grid md:grid-cols-2 gap-12 items-center",
        )}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
      >
        {/* Decorative Number */}
        <motion.div
          className="absolute -bottom-1/4 -right-1/4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 text-[20rem] font-black text-muted-foreground/50 -z-0"
          style={{ right: isOdd ? 'auto' : '-25%', left: isOdd ? '-25%' : 'auto' }}
          initial={{ opacity: 0, y: 100 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
        >
          0{index + 1}
        </motion.div>

        {/* Left Column (Mockup or Text) */}
        <div className={cn("relative z-10", isOdd && "md:order-2")}>
          <motion.div variants={mockupVariants}>
            <div className="relative mx-auto border-[#0a0a0a] bg-[#0a0a0a] border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl">
              <div className="w-[100px] h-[18px] bg-[#0a0a0a] top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
              <div className="h-[32px] w-[3px] bg-[#0a0a0a] absolute -left-[17px] top-[124px] rounded-l-lg"></div>
              <div className="h-[32px] w-[3px] bg-[#0a0a0a] absolute -left-[17px] top-[178px] rounded-l-lg"></div>
              <div className="h-[45px] w-[3px] bg-[#0a0a0a] absolute -right-[17px] top-[142px] rounded-r-lg"></div>
              <div className="rounded-[2rem] overflow-hidden w-full h-full bg-background relative">
                {imageUrl &&
                  <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover object-top"
                  />
                }
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column (Text or Mockup) */}
        <div className={cn("relative z-10 space-y-6 text-center md:text-left", isOdd && "md:order-1")}>
          <motion.h3 variants={textVariants} className="font-bold text-3xl md:text-4xl text-foreground">
            {index === 0 ? (
              <>
                Landing Page <span className="text-primary">NEUROVIA</span>
              </>
            ) : (
              title
            )}
          </motion.h3>
          <motion.p variants={textVariants} className="text-muted-foreground text-lg max-w-md mx-auto md:mx-0">
            {description}
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}


export default function SifonixPortfolioPage() {
  const { images: dynamicImages } = useDynamicPageImages('sifonix');
  const heroUrl = dynamicImages['achievement-elearning-winner']?.imageUrl;
  const wireframeUrl = dynamicImages['sifonix-wireframe']?.imageUrl;
  const certificateUrl = dynamicImages['sifonix-certificate']?.imageUrl;
  const groupPhotoUrl = dynamicImages['sifonix-group-photo']?.imageUrl;

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
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
                JUARA 2
                <span className="block text-3xl md:text-4xl font-semibold text-foreground mt-2">DESAIN E-LEARNING INOVATIF</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground font-medium">Tim Sifonix - Universitas Mercu Buana</p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-center md:justify-start gap-3 text-foreground">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  <span className="font-semibold">Kompetisi UI/UX Challenge - Nasional 2025</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 text-foreground">
                  <FolderKanban className="h-6 w-6 text-muted-foreground" />
                  <span className="font-semibold">Kategori: Pendidikan & Teknologi</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 text-foreground">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                  <span className="font-semibold">Tanggal Kemenangan: 24 April 2025</span>
                </div>
              </div>

              <Button asChild size="lg" className="mt-10 bg-primary hover:bg-primary/90 text-primary-foreground">
                <a href="#solution">Lihat Desain Proyek <ArrowRight className="ml-2" /></a>
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
                  alt="Tim Sifonix - Juara 2 Nasional"
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
              Bukti formal pengakuan atas dedikasi dan keunggulan teknis yang dicapai oleh Tim Sifonix dalam kompetisi desain tingkat nasional.
            </p>
          </div>
          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="overflow-hidden shadow-2xl border-muted">
              <CardContent className="p-0">
                {certificateUrl && (
                  <Image
                    src={certificateUrl}
                    alt="Sertifikat Penghargaan Sifonix"
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.section>

      {/* Group Photo Section */}
      <motion.section
        id="batch-photo"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="py-20 md:py-28 bg-background"
      >
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Sistem Informasi Universitas Mercu Buana</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Kebersamaan dan semangat kolaborasi angkatan 2024 dalam menumbuhkan inovasi dan keunggulan akademik di lingkungan Universitas Mercu Buana.
            </p>
          </div>
          <div className="mt-12 max-w-5xl mx-auto">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-8 border-muted">
              {groupPhotoUrl && (
                <Image
                  src={groupPhotoUrl}
                  alt="Foto Bersama Angkatan SI UMB 2024"
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-sm font-bold uppercase tracking-widest">Community Record</p>
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  <p className="text-2xl font-headline font-bold text-primary">SI UMB Class of 2024</p>
                </div>
              </div>
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
              Platform e-learning konvensional seringkali gagal mempertahankan minat belajar siswa karena antarmuka yang kaku, kurangnya interaksi, dan pengalaman yang monoton. Hal ini menyebabkan rendahnya tingkat penyelesaian kursus dan efektivitas pembelajaran.
            </p>
          </div>

          {/* Proses Desain */}
          <div className="mt-20 max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold tracking-tight text-center text-foreground mb-12">Proses Desain (UX/UI) Kami</h3>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="relative h-80 w-full">
                {wireframeUrl && <ImageWithSkeleton src={wireframeUrl} alt="Proses Wireframing" fill className="rounded-lg object-cover shadow-lg" />}
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-lg">Riset Pengguna (User Research)</h4>
                    <p className="text-muted-foreground">Mewawancarai siswa dan pengajar untuk mengidentifikasi pain points utama dalam pembelajaran online.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-lg">Wireframing & Prototyping</h4>
                    <p className="text-muted-foreground">Merancang alur pengguna dan tata letak low-fidelity untuk memvalidasi konsep desain awal.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-lg">User Testing & Iterasi</h4>
                    <p className="text-muted-foreground">Menguji prototipe interaktif dengan pengguna nyata dan melakukan perbaikan berulang berdasarkan feedback.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Solusi (Desain Final) */}
      <SolutionShowcase />

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/10">
        <div className="container text-center max-w-2xl mx-auto">
        </div>
      </section>

    </div>
  );
}
