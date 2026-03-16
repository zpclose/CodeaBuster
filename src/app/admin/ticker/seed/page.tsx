'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Database, Plus, CheckCircle, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const defaultTickerItems = [
  { text: "Codebuster Maya S. Mengirim Pull Request → Proyek Fintech Protocol. (Total +12 PRs dalam 1 jam terakhir)", icon: 'LinkIcon', isActive: true, order: 0 },
  { text: "Mentor Risa K. Selesai code review → Proyek UI/UX Accessibility. (Tersisa 5 Sesi Review lagi)", icon: 'GraduationCap', isActive: true, order: 1 },
  { text: "Tim Alpha Meminta bantuan → Komponen Database Scalability. (Sedang dilihat oleh 3 Expert Aktif)", icon: 'Wrench', isActive: true, order: 2 },
  { text: "Codebuster Kevin L. Mengirim ide solusi → Diskusi Global Trading Platform. (Diskusi sekarang memiliki 15 Balasan)", icon: 'Lightbulb', isActive: true, order: 3 },
];

export default function SeedTickerPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [hasData, setHasData] = useState<boolean | null>(null);

  useEffect(() => {
    const checkData = async () => {
      if (!firestore) {
        setIsLoading(false);
        return;
      }
      
      try {
        const q = query(collection(firestore, 'ticker-settings'), orderBy('order'), limit(10));
        const snapshot = await getDocs(q);
        setHasData(snapshot.size > 0);
      } catch (err) {
        console.error('Check error:', err);
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkData();
  }, [firestore]);

  const seedData = async () => {
    if (!firestore) return;
    setIsSeeding(true);
    
    try {
      if (hasData) {
        toast({ title: 'Info', description: 'Data sudah ada di database!' });
        setIsSeeding(false);
        return;
      }

      for (const item of defaultTickerItems) {
        await addDoc(collection(firestore, 'ticker-settings'), {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      toast({ title: 'Berhasil', description: '4 item Live Feed berhasil ditambahkan!' });
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
          <p className="text-muted-foreground">Menghubungkan ke database...</p>
        </div>
      </div>
    );
  }

  if (!firestore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Gagal terhubung ke Firestore</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Seed Data Live Feed</h1>
          <p className="text-muted-foreground text-sm">
            Tambahkan data default untuk Live Feed marquee.
          </p>
        </div>

        {hasData && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Data sudah ada di database!</span>
            </div>
          </div>
        )}

        {!hasData && (
          <div className="bg-muted/50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold mb-2 text-sm">Data yang akan ditambahkan:</h3>
            <ul className="space-y-2">
              {defaultTickerItems.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button 
          className="w-full" 
          onClick={seedData}
          disabled={isLoading || isSeeding || !!hasData}
        >
          {isSeeding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menambahkan...
            </>
          ) : hasData ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Data Sudah Ada
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Tambahkan ke Database
            </>
          )}
        </Button>

        <div className="mt-6 pt-6 border-t border-border">
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/admin/ticker">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Pengaturan
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
