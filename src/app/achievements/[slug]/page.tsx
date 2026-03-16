'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Achievement } from '@/types/content';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Lazy-imported templates
import dynamic from 'next/dynamic';

const CompetitionTemplate = dynamic(() => import('./templates/CompetitionTemplate'), { ssr: false });
const ProductTemplate = dynamic(() => import('./templates/ProductTemplate'), { ssr: false });
const ResearchTemplate = dynamic(() => import('./templates/ResearchTemplate'), { ssr: false });
const EventTemplate = dynamic(() => import('./templates/EventTemplate'), { ssr: false });
const EsportsTemplate = dynamic(() => import('./templates/EsportsTemplate'), { ssr: false });

export default function AchievementPortfolioPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const firestore = useFirestore();

    const [achievement, setAchievement] = useState<Achievement | null>(null);
    const [status, setStatus] = useState<'loading' | 'found' | 'not-found'>('loading');

    useEffect(() => {
        if (!firestore || !slug) return;

        const fetchAchievement = async () => {
            try {
                const q = query(
                    collection(firestore, 'achievements'),
                    where('portfolioSlug', '==', slug),
                    limit(1)
                );
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    setAchievement({ id: doc.id, ...doc.data() } as Achievement);
                    setStatus('found');
                } else {
                    setStatus('not-found');
                }
            } catch (err) {
                console.error('Error fetching portfolio:', err);
                setStatus('not-found');
            }
        };

        fetchAchievement();
    }, [firestore, slug]);

    // Loading
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground text-sm animate-pulse font-bold uppercase tracking-widest">Loading Portfolio...</p>
            </div>
        );
    }

    // Not found
    if (status === 'not-found' || !achievement) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6 text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <p className="text-8xl font-headline font-black text-muted-foreground/10">404</p>
                    <h1 className="text-2xl font-bold">Portfolio Not Found</h1>
                    <p className="text-muted-foreground max-w-sm">
                        Halaman portfolio <span className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">{slug}</span> tidak ditemukan atau belum dipublikasikan.
                    </p>
                    <Button asChild className="mt-4">
                        <Link href="/achievements"><ChevronLeft className="mr-2 h-4 w-4" />Kembali ke Achievements</Link>
                    </Button>
                </motion.div>
            </div>
        );
    }

    // Render the appropriate template
    const template = achievement.portfolioTemplate;

    if (template === 'competition') {
        return <CompetitionTemplate achievement={achievement} />;
    }
    if (template === 'product') {
        return <ProductTemplate achievement={achievement} />;
    }
    if (template === 'research') {
        return <ResearchTemplate achievement={achievement} />;
    }
    if (template === 'event') {
        return <EventTemplate achievement={achievement} />;
    }
    if (template === 'esports') {
        return <EsportsTemplate achievement={achievement} />;
    }

    // Fallback: template not set but slug exists
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6 text-center px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-headline font-bold mb-4">{achievement.title}</h1>
                <p className="text-muted-foreground mb-6">{achievement.description}</p>
                <p className="text-xs text-muted-foreground/50 uppercase tracking-widest mb-6">Template not assigned. Set a portfolio template in the admin panel.</p>
                <Button asChild variant="outline">
                    <Link href="/achievements"><ChevronLeft className="mr-2 h-4 w-4" />Back to Achievements</Link>
                </Button>
            </motion.div>
        </div>
    );
}
