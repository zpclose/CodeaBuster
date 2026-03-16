
'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Globe, ArrowRight, ShieldCheck, BookCopy, Users, Building, MapPin, Search, GitCommit, Database, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNetworkPartners } from '@/hooks/useNetworkPartners';
import { useDynamicPageImages } from '@/hooks/useDynamicPageImages';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Static partners removed, now using useNetworkPartners hook

// regions moved inside NetworkPage for dynamic calculation

const qualityStandards = [
  {
    number: '01',
    title: 'Kurikulum Sentral',
    description: 'Semua cabang menggunakan kurikulum terverifikasi Tel-Nect yang selaras dengan tuntutan industri global.',
  },
  {
    number: '02',
    title: 'Transfer Sertifikat',
    description: 'Sertifikasi dan pencapaian diakui di seluruh jaringan, memungkinkan mobilitas dan kolaborasi.',
  },
  {
    number: '03',
    title: 'Akses Mentor Bersama',
    description: 'Mahasiswa di semua cabang memiliki akses ke pool mentor elite yang sama untuk bimbingan ahli.',
  },
  {
    number: '04',
    title: 'Validasi Proyek Lintas Chapter',
    description: 'Setiap proyek harus melewati tinjauan oleh anggota dari cabang lain untuk menjaga standar kualitas tertinggi.',
  },
  {
    number: '05',
    title: 'Pengembangan Repositori Terpusat',
    description: 'Akses ke basis kode, komponen, dan sumber daya terpusat untuk mempercepat pengembangan proyek.',
  },
  {
    number: '06',
    title: 'Kontribusi Forking Proyek',
    description: 'sistem yang memudahkan anggota untuk melakukan forking dan berkontribusi pada chapter lain',
  },
];

