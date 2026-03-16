'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Upload, Trash2, ImageIcon, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function ManageImagesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const imagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'image-library');
  }, [firestore]);

  const { data: images, isLoading } = useCollection(imagesQuery);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firestore) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('fileToUpload', file);

    try {
      const response = await fetch('/api/upload/proxy', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Gagal mengunggah gambar.');

      const { url } = await response.json();

      await addDoc(collection(firestore, 'image-library'), {
        url,
        name: file.name,
        uploadedAt: serverTimestamp(),
        size: file.size,
      });

      toast({
        title: "Gambar Berhasil Diunggah",
        description: "Gambar telah ditambahkan ke pustaka.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Gagal Mengunggah",
        description: "Terjadi kesalahan saat memproses gambar.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(firestore, 'image-library', id));
      toast({
        title: "Gambar Dihapus",
        description: "Aset gambar telah dihapus dari pustaka.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Gagal Menghapus",
        description: "Terjadi kesalahan database.",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Pustaka Gambar</h1>
          <p className="text-muted-foreground">Kelola aset visual yang digunakan di seluruh platform Tel-Nect.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
            accept="image/*"
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Unggah Aset Baru
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {images?.map((img) => (
            <Card key={img.id} className="group overflow-hidden relative">
              <div className="relative aspect-square bg-muted">
                <Image 
                  src={img.url} 
                  alt={img.name} 
                  fill 
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button variant="secondary" size="icon" asChild>
                    <a href={img.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={() => handleDelete(img.id)}
                    disabled={deletingId === img.id}
                  >
                    {deletingId === img.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-card border-t">
                <p className="text-xs font-medium truncate">{img.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {(img.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </Card>
          ))}
          {(!images || images.length === 0) && (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl bg-muted/20">
              <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Pustaka masih kosong.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
