
'use client';

import * as React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BrainCircuit, Code, ShieldCheck, Layers, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import ImageWithSkeleton from '@/components/ui/image-with-skeleton';

const programTracks = [
    {
        id: 'ai-ml',
        title: "AI/ML Specialist",
        category: "Kecerdasan Buatan",
        description: "Jalur intensif untuk menguasai pemodelan data, deep learning, dan implementasi solusi AI yang siap diimplementasikan di industri.",
        icon: <BrainCircuit className="h-8 w-8" />,
        keyLearnings: [
            "Fundamental Machine Learning & Statistik",
            "Deep Learning & Neural Networks (TensorFlow/PyTorch)",
            "Natural Language Processing (NLP) & Computer Vision",
            "Deployment Model AI dengan Skalabilitas Tinggi"
        ],
        skills: ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "NLP"],
        imageId: "ai-ml-background"
    },
    {
        id: 'full-stack',
        title: "Full-Stack Engineering",
        category: "Pengembangan Web",
        description: "Kurikulum lengkap untuk membangun aplikasi web modern yang skalabel, dari arsitektur backend hingga antarmuka pengguna yang responsif.",
        icon: <Code className="h-8 w-8" />,
        keyLearnings: [
            "Modern Front-End dengan React & Next.js",
            "Pengembangan Back-End dengan Node.js & Express",
            "Manajemen Database (SQL & NoSQL)",
            "Praktik DevOps, CI/CD, dan Deployment"
        ],
        skills: ["React", "Next.js", "Node.js", "TypeScript", "GraphQL", "Docker"],
        imageId: "projects-hero"
    },
    {
        id: 'cyber-sec',
        title: "Cyber Security Ops",
        category: "Keamanan Siber",
        description: "Program untuk melatih ahli keamanan siber yang mampu melakukan pengujian penetrasi, analisis forensik, dan respons insiden.",
        icon: <ShieldCheck className="h-8 w-8" />,
        keyLearnings: [
            "Etika Hacking & Pengujian Penetrasi",
            "Analisis Malware & Forensik Digital",
            "Keamanan Jaringan & Infrastruktur Cloud",
            "Manajemen Insiden & Respons Cepat"
        ],
        skills: ["Penetration Testing", "Metasploit", "Wireshark", "Forensik Digital"],
        imageId: "project-cyber-security"
    },
    {
        id: 'ui-ux',
        title: "UI/UX Product Design",
        category: "Desain Produk",
        description: "Fokus pada riset pengguna, desain antarmuka, dan prototyping untuk menciptakan produk digital yang unggul.",
        icon: <Layers className="h-8 w-8" />,
        keyLearnings: [
            "Metodologi Design Thinking & Riset Pengguna",
            "Wireframing & Prototyping Interaktif dengan Figma",
            "Prinsip Desain Visual & Sistem Desain",
            "Pengujian Usability & Iterasi Desain"
        ],
        skills: ["Figma", "Design Thinking", "User Research", "Prototyping"],
        imageId: "sifonix-wireframe"
    }
];

function ProgramCard({ track }: { track: typeof programTracks[0] }) {
    const cardRef = React.useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: cardRef,
        offset: ['start end', 'end start']
    });

    const imageY = useTransform(scrollYProgress, [0, 1], ['-20%', '20%']);
    const image = PlaceHolderImages.find(p => p.id === track.imageId);

    const contentVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: 'easeOut',
                staggerChildren: 0.1
            }
        },
    };

    const titleParts = track.title.split(' ');
    const mainTitle = titleParts.slice(0, -1).join(' ');
    const highlightedTitle = titleParts.slice(-1)[0];

    return (
        <motion.div
            ref={cardRef}
            className="relative h-screen min-h-[700px] w-full overflow-hidden flex items-center justify-center p-8 text-white"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={contentVariants}
        >
            {/* Background Image with Parallax */}
            <motion.div className="absolute inset-0 z-0" style={{ y: imageY }}>
                {image && <ImageWithSkeleton src={image.imageUrl} alt={track.title} fill className="object-cover" />}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            </motion.div>

            {/* Content */}
            <motion.div
                className="relative z-10 container mx-auto grid md:grid-cols-2 gap-12 items-center"
                variants={contentVariants}
            >
                <div className="space-y-6">
                    <motion.div variants={contentVariants}>
                        <Badge variant="secondary" className="bg-white/10 border-white/20 text-white backdrop-blur-md">{track.category}</Badge>
                    </motion.div>
                    <motion.h2
                        variants={contentVariants}
                        className="font-headline text-5xl md:text-6xl font-bold tracking-tight"
                        style={{ textShadow: '0 2px 15px rgba(0,0,0,0.5)' }}
                    >
                        {mainTitle} <span className="text-primary">{highlightedTitle}</span>
                    </motion.h2>
                    <motion.div
                        className="h-1.5 bg-primary rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: '50%' }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                        viewport={{ once: true }}
                    />
                    <motion.p variants={contentVariants} className="text-lg text-gray-300 max-w-lg">
                        {track.description}
                    </motion.p>
                </div>
                <div className="space-y-6">
                    <motion.h3 variants={contentVariants} className="font-semibold text-xl text-white">Poin Pembelajaran Utama</motion.h3>
                    <motion.ul variants={contentVariants} className="space-y-3">
                        {track.keyLearnings.map((learning, index) => (
                            <motion.li key={index} variants={contentVariants} className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                <span className="text-gray-300">{learning}</span>
                            </motion.li>
                        ))}
                    </motion.ul>
                    <motion.div variants={contentVariants} className="border-t border-white/10 pt-4 mt-6">
                        <h4 className="font-semibold mb-3 text-white">Keahlian yang Dibangun:</h4>
                        <div className="flex flex-wrap gap-2">
                            {track.skills.map(skill => (
                                <Badge key={skill} variant="secondary" className="border-transparent">{skill}</Badge>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function ProgramsPage() {
    return (
        <div className="bg-black">
            <main>
                {programTracks.map((track) => (
                    <ProgramCard key={track.id} track={track} />
                ))}
            </main>
        </div>
    );
}
