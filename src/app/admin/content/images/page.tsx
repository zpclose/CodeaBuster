'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useFirestore, getStorageApp } from '@/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, getStorage } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PAGE_IMAGE_CATEGORIES, type ImageSlot, type PageCategory } from '@/lib/page-image-slots';
import { ImageIcon, Upload, Trash2, RefreshCw, CheckCircle, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface FirestoreOverride {
    slot: string;
    pageCategory: string;
    imageUrl: string;
    isActive: boolean;
    updatedAt: any;
}

type OverrideMap = Record<string, FirestoreOverride>; // keyed by slot id

export default function ImagesManagementPage() {
    const db = useFirestore();
    const { toast } = useToast();

    const [overrides, setOverrides] = useState<OverrideMap>({});
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(PAGE_IMAGE_CATEGORIES[0].id);

    // Upload dialog
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [uploadTarget, setUploadTarget] = useState<{ category: PageCategory; slot: ImageSlot } | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Delete dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ category: PageCategory; slot: ImageSlot } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Preview dialog
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [previewOpen, setPreviewOpen] = useState(false);

    const fetchOverrides = useCallback(async () => {
        if (!db) { setIsLoading(false); return; }
        setIsLoading(true);
        try {
            const snap = await getDocs(collection(db, 'page-images'));
            const map: OverrideMap = {};
            snap.forEach(doc => {
                const data = doc.data() as FirestoreOverride;
                if (data.slot) map[data.slot] = { ...data };
            });
            setOverrides(map);
        } catch (err) {
            console.error('Failed to load overrides:', err);
            toast({ title: 'Error', description: 'Gagal memuat gambar dari database.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [db, toast]);

    useEffect(() => { fetchOverrides(); }, [fetchOverrides]);

    // Get the effective image URL for a slot (Firestore override or placeholder)
    const getEffectiveUrl = (slotId: string): string => {
        const override = overrides[slotId];
        if (override?.imageUrl) return override.imageUrl;
        return PlaceHolderImages.find(p => p.id === slotId)?.imageUrl ?? '';
    };

    const isOverridden = (slotId: string) => !!overrides[slotId]?.imageUrl;

    // File selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    // Upload
    const handleUpload = async () => {
        if (!uploadTarget || !imageFile || !db) return;
        setIsUploading(true);
        try {
            const storageApp = getStorageApp();
            const storage = getStorage(storageApp ?? undefined);
            
            // Check if there's an existing override to delete old image
            const existingOverride = overrides[uploadTarget.slot.slot];
            if (existingOverride?.imageUrl) {
                try {
                    // Extract path from URL to delete
                    const urlParts = existingOverride.imageUrl.split('/o/');
                    if (urlParts[1]) {
                        const encodedPath = urlParts[1].split('?')[0];
                        const decodedPath = decodeURIComponent(encodedPath);
                        const oldImageRef = ref(storage, decodedPath);
                        await deleteObject(oldImageRef);
                    }
                } catch (deleteError) {
                    console.warn('Failed to delete old image from storage:', deleteError);
                }
            }
            
            const path = `page-images/${uploadTarget.category.id}/${uploadTarget.slot.slot}-${Date.now()}`;
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, imageFile);
            const downloadUrl = await getDownloadURL(storageRef);

            await setDoc(doc(db, 'page-images', uploadTarget.slot.slot), {
                slot: uploadTarget.slot.slot,
                pageCategory: uploadTarget.category.id,
                label: uploadTarget.slot.label,
                imageUrl: downloadUrl,
                isActive: true,
                updatedAt: serverTimestamp(),
            });

            toast({ title: 'Berhasil!', description: `Gambar "${uploadTarget.slot.label}" berhasil diupdate.` });
            setUploadDialogOpen(false);
            setImageFile(null);
            setImagePreview('');
            await fetchOverrides();
        } catch (err) {
            console.error('Upload failed:', err);
            toast({ title: 'Upload Gagal', description: 'Terjadi kesalahan saat upload gambar.', variant: 'destructive' });
        } finally {
            setIsUploading(false);
        }
    };

    // Toggle active
    const handleToggleActive = async (slotId: string, currentValue: boolean) => {
        if (!db) return;
        try {
            await setDoc(doc(db, 'page-images', slotId), { isActive: !currentValue }, { merge: true });
            setOverrides(prev => ({
                ...prev,
                [slotId]: { ...prev[slotId], isActive: !currentValue }
            }));
            toast({ title: 'Diperbarui', description: `Gambar ${!currentValue ? 'diaktifkan' : 'dinonaktifkan'}.` });
        } catch {
            toast({ title: 'Error', description: 'Gagal memperbarui status.', variant: 'destructive' });
        }
    };

    // Delete override (revert to placeholder) - also deletes image from storage
    const handleDelete = async () => {
        if (!deleteTarget || !db) return;
        setIsDeleting(true);
        try {
            const storageApp = getStorageApp();
            const storage = getStorage(storageApp ?? undefined);
            
            // Get the current override to delete the image from storage
            const existingOverride = overrides[deleteTarget.slot.slot];
            if (existingOverride?.imageUrl) {
                try {
                    // Extract path from URL to delete
                    const urlParts = existingOverride.imageUrl.split('/o/');
                    if (urlParts[1]) {
                        const encodedPath = urlParts[1].split('?')[0];
                        const decodedPath = decodeURIComponent(encodedPath);
                        const imageRef = ref(storage, decodedPath);
                        await deleteObject(imageRef);
                    }
                } catch (deleteError) {
                    console.warn('Failed to delete image from storage:', deleteError);
                }
            }
            
            await deleteDoc(doc(db, 'page-images', deleteTarget.slot.slot));
            toast({ title: 'Dikembalikan', description: `"${deleteTarget.slot.label}" kembali ke gambar default.` });
            setDeleteDialogOpen(false);
            setDeleteTarget(null);
            await fetchOverrides();
        } catch {
            toast({ title: 'Error', description: 'Gagal menghapus override gambar.', variant: 'destructive' });
        } finally {
            setIsDeleting(false);
        }
    };

    const openUploadDialog = (category: PageCategory, slot: ImageSlot) => {
        setUploadTarget({ category, slot });
        setImageFile(null);
        setImagePreview('');
        setUploadDialogOpen(true);
    };

    const openDeleteDialog = (category: PageCategory, slot: ImageSlot) => {
        setDeleteTarget({ category, slot });
        setDeleteDialogOpen(true);
    };

    const currentCategory = PAGE_IMAGE_CATEGORIES.find(c => c.id === activeCategory);

    return (
        <div className="container py-4 lg:py-6 space-y-6 flex flex-col h-[calc(100vh-theme(spacing.28))] lg:h-[calc(100vh-theme(spacing.20))] overflow-hidden">
            {/* Header section (Fixed) */}
            <div className="shrink-0 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            Images Management
                        </h1>
                        <p className="text-muted-foreground text-sm max-w-xl">
                            Manage custom images and placeholders across the site
                        </p>
                    </div>
                </div>

                <div className="flex items-start sm:items-center gap-3 text-sm text-muted-foreground bg-muted/20 border border-border/30 rounded-lg px-4 py-3 shadow-sm">
                    <div className="shrink-0 mt-0.5 sm:mt-0">
                        <CheckCircle className="h-4 w-4 text-primary/80" />
                    </div>
                    <span>
                        Images that have not been uploaded will use default placeholders. Upload a new image to change its appearance on the website.
                    </span>
                </div>
            </div>

            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1 flex flex-col min-h-0 min-w-0">
                <div className="shrink-0 overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-border/50">
                    <TabsList className="inline-flex h-auto gap-2 bg-transparent p-0 w-max">
                        {PAGE_IMAGE_CATEGORIES.map(cat => {
                            const customCount = cat.slots.filter(s => isOverridden(s.slot)).length;
                            return (
                                <TabsTrigger
                                    key={cat.id}
                                    value={cat.id}
                                    className="gap-2.5 text-sm px-5 py-2 font-medium rounded-md border-b-2 border-transparent bg-transparent hover:bg-muted/50 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground shadow-none transition-all rounded-b-none"
                                >
                                    {cat.label}
                                    {customCount > 0 && (
                                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary/10 text-primary border-0 font-medium">
                                            {customCount} Custom
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                </div>

                {PAGE_IMAGE_CATEGORIES.map(category => (
                    <TabsContent key={category.id} value={category.id} className="flex-1 overflow-y-auto mt-0 pt-6 pr-1 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {category.slots.map(slot => {
                                    const effectiveUrl = getEffectiveUrl(slot.slot);
                                    const custom = isOverridden(slot.slot);
                                    const override = overrides[slot.slot];
                                    return (
                                        <Card key={slot.slot} className={`overflow-hidden rounded-xl transition-all duration-200 border bg-card hover:shadow-sm ${custom ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border/40'}`}>
                                            {/* Image Preview */}
                                            <div className="relative h-48 w-full bg-muted/40 border-b border-border/10 group">
                                                {effectiveUrl ? (
                                                    <Image
                                                        src={effectiveUrl}
                                                        alt={slot.label}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                                        <ImageIcon className="h-10 w-10 opacity-30" />
                                                    </div>
                                                )}
                                                {/* Badge overlay */}
                                                <div className="absolute top-2 left-2">
                                                    {custom ? (
                                                        <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] uppercase font-bold tracking-wider rounded-sm px-2">
                                                            Customized
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-muted-foreground text-[10px] uppercase font-bold tracking-wider rounded-sm px-2">
                                                            Default
                                                        </Badge>
                                                    )}
                                                </div>
                                                {/* Preview button */}
                                                <button
                                                    className="absolute top-3 right-3 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 shadow-sm"
                                                    onClick={() => { setPreviewUrl(effectiveUrl); setPreviewOpen(true); }}
                                                    title="Pratinjau Gambar"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <CardHeader className="pb-3 pt-5">
                                                <div className="flex flex-col gap-1">
                                                    <CardTitle className="text-base font-bold leading-tight">{slot.label}</CardTitle>
                                                    <CardDescription className="text-xs line-clamp-2" title={slot.description}>{slot.description}</CardDescription>
                                                </div>
                                                <code className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md inline-block w-fit mt-2 font-mono border border-border/50">{slot.slot}</code>
                                            </CardHeader>

                                            <CardContent className="pt-0 space-y-4 pb-5">
                                                {/* Active toggle (only if has override) */}
                                                {custom && (
                                                    <div className="flex items-center gap-2 px-1 mb-1">
                                                        <Switch
                                                            id={`active-${slot.slot}`}
                                                            checked={override?.isActive !== false}
                                                            onCheckedChange={(val) => handleToggleActive(slot.slot, override?.isActive !== false)}
                                                            className="scale-75 origin-left"
                                                        />
                                                        <Label htmlFor={`active-${slot.slot}`} className="text-xs font-medium cursor-pointer">
                                                            {override?.isActive !== false ? <span className="text-green-600 dark:text-green-400">Tampil (Aktif)</span> : <span className="text-muted-foreground">Sembunyikan (Nonaktif)</span>}
                                                        </Label>
                                                    </div>
                                                )}

                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 text-xs h-9 rounded-lg font-medium"
                                                        onClick={() => openUploadDialog(category, slot)}
                                                    >
                                                        <Upload className="h-3.5 w-3.5 mr-1.5" />
                                                        {custom ? 'Ganti Gambar' : 'Upload File'}
                                                    </Button>
                                                    {custom && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs h-9 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/5 px-3 border-border/50 transition-colors"
                                                            onClick={() => openDeleteDialog(category, slot)}
                                                            title="Kembalikan ke Default"
                                                        >
                                                            <RefreshCw className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>

            {/* Upload Dialog */}
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
                    <div className="px-6 pt-6 pb-4 border-b border-border/50">
                        <DialogTitle className="text-xl">Upload Gambar</DialogTitle>
                        <DialogDescription className="mt-1.5 line-clamp-2">
                            {uploadTarget?.slot.label} — {uploadTarget?.slot.description}
                        </DialogDescription>
                    </div>

                    <div className="p-6 space-y-6 bg-muted/10">
                        {/* Current image */}
                        {uploadTarget && getEffectiveUrl(uploadTarget.slot.slot) && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">Gambar Saat Ini:</p>
                                <div className="relative h-28 w-full rounded-xl overflow-hidden bg-muted border border-border/50">
                                    <Image
                                        src={getEffectiveUrl(uploadTarget.slot.slot)}
                                        alt="Current"
                                        fill
                                        className="object-cover opacity-70"
                                        unoptimized
                                    />
                                </div>
                            </div>
                        )}

                        {/* New image upload */}
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Upload Gambar Baru:</p>
                            <div
                                className="relative h-44 w-full rounded-2xl overflow-hidden bg-primary/[0.03] border-2 border-dashed border-primary/20 hover:bg-primary/[0.05] hover:border-primary/40 cursor-pointer transition-all flex items-center justify-center group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                ) : (
                                    <div className="text-center text-muted-foreground p-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="h-5 w-5 text-primary" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground">Klik untuk memilih file</p>
                                        <p className="text-xs mt-1">atau seret dan lepas ke sini</p>
                                        <p className="text-[10px] mt-2 opacity-60">Format didukung: JPG, PNG, WebP (Max 5MB)</p>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            {imageFile && (
                                <p className="text-xs font-medium text-primary mt-2 flex items-center gap-1.5">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-border/50 flex justify-end gap-2 bg-background">
                        <Button variant="outline" onClick={() => setUploadDialogOpen(false)} disabled={isUploading} className="rounded-lg">Batal</Button>
                        <Button onClick={handleUpload} disabled={!imageFile || isUploading} className="rounded-lg">
                            {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mengupload...</> : 'Simpan Gambar'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reset to Default Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[400px] p-6">
                    <DialogHeader>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                            <RefreshCw className="h-8 w-8 text-destructive" />
                        </div>
                        <DialogTitle className="text-center text-xl">Reset ke Default?</DialogTitle>
                        <DialogDescription className="text-center mt-2">
                            Aksi ini akan menghapus gambar custom untuk <strong>{deleteTarget?.slot.label}</strong>. Halaman akan kembali menggunakan gambar bawaan sistem.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center gap-3 mt-4">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting} className="rounded-lg px-6">Batal</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="rounded-lg px-6">
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Ya, Reset'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-5xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                    <div className="relative h-[85vh] w-full flex items-center justify-center group">
                        {previewUrl && (
                            <Image src={previewUrl} alt="Preview" fill className="object-contain drop-shadow-2xl" unoptimized />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