export default function NetworkPage() {
  const { partners: campusPartners, isLoading } = useNetworkPartners({ activeOnly: true });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRegion, setActiveRegion] = useState('Semua');

  const regions = useMemo(() => {
    const uniqueRegions = Array.from(new Set(campusPartners.map(p => p.region)));
    return ['Semua', ...uniqueRegions.sort()];
  }, [campusPartners]);

  const { images: dynamicImages } = useDynamicPageImages('global');
  const telkomCampusImage = PlaceHolderImages.find(p => p.id === 'telkom-legacy');
  const telkomLogoUrl = dynamicImages['telkom-university-logo-potrait']?.imageUrl;

  const filteredPartners = useMemo(() => {
    return campusPartners.filter(partner => {
      const regionMatch = activeRegion === 'Semua' || partner.region === activeRegion;
      const searchMatch = partner.name.toLowerCase().includes(searchTerm.toLowerCase());
      return regionMatch && searchMatch;
    });
  }, [campusPartners, searchTerm, activeRegion]);

  const groupedByRegion = useMemo(() => {
    return filteredPartners.reduce((acc, partner) => {
      (acc[partner.region] = acc[partner.region] || []).push(partner);
      return acc;
    }, {} as Record<string, typeof campusPartners>);
  }, [filteredPartners]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, duration: 0.5 } },
  };

  return (
    <div className="bg-background text-foreground">
      {/* SECTION 1: HEADER & NETWORK MANIFESTO */}
      <motion.section
        className="relative py-20 md:py-24 bg-card text-foreground overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <div className="container relative z-10 grid md:grid-cols-1 gap-12 items-center">
          <div className="text-center md:text-left">
            <motion.h1 variants={sectionVariants} className="font-headline text-4xl font-bold md:text-5xl lg:text-6xl">
              The Codebusters Network
              <span className="block text-2xl md:text-3xl font-normal mt-2 text-primary">Global Reach, Local Excellence</span>
            </motion.h1>
            <motion.p variants={sectionVariants} className="mt-6 max-w-xl mx-auto md:mx-0 text-lg text-muted-foreground">
              Ekosistem keahlian yang terverifikasi, membentang melintasi institusi terkemuka, menjamin standar kualitas kurikulum dan talenta yang seragam.
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* SECTION 2: THE FOUNDING CHAPTER (TELKOM UNIVERSITY) */}
      <motion.section
        className="py-16 md:py-24 bg-background"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="container grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
            {telkomCampusImage && (
              <Image src={telkomCampusImage.imageUrl} alt="Telkom University Campus" fill className="object-cover" />
            )}
          </div>
          <div>
            <h2 className="font-headline text-3xl font-bold">Telkom University</h2>
            <p className="mt-4 text-muted-foreground">
              Codebusters lahir dari visi Telkom University untuk menciptakan standar baru dalam pendidikan teknologi. Kurikulum dan metodologi yang dikembangkan di sini menjadi tolok ukur kualitas untuk semua cabang di dalam komunitas.
            </p>
            <div className="mt-6 bg-card border-l-4 border-primary p-4 rounded-r-lg">
              <p className="font-semibold text-foreground">Fokus Spesialisasi Chapter Telkom:</p>
              <p className="text-primary font-medium">Pusat Keunggulan untuk AI & Cloud Architecture.</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 3: DAFTAR CABANG BERDASARKAN REGION */}
      <motion.section
        className="py-16 md:py-24 bg-card"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-headline text-3xl font-bold md:text-4xl">Daftar Kampus Mitra Resmi</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Jelajahi setiap cabang dalam jaringan kami, masing-masing dengan fokus unik namun terikat oleh standar keunggulan yang sama.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="mb-8 p-4 bg-background border rounded-lg shadow-sm space-y-4 max-w-4xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama kampus..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {regions.map(region => (
                    <Button
                      key={region}
                      variant={activeRegion === region ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveRegion(region)}
                    >
                      {region}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="max-w-4xl mx-auto">
                <Accordion type="single" collapsible defaultValue={Object.keys(groupedByRegion)[0]} className="w-full">
                  {Object.entries(groupedByRegion).map(([region, partners]) => (
                    <AccordionItem value={region} key={region}>
                      <AccordionTrigger className="text-xl font-headline hover:no-underline">
                        {region}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {partners.map(partner => {
                            const fallbackImage = PlaceHolderImages.find(p => p.id === (partner as any).image);
                            const displayImage = partner.imageUrl || fallbackImage?.imageUrl;
                            return (
                              <Card key={partner.id || partner.name} className="overflow-hidden transition-shadow hover:shadow-lg">
                                <div className="grid sm:grid-cols-3 items-center">
                                  <div className="relative h-40 sm:h-full w-full sm:col-span-1">
                                    {displayImage && <Image src={displayImage} alt={partner.name} fill className="object-cover" unoptimized />}
                                  </div>
                                  <div className="p-6 sm:col-span-2">
                                    <CardTitle className="font-headline text-xl flex items-center gap-2">
                                      <Building className="h-5 w-5 text-primary" /> {partner.name}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-2 mt-1">
                                      <MapPin className="h-4 w-4" /> {partner.city}
                                    </p>
                                    <div className="mt-4 space-y-2 text-sm">
                                      <p><span className="font-semibold">Spesialisasi:</span> {partner.specialization}</p>
                                      <p><span className="font-semibold">Status:</span>
                                        <span className={`ml-2 font-medium ${partner.status === 'Founding Chapter' ? 'text-primary' : 'text-blue-500'}`}>
                                          {partner.status} (Sejak {partner.established})
                                        </span>
                                      </p>
                                    </div>
                                    <div className="mt-4">
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="outline" size="sm">
                                            Lihat Kegiatan Cabang <ArrowRight className="ml-2 h-4 w-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Under Construction</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              We&apos;re sorry, but this page is currently under construction. Please check back later.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogAction>OK</AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            )
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                {filteredPartners.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <p>Tidak ada kampus mitra yang cocok dengan filter Anda.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </motion.section>

      {/* SECTION 4: STANDAR KUALITAS */}
      <motion.section
        className="py-16 md:py-24 bg-background"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-headline text-3xl font-bold md:text-4xl">Standar Codebusters</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Setiap kampus mitra diwajibkan untuk mematuhi kerangka kerja kualitas yang sama, memastikan setiap anggota mendapatkan pengalaman dan hasil yang setara.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {qualityStandards.map((standard, index) => (
              <motion.div
                key={standard.title}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group flex flex-col h-full text-center p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-card">
                  <CardHeader className="items-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-black text-primary group-hover:bg-primary/20 transition-colors">
                      {standard.number}
                    </div>
                    <CardTitle className="font-headline text-xl mt-4">{standard.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{standard.description}</p>
                  </CardContent>
                  <CardFooter>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
