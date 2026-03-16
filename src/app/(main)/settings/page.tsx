'use client';

import SettingsLayout from './SettingsLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera } from 'lucide-react';
import { uploadImage, generateUniqueFilename } from '@/lib/storage-utils';

function ProfileForm() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const userDocRef = useMemoFirebase(() => 
        user && firestore ? doc(firestore, 'users', user.uid) : null,
    [user, firestore]);

    const { data: userProfile, isLoading } = useDoc(userDocRef);

    const [formData, setFormData] = useState({
        fullName: '',
        bio: '',
        github: '',
        linkedin: '',
        avatarUrl: ''
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                fullName: userProfile.fullName || '',
                bio: userProfile.bio || '',
                github: userProfile.links?.github || '',
                linkedin: userProfile.links?.linkedin || '',
                avatarUrl: userProfile.avatarUrl || ''
            });
        }
    }, [userProfile]);

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user || !firestore) return;

        if (!file.type.startsWith('image/')) {
            toast({ title: "Format tidak didukung", description: "Harap upload file gambar.", variant: "destructive" });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "File terlalu besar", description: "Ukuran maksimal 5MB.", variant: "destructive" });
            return;
        }

        setIsUploading(true);
        try {
            const fileName = generateUniqueFilename(file.name);
            const downloadURL = await uploadImage(file, `avatars/${user.uid}/${fileName}`);
            
            setFormData(prev => ({ ...prev, avatarUrl: downloadURL }));

            const docRef = doc(firestore, 'users', user.uid);
            await updateDoc(docRef, { avatarUrl: downloadURL });

            toast({ title: "Sukses!", description: "Foto profil berhasil diperbarui." });
        } catch (error: any) {
            console.error("Error uploading avatar:", error);
            toast({ title: "Gagal Upload", description: error.message || "Terjadi kesalahan.", variant: "destructive" });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        if (!user || !firestore) return;
        setIsSaving(true);

        try {
            const docRef = doc(firestore, 'users', user.uid);
            await updateDoc(docRef, {
                fullName: formData.fullName,
                bio: formData.bio,
                'links.github': formData.github,
                'links.linkedin': formData.linkedin,
                avatarUrl: formData.avatarUrl,
                updatedAt: new Date()
            });

            toast({
                title: "Profil Diperbarui",
                description: "Perubahan profil publik Anda telah berhasil disimpan.",
            });
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast({
                title: "Gagal Menyimpan",
                description: error.message || "Terjadi kesalahan saat menyimpan profil.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Profil Publik</CardTitle>
                <CardDescription>
                    Informasi ini akan ditampilkan secara publik di halaman profil Anda.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={formData.avatarUrl} alt={formData.fullName} />
                            <AvatarFallback>{formData.fullName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div 
                            className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {isUploading ? (
                                <Loader2 className="h-8 w-8 text-white animate-spin" />
                            ) : (
                                <Camera className="h-8 w-8 text-white" />
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                            className="hidden"
                            accept="image/png, image/jpeg, image/gif"
                        />
                    </div>
                    <div>
                        <Label>Foto Profil</Label>
                        <p className="text-sm text-muted-foreground">Klik untuk upload foto baru</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fullName">Nama Lengkap</Label>
                    <Input 
                        id="fullName" 
                        value={formData.fullName} 
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="focus-visible:ring-primary"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                        id="bio" 
                        placeholder="Ceritakan sedikit tentang diri Anda." 
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        className="focus-visible:ring-primary"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="github">URL GitHub</Label>
                    <Input 
                        id="github" 
                        placeholder="https://github.com/username" 
                        value={formData.github}
                        onChange={(e) => setFormData({...formData, github: e.target.value})}
                        className="focus-visible:ring-primary"
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="linkedin">URL LinkedIn</Label>
                    <Input 
                        id="linkedin" 
                        placeholder="https://linkedin.com/in/username" 
                        value={formData.linkedin}
                        onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                        className="focus-visible:ring-primary"
                    />
                </div>
            </CardContent>
            <CardFooter>
                 <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/90"
                >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Perubahan
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function SettingsPage() {
  return (
    <SettingsLayout>
        <ProfileForm />
    </SettingsLayout>
  );
}
