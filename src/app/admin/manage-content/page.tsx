'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ManageContentPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const contentRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'site-config', 'about-page') : null,
  [firestore]);

  const { data: content, isLoading } = useDoc(contentRef);
  const [formData, setFormData] = useState({
    heroTitle: '',
    aboutDescription: '',
    mission: '',
  });

  useEffect(() => {
    if (content) {
      setFormData({
        heroTitle: content.heroTitle || '',
        aboutDescription: content.aboutDescription || '',
        mission: content.mission || '',
      });
    }
  }, [content]);

  const handleSave = async () => {
    if (!firestore) return;
    setIsSaving(true);
    try {
      await setDoc(doc(firestore, 'site-config', 'about-page'), {
        ...formData,
        updatedAt: new Date(),
      }, { merge: true });
      toast({
        title: "Konten Disimpan",
        description: "Halaman 'Tentang Kami' telah berhasil diperbarui.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat menyimpan konten.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold font-headline">Pengelolaan Konten</h1>
        <p className="text-muted-foreground">Edit teks statis yang ditampilkan pada halaman publik.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Halaman Tentang Kami</CardTitle>
          <CardDescription>Konfigurasi teks untuk bagian manifesto dan deskripsi organisasi.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hero-title">Judul Utama (Hero)</Label>
            <Input 
              id="hero-title" 
              value={formData.heroTitle}
              onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
              placeholder="The Core of Innovation."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about-desc">Deskripsi Tentang Kami</Label>
            <Textarea 
              id="about-desc" 
              className="min-h-[150px]"
              value={formData.aboutDescription}
              onChange={(e) => setFormData({ ...formData, aboutDescription: e.target.value })}
              placeholder="Website ini dibuat oleh Codebusters Telkom..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mission">Visi & Misi Ringkas</Label>
            <Textarea 
              id="mission" 
              value={formData.mission}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              placeholder="Membangun jembatan inovasi antara Telkom dan UMB..."
            />
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan Perubahan Konten
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
