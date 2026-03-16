'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, where, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Trophy, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const hokAchievementData = {
  title: 'KCS Honor of Kings 2025',
  category: 'Kompetisi' as const,
  type: 'E-Sports',
  description: 'Tim Skyway berhasil menjadi Runner Up dalam kompetisi KCS Honor of Kings 2025 yang diselenggarakan di Universitas Mercu Buana. Tim ini berhasil mengharumkan nama institusi melalui strategi taktis yang matang dan koordinasi tim yang sangat baik.',
  year: 2025,
  team: 'Skyway',
  institution: 'Codebusters Mercu Buana',
  award: 'Runner Up',
  thumbnailUrl: 'https://firebasestorage.googleapis.com/v0/b/studio-8681629558-68f05.firebasestorage.app/o/HOK%20Achievement%2F321.jpeg?alt=media&token=1bffa2e0-0ef2-45d4-840a-20c609e267a9',
  isHallOfFame: true,
  isActive: true,
  order: 0,
  portfolioSlug: 'hok-portfolio',
};

export default function SeedHokAchievementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [hasData, setHasData] = useState<boolean | null>(null);

  const checkData = async () => {
    if (!firestore) {
      setIsLoading(false);
      return;
    }
    
    try {
      const q = query(
        collection(firestore, 'achievements'), 
        where('title', '==', 'KCS Honor of Kings 2025'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      setHasData(!snapshot.empty);
    } catch (err) {
      console.error('Check error:', err);
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  };

  const seedData = async () => {
    if (!firestore) return;
    setIsSeeding(true);
    
    try {
      if (hasData) {
        toast({ title: 'Info', description: 'Data HOK Achievement sudah ada di database!' });
        setIsSeeding(false);
        return;
      }

      await addDoc(collection(firestore, 'achievements'), {
        ...hokAchievementData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({ title: 'Berhasil', description: 'HOK Achievement berhasil ditambahkan!' });
      setHasData(true);
    } catch (error: any) {
      console.error('Seed error:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSeeding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border rounded-xl p-8 text-center space-y-6">
        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Trophy className="h-10 w-10 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Seed HOK Achievement</h1>
          <p className="text-muted-foreground text-sm">
            Tambahkan data achievement HOK ke database untuk ditampilkan di halaman Pencapaian.
          </p>
        </div>

        {hasData && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Data sudah ada!</span>
          </div>
        )}

        <Button 
          onClick={seedData} 
          disabled={isSeeding || hasData}
          className="w-full"
        >
          {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {hasData ? 'Sudah Ditambahkan' : 'Tambah ke Database'}
        </Button>

        <Button variant="outline" asChild className="w-full">
          <a href="/admin/content/achievements">Kembali ke Kelola Achievements</a>
        </Button>
      </div>
    </div>
  );
}
