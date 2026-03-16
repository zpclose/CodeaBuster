'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const fontWeights = [
  { name: 'Thin', value: 100, className: 'font-thin' },
  { name: 'Light', value: 300, className: 'font-light' },
  { name: 'Regular', value: 400, className: 'font-normal' },
  { name: 'Medium', value: 500, className: 'font-medium' },
  { name: 'Semibold', value: 600, className: 'font-semibold' },
  { name: 'Bold', value: 700, className: 'font-bold' },
  { name: 'Extrabold', value: 800, className: 'font-extrabold' },
  { name: 'Black', value: 900, className: 'font-black' },
];

const fontSizes = [
  { name: 'Display XL', size: '7.5rem', className: 'text-[7.5rem]', lineHeight: 'leading-none' },
  { name: 'Display LG', size: '6rem', className: 'text-[6rem]', lineHeight: 'leading-none' },
  { name: 'Display MD', size: '4.5rem', className: 'text-[4.5rem]', lineHeight: 'leading-[0.9]' },
  { name: 'Display SM', size: '3.75rem', className: 'text-[3.75rem]', lineHeight: 'leading-[0.9]' },
  { name: 'Heading 1', size: '3rem', className: 'text-5xl md:text-6xl', lineHeight: 'leading-tight' },
  { name: 'Heading 2', size: '2.25rem', className: 'text-4xl', lineHeight: 'leading-tight' },
  { name: 'Heading 3', size: '1.875rem', className: 'text-3xl', lineHeight: 'leading-tight' },
  { name: 'Heading 4', size: '1.5rem', className: 'text-2xl', lineHeight: 'leading-tight' },
  { name: 'Body LG', size: '1.125rem', className: 'text-lg', lineHeight: 'leading-relaxed' },
  { name: 'Body MD', size: '1rem', className: 'text-base', lineHeight: 'leading-relaxed' },
  { name: 'Body SM', size: '0.875rem', className: 'text-sm', lineHeight: 'leading-normal' },
  { name: 'Body XS', size: '0.75rem', className: 'text-xs', lineHeight: 'leading-normal' },
];

const letterSpacings = [
  { name: 'Tighter', value: '-0.05em', className: 'tracking-tighter' },
  { name: 'Tight', value: '-0.025em', className: 'tracking-tight' },
  { name: 'Normal', value: '0', className: 'tracking-normal' },
  { name: 'Wide', value: '0.025em', className: 'tracking-wide' },
  { name: 'Wider', value: '0.05em', className: 'tracking-wider' },
  { name: 'Widest', value: '0.1em', className: 'tracking-widest' },
];

function AnimatedSection({ title, children }: { title: string; children: React.ReactNode }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <motion.section 
      ref={ref}
      className="min-h-screen flex flex-col justify-center py-24 px-6 md:px-12 border-b border-border/20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h2 
        style={{ y }}
        className="text-sm font-bold uppercase tracking-[0.3em] text-primary mb-16"
      >
        {title}
      </motion.h2>
      {children}
    </motion.section>
  );
}

