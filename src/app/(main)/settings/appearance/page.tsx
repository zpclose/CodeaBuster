
'use client';

import SettingsLayout from '../SettingsLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sun, Moon, Laptop, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

function AppearanceForm() {
    const { theme, setTheme } = useTheme();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [mounted, setThemeMounted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const userDocRef = useMemoFirebase(() => 
        user && firestore ? doc(firestore, 'users', user.uid) : null,
    [user, firestore]);

    const { data: userProfile } = useDoc(userDocRef);

    useEffect(() => {
        setThemeMounted(true);
    }, []);

    const handleSavePreferences = async () => {
        if (!user || !firestore) return;
        setIsSaving(true);
        try {
            await updateDoc(doc(firestore, 'users', user.uid), {
                'preferences.theme': theme,
                updatedAt: new Date()
            });
            toast({ title: "Preferensi Disimpan", description: "Pengaturan tampilan Anda telah diperbarui." });
        } catch (error: any) {
            console.error(error);
            toast({ title: "Gagal Menyimpan", description: "Terjadi kesalahan saat menyimpan ke database.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    if (!mounted) return null;

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Tampilan & Preferensi</CardTitle>
                <CardDescription>
                    Sesuaikan antarmuka aplikasi dan kelola preferensi sistem Anda.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div>
                            <Label className="text-base font-semibold">Tema Tampilan</Label>
                            <p className="text-sm text-muted-foreground mb-4">Pilih tema yang paling nyaman untuk Anda.</p>
                             <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4">
                                <div>
                                    <RadioGroupItem value="light" id="light" className="peer sr-only" />
                                    <Label htmlFor="light" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                        <Sun className="mb-2 h-5 w-5" />
                                        Terang
                                    </Label>
                                </div>
                                 <div>
                                    <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                                    <Label htmlFor="dark" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                        <Moon className="mb-2 h-5 w-5" />
                                        Gelap
                                    </Label>
                                </div>
                                 <div>
                                    <RadioGroupItem value="system" id="system" className="peer sr-only" />
                                    <Label htmlFor="system" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                        <Laptop className="mb-2 h-5 w-5" />
                                        Sistem
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <div>
                            <Label className="text-base font-semibold">Bahasa Utama</Label>
                            <p className="text-sm text-muted-foreground mb-4">Pilih bahasa pengantar antarmuka.</p>
                             <div className="space-y-4">
                                <Select defaultValue="id">
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih bahasa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="id">Bahasa Indonesia</SelectItem>
                                        <SelectItem value="en">English (US)</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button 
                    onClick={handleSavePreferences} 
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/90"
                >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Perubahan Tampilan
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function AppearanceSettingsPage() {
  return (
    <SettingsLayout>
        <AppearanceForm />
    </SettingsLayout>
  );
}
