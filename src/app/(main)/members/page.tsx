
'use client';

import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight, BrainCircuit, Briefcase, Handshake, Trophy, Gem } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

const privileges = [
  {
    icon: <BrainCircuit className="h-8 w-8 text-amber-400" />,
    privilege: 'Akses ke Jaringan Talenta Elite',
    description: 'Terhubung dengan mahasiswa, alumni, dan mentor terpilih dari dua institusi teknologi terkemuka.'
  },
  {
    icon: <Briefcase className="h-8 w-8 text-amber-400" />,
    privilege: 'Peluang Karir & Magang Prioritas',
    description: 'Dapatkan akses eksklusif ke lowongan di perusahaan mitra teknologi kami sebelum dibuka untuk umum.'
  },
  {
    icon: <Handshake className="h-8 w-8 text-amber-400" />,
    privilege: 'Program Mentorship Lintas Kampus',
    description: 'Dapatkan bimbingan 1-on-1 dengan praktisi industri dan akademisi dari kedua universitas.'
  },
  {
    icon: <Trophy className="h-8 w-8 text-amber-400" />,
    privilege: 'Validasi & Sertifikasi Proyek',
    description: 'Proyek Anda akan divalidasi dengan standar industri dan mendapatkan sertifikasi yang diakui.'
  }
];

import { useTeamMembers } from '@/hooks/useTeamMembers';
import { Loader2 } from 'lucide-react';

