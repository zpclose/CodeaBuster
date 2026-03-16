
'use client';

import SettingsLayout from '../SettingsLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const notificationOptions = [
    { id: 'security', activity: 'Keamanan Akun', description: 'Pemberitahuan login dan perubahan keamanan.' },
    { id: 'programs', activity: 'Pembaruan Program', description: 'Masterclass, event, dan challenge baru.' },
    { id: 'community', activity: 'Aktivitas Komunitas', description: 'Aktivitas terbaru dari anggota komunitas.' },
    { id: 'interactions', activity: 'Interaksi Profil', description: 'Komentar dan mention pada proyek Anda.' },
    { id: 'messages', activity: 'Pesan Pribadi', description: 'Pesan langsung dari anggota komunitas.' },
    { id: 'announcements', activity: 'Pengumuman', description: 'Informasi umum dari pengurus.' },
];

function NotificationsForm() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState<string | null>(null);

    const userDocRef = useMemoFirebase(() => 
        user && firestore ? doc(firestore, 'users', user.uid) : null,
    [user, firestore]);

    const { data: userProfile, isLoading } = useDoc(userDocRef);
    const [settings, setSettings] = useState<Record<string, boolean>>({});
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (userProfile?.preferences?.notifications) {
            setSettings(userProfile.preferences.notifications);
        } else if (!isInitialized) {
            const defaults: Record<string, boolean> = {};
            notificationOptions.forEach(opt => defaults[opt.id] = true);
            setSettings(defaults);
            setIsInitialized(true);
        }
    }, [userProfile, isInitialized]);

    const toggleSetting = async (id: string) => {
        const newValue = !settings[id];
        setSettings(prev => ({ ...prev, [id]: newValue }));
        
        if (!user || !firestore) return;
        
        setIsSaving(id);
        try {
            await updateDoc(doc(firestore, 'users', user.uid), {
                [`preferences.notifications.${id}`]: newValue,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error(error);
            toast({ title: "Gagal Menyimpan", description: "Terjadi kesalahan saat menyimpan pengaturan.", variant: "destructive" });
            setSettings(prev => ({ ...prev, [id]: !newValue }));
        } finally {
            setIsSaving(null);
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
        <div className="space-y-8">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Kelola Notifikasi</CardTitle>
                    <CardDescription>
                        Pilih jenis aktivitas yang ingin Anda terima notifikasinya.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[70%]">Jenis Aktivitas</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {notificationOptions.map(option => (
                                <TableRow key={option.id}>
                                    <TableCell>
                                        <p className="font-medium">{option.activity}</p>
                                        <p className="text-xs text-muted-foreground">{option.description}</p>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Switch 
                                            checked={settings[option.id] || false} 
                                            onCheckedChange={() => toggleSetting(option.id)}
                                            disabled={isSaving !== null}
                                        />
                                        {isSaving === option.id && (
                                            <Loader2 className="ml-2 h-4 w-4 animate-spin inline" />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default function NotificationsSettingsPage() {
  return (
    <SettingsLayout>
        <NotificationsForm />
    </SettingsLayout>
  );
}