export default function TypographyPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero - Fullscreen */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-6xl"
        >
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-primary">Design System</span>
          <h1 className="font-headline text-7xl md:text-9xl lg:text-[10rem] font-black tracking-tighter leading-[0.8] mt-6 mb-8">
            TYPE
            <br />
            <span className="text-muted-foreground/30">GRAPHY</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
            Sistem tipografi yang digunakan dalam platform Codebusters. Dirancang untuk keterbacaan optimal dan estetika modern.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
            <span className="text-[10px] uppercase tracking-widest">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-muted-foreground/50 to-transparent" />
          </div>
        </motion.div>
      </section>

      {/* Font Sizes */}
      <AnimatedSection title="Type Scale">
        <div className="space-y-16">
          {fontSizes.map((font) => (
            <div key={font.name} className="flex items-baseline gap-8">
              <div className="w-32 md:w-48 flex-shrink-0">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">{font.name}</span>
                <p className="text-[10px] text-muted-foreground/50 mt-1">{font.size}</p>
              </div>
              <div className={`${font.className} ${font.lineHeight} font-headline`}>
                Codebusters
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* Font Weights */}
      <AnimatedSection title="Font Weights">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {fontWeights.map((font) => (
            <div key={font.name} className="space-y-4">
              <div className={`text-5xl font-headline ${font.className}`}>
                Aa
              </div>
              <div>
                <p className="font-bold text-lg">{font.name}</p>
                <p className="text-sm text-muted-foreground">Weight: {font.value}</p>
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* Letter Spacing */}
      <AnimatedSection title="Letter Spacing">
        <div className="space-y-12">
          {letterSpacings.map((spacing) => (
            <div key={spacing.name} className="flex items-center gap-8">
              <div className="w-32 flex-shrink-0">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">{spacing.name}</span>
                <p className="text-[10px] text-muted-foreground/50 mt-1">{spacing.value}</p>
              </div>
              <p className={`text-4xl font-headline font-bold ${spacing.className}`}>
                Impact Archive
              </p>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* Headlines Showcase */}
      <AnimatedSection title="Headlines">
        <div className="space-y-20">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">Display Large</p>
            <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              Meet The <span className="text-primary">Architects</span>
            </h1>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">Display Medium</p>
            <h2 className="font-headline text-5xl md:text-6xl font-bold tracking-tight uppercase">
              Impact <span className="text-muted-foreground/30">Archive.</span>
            </h2>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">Section Title</p>
            <h3 className="font-headline text-4xl md:text-5xl font-bold">
              Keputus<span className="text-primary">an</span> &amp; Inisiatif
            </h3>
          </div>
        </div>
      </AnimatedSection>

      {/* Body Text */}
      <AnimatedSection title="Body Text">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-8">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Regular Body</p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Website ini dibuat oleh Codebusters sebagai pusat informasi resmi untuk memperkuat identitas komunitas dan menyediakan ruang yang terstruktur untuk aktivitas, dokumentasi, dan kolaborasi anggota.
            </p>
          </div>
          <div className="space-y-8">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Small Body</p>
            <p className="text-sm leading-normal text-muted-foreground">
              Tim inti Tel-Nect dibentuk melalui proses seleksi dan pengembangan yang terstruktur di lingkungan Codebusters. Tanggung jawab atas pengembangan, pemeliharaan, dan pengamanan platform ini diemban dengan mengedepankan standar akademik, ketelitian teknis, serta praktik rekayasa perangkat lunak yang dapat dipertanggungjawabkan.
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Colors with Typography */}
      <AnimatedSection title="Color Typography">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="h-32 bg-primary rounded-lg" />
            <div>
              <p className="font-bold">Primary</p>
              <p className="text-sm text-muted-foreground">Used for main actions, highlights, and key visual elements.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-32 bg-foreground rounded-lg" />
            <div>
              <p className="font-bold">Foreground</p>
              <p className="text-sm text-muted-foreground">Main text color for headings and important content.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-32 bg-muted-foreground/60 rounded-lg" />
            <div>
              <p className="font-bold">Muted</p>
              <p className="text-sm text-muted-foreground">Secondary text, descriptions, and supporting content.</p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Special Characters */}
      <AnimatedSection title="Special Characters">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {['{ }', '< >', '[ ]', '( )', '/', '#', '@', '&'].map((char) => (
            <div key={char} className="text-center p-8 border border-border rounded-lg">
              <p className="text-5xl font-mono font-bold">{char}</p>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* Footer */}
      <section className="py-24 px-6 md:px-12 bg-background border-t border-border/20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-widest mb-4">End of Guide</p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6">
            Crafted with <span className="text-primary">Precision</span>
          </h2>
          <p className="text-muted-foreground">
            Sistem tipografi ini digunakan secara konsisten di seluruh platform Codebusters untuk memastikan pengalaman pengguna yang harmonis dan profesional.
          </p>
        </div>
      </section>
    </div>
  );
}
