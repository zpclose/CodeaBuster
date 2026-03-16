
'use client';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Calendar, Tag, User, Pin, Clock, CheckCircle, Quote, Info, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

type Event = {
    slug: string;
    title: string;
    summary: string;
    body: string;
    quote: {
        text: string;
        author: string;
    };
    category: string;
    organizer: string;
    date: string;
    time: string;
    location: string;
    imageId: string | null;
    secondaryImageId: string | null;
    tags: string[];
    agenda: { time: string; description: string }[];
    keyTakeaways: string[];
    additionalInfo: {
        targetAudience: string;
        difficultyLevel: string;
        language: string;
        certificate: string;
    };
};

export default function EventDetailPageContent({ event }: { event: Event }) {
    
    const eventImage = event.imageId ? PlaceHolderImages.find(p => p.id === event.imageId) : null;
    const eventDate = new Date(event.date);

    const sectionVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { duration: 0.7, ease: "easeOut" } 
        },
    };

    const textRevealVariant = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number = 0) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
        })
    }

    return (
        <div className="bg-background text-foreground">
            {/* Hero Section */}
            <motion.section 
                className="relative h-screen flex flex-col justify-center items-center text-center text-white px-4"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: {
                        transition: {
                            staggerChildren: 0.1
                        }
                    }
                }}
            >
                {eventImage && (
                    <Image
                        src={eventImage.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover brightness-50"
                        priority
                    />
                )}
                <div className="relative z-10">
                    <motion.div variants={textRevealVariant} custom={0}>
                         <Badge variant="secondary" className="mb-4 text-base font-semibold tracking-wider bg-white/10 border-white/20 backdrop-blur-sm">{event.category}</Badge>
                    </motion.div>
                    <motion.h1 
                        variants={textRevealVariant}
                        custom={1}
                        className="font-headline text-5xl md:text-7xl font-bold max-w-4xl mx-auto"
                    >
                        {event.title}
                    </motion.h1>
                    <motion.p 
                        variants={textRevealVariant}
                        custom={2}
                        className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-200"
                    >
                        {event.summary}
                    </motion.p>
                </div>
                 <motion.div 
                    className="absolute bottom-12 left-1/2 -translate-x-1/2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                >
                    <ChevronDown className="h-10 w-10 text-white animate-bounce" />
                </motion.div>
            </motion.section>
            
            {/* Main Content Area */}
            <div className="container max-w-4xl mx-auto py-20 md:py-32">
                <div className="space-y-20">

                    {/* Description Section */}
                    <motion.section
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={sectionVariants}
                    >
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="md:col-span-1">
                                <h2 className="font-headline text-2xl font-bold">Deskripsi Acara</h2>
                                <Separator className="mt-2 w-1/4 bg-primary h-1"/>
                            </div>
                            <div className="md:col-span-3">
                                 <div 
                                    className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground"
                                    dangerouslySetInnerHTML={{ __html: event.body }} 
                                />
                            </div>
                         </div>
                    </motion.section>
                    
                    {/* Metadata Section */}
                    <motion.section
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={sectionVariants}
                    >
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                             <div className="flex flex-col items-center text-center">
                                <Calendar className="h-8 w-8 text-primary mb-3" />
                                <p className="font-semibold text-lg">{eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="text-muted-foreground text-sm">Tanggal</p>
                            </div>
                             <div className="flex flex-col items-center text-center">
                                <Clock className="h-8 w-8 text-primary mb-3" />
                                <p className="font-semibold text-lg">{event.time}</p>
                                <p className="text-muted-foreground text-sm">Waktu</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <Pin className="h-8 w-8 text-primary mb-3" />
                                <p className="font-semibold text-lg">{event.location}</p>
                                <p className="text-muted-foreground text-sm">Lokasi</p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <User className="h-8 w-8 text-primary mb-3" />
                                <p className="font-semibold text-lg">{event.organizer}</p>
                                <p className="text-muted-foreground text-sm">Penyelenggara</p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Quote Section */}
                    {event.quote && (
                        <motion.section 
                            className="text-center"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={sectionVariants}
                        >
                            <Quote className="h-12 w-12 text-primary/20 mx-auto" />
                            <blockquote className="mt-4 text-2xl md:text-3xl font-serif italic text-foreground/90 max-w-3xl mx-auto">
                                "{event.quote.text}"
                            </blockquote>
                            <footer className="mt-6 text-base font-semibold text-foreground/70">— {event.quote.author}</footer>
                        </motion.section>
                    )}

                    {/* Agenda Section */}
                    {event.agenda && event.agenda.length > 0 && (
                        <motion.section
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            variants={sectionVariants}
                        >
                            <h2 className="font-headline text-3xl font-bold text-center mb-12">Agenda Acara</h2>
                            <div className="relative border-l-2 border-primary/30 ml-6 md:ml-1/2 md:-translate-x-1/2">
                                {event.agenda.map((item, index) => (
                                     <motion.div 
                                        key={index}
                                        className="relative mb-12 pl-12"
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.15 }}
                                    >
                                        <div className="absolute -left-5 top-1 h-10 w-10 rounded-full bg-background border-4 border-primary flex items-center justify-center font-bold text-sm text-primary ring-8 ring-background">
                                            {index + 1}
                                        </div>
                                        <p className="text-base font-bold text-primary">{item.time}</p>
                                        <h3 className="text-xl font-semibold text-foreground mt-1">{item.description}</h3>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                    
                    {/* Key Info Section */}
                    <motion.section
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={sectionVariants}
                    >
                         <h2 className="font-headline text-3xl font-bold text-center mb-12">Informasi Tambahan</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card className="bg-card/50">
                                <CardHeader>
                                    <CardTitle className="font-headline text-xl flex items-center gap-3"><CheckCircle className="h-6 w-6 text-green-500"/> Poin Utama</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {event.keyTakeaways.map((takeaway, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                            <span className="text-muted-foreground">{takeaway}</span>
                                        </li>
                                    ))}
                                </CardContent>
                            </Card>
                             <Card className="bg-card/50">
                                <CardHeader>
                                    <CardTitle className="font-headline text-xl flex items-center gap-3"><Info className="h-6 w-6 text-blue-500"/> Detail Lainnya</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-muted-foreground">Target Audiens:</span>
                                        <span className="font-semibold text-right">{event.additionalInfo.targetAudience}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-muted-foreground">Level:</span>
                                        <span className="font-semibold text-right">{event.additionalInfo.difficultyLevel}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-muted-foreground">Bahasa:</span>
                                        <span className="font-semibold text-right">{event.additionalInfo.language}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-muted-foreground">Sertifikat:</span>
                                        <span className="font-semibold text-right">{event.additionalInfo.certificate}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.section>
                </div>
            </div>
        </div>
    );
}