export default function MembersPage() {
  const { members, isLoading } = useTeamMembers({ activeOnly: true });

  const testimonials = useMemo(() => {
    return members
      .filter(m => m.quote)
      .map(m => ({
        id: m.id,
        name: m.name,
        university: m.university,
        quote: m.quote!,
        imageUrl: m.imageUrl,
        imageHint: 'member avatar'
      }))
      .slice(0, 4); // Limit to top 4 with quotes
  }, [members]);

  const telkomLogo = PlaceHolderImages.find(p => p.id === 'telkom-university-logo-potrait');
  const mercuBuanaLogo = PlaceHolderImages.find(p => p.id === 'mercu-buana-logo-square');

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut", staggerChildren: 0.15 } },
  };

  return (
    <div className="bg-gray-900 text-gray-200">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="relative py-32 md:py-48 overflow-hidden text-center bg-black"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }}></div>
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 40,
              ease: "linear",
              repeat: Infinity,
            }}
            style={{
              backgroundImage: 'radial-gradient(ellipse 80% 80% at 50% -20%,rgba(220, 38, 38, 0.3), transparent), radial-gradient(ellipse 80% 80% at 50% 120%,rgba(59, 130, 246, 0.2), transparent)',
            }}
          />
        </div>
        <div className="container relative z-10">
          <motion.h1
            variants={sectionVariants}
            className="font-headline text-5xl font-bold md:text-7xl lg:text-8xl text-white"
            style={{ textShadow: '0 0 15px rgba(252, 211, 77, 0.4), 0 0 5px rgba(252, 211, 77, 0.3)' }}
          >
            The Architects of Innovation
          </motion.h1>
          <motion.p
            variants={sectionVariants}
            className="mt-6 max-w-2xl mx-auto text-lg text-gray-300 md:text-xl"
          >
            Sebuah komunitas pilihan yang terdiri dari para pemikir, pencipta, dan pemimpin masa depan, disatukan oleh hasrat untuk teknologi.
          </motion.p>
        </div>
      </motion.section>

      {/* DNA Section */}
      <motion.section
        className="py-20 md:py-28"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="container text-center max-w-4xl mx-auto">
          <h2 className="font-headline text-3xl font-bold md:text-4xl text-white">Two Foundations, One Vision</h2>
          <p className="mt-4 text-lg text-gray-400">
            Codebusters adalah perpaduan unik dari dua budaya akademik yang kuat, menciptakan ekosistem inovasi yang seimbang antara keunggulan teknis dan kreativitas industri.
          </p>
        </div>
        <div className="container mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <motion.div variants={sectionVariants}>
            <Card className="h-full flex flex-col p-8 items-center text-center bg-gray-900/50 border-primary/50 backdrop-blur-sm shadow-xl shadow-primary/10">
              {telkomLogo && <ImageWithSkeleton src={telkomLogo.imageUrl} alt="Telkom University Logo" width={48} height={48} className="h-12 w-auto object-contain mb-6 filter-white" />}
              <CardHeader className="p-0">
                <CardTitle className="font-headline text-2xl text-white">The Telkom Foundation</CardTitle>
                <p className="text-primary font-semibold">Engineering & Foundational Excellence</p>
              </CardHeader>
              <CardContent className="p-0 mt-4 flex-grow">
                <p className="text-gray-400">Membawa fondasi ICT yang kokoh, metodologi terstruktur, dan akses ke ekosistem teknologi terdepan untuk memastikan setiap solusi dibangun di atas dasar yang solid.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={sectionVariants}>
            <Card className="h-full flex flex-col p-8 items-center text-center bg-gray-900/50 border-accent/50 backdrop-blur-sm shadow-xl shadow-accent/10">
              {mercuBuanaLogo && <ImageWithSkeleton src={mercuBuanaLogo.imageUrl} alt="Universitas Mercu Buana Logo" width={48} height={48} className="h-12 w-auto object-contain mb-6 filter-white" />}
              <CardHeader className="p-0">
                <CardTitle className="font-headline text-2xl text-white">The Mercu Buana Catalyst</CardTitle>
                <p className="text-accent font-semibold">Creative & Industrial Dynamism</p>
              </CardHeader>
              <CardContent className="p-0 mt-4 flex-grow">
                <p className="text-gray-400">Menyuntikkan dinamisme industri, perspektif bisnis yang tajam, dan keahlian dalam desain produk digital yang berpusat pada pengalaman pengguna.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* Privileges Section */}
      <motion.section
        className="py-20 md:py-28"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-headline text-3xl font-bold md:text-4xl text-white">Exclusive Member Privileges</h2>
            <p className="mt-4 text-lg text-gray-400">
              Menjadi anggota Codebusters bukan hanya tentang coding—ini tentang akses, pertumbuhan, dan peluang.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {privileges.map((privilege, index) => (
              <motion.div key={index} variants={sectionVariants}>
                <div className="flex items-start gap-6 p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg h-full">
                  <div className="flex-shrink-0 mt-1">{privilege.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold font-headline text-white">{privilege.privilege}</h3>
                    <p className="mt-1 text-gray-400">{privilege.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        className="py-20 md:py-28"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-headline text-3xl font-bold md:text-4xl text-white">Voices From Within</h2>
            <p className="mt-4 text-lg text-gray-400">
              Pengalaman nyata dari para anggota yang telah merasakan langsung manfaat dari kolaborasi unik ini.
            </p>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-10 w-10 animate-spin text-amber-400" />
            </div>
          ) : (
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {testimonials.map((testimonial) => {
                const isTelkom = testimonial.university === 'Telkom University';

                return (
                  <motion.div key={testimonial.id} variants={sectionVariants}>
                    <Card className="relative p-8 h-full flex flex-col justify-center bg-gray-800 border-gray-700">
                      <Gem className="absolute top-4 right-4 h-8 w-8 text-amber-400/20" />
                      <blockquote className="text-gray-300 text-xl italic font-serif z-10">
                        &quot;{testimonial.quote}&quot;
                      </blockquote>
                      <div className="mt-6 flex items-center gap-4 z-10">
                        {testimonial.imageUrl && (
                          <ImageWithSkeleton
                            src={testimonial.imageUrl}
                            alt={`Photo of ${testimonial.name}`}
                            width={56}
                            height={56}
                            className="rounded-full object-cover h-14 w-14 border-2 border-gray-900"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-white">{testimonial.name}</p>
                          <p className={`text-sm font-medium ${isTelkom ? 'text-primary' : 'text-accent'}`}>{testimonial.university}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 md:py-28 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <div className="container max-w-2xl mx-auto">
          <h2 className="font-headline text-3xl font-bold md:text-4xl text-white">Ready to Join The Elite?</h2>
          <p className="mt-4 text-lg text-gray-400">
            Jadilah bagian dari jaringan talenta digital terkemuka dan mulailah membangun masa depan Anda bersama kami.
          </p>
          <Button size="lg" className="mt-8 bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20" asChild>
            <a href="/register">Become a Member <ArrowRight className="ml-2" /></a>
          </Button>
        </div>
      </motion.section>
    </div>
  );
}
