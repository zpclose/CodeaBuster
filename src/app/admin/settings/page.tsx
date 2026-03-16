'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, Save } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const settingsRef = useMemoFirebase(() =>
    firestore ? doc(firestore, 'site-config', 'global-settings') : null,
    [firestore]);

  const { data: settings, isLoading } = useDoc(settingsRef);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    if (settings) {
      setMaintenanceMode(!!settings.maintenanceMode);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!firestore) return;
    setIsSaving(true);
    try {
      await setDoc(doc(firestore, 'site-config', 'global-settings'), {
        maintenanceMode,
        lastUpdatedBy: 'admin',
        updatedAt: new Date(),
      }, { merge: true });

      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenanceMode }),
      });

      if (!res.ok) throw new Error('Failed to set maintenance cookie');

      toast({
        title: 'Pengaturan Disimpan',
        description: `Mode Maintenance ${maintenanceMode ? 'diaktifkan. Pengunjung non-admin akan diarahkan ke halaman maintenance.' : 'dinonaktifkan. Situs kembali ke kondisi normal.'}`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan teknis.',
        variant: 'destructive',
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
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold font-headline">Pengaturan Sistem</h1>
        <p className="text-muted-foreground">Kontrol perilaku global aplikasi Tel-Nect.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visibilitas Situs</CardTitle>
          <CardDescription>
            Kelola pengaturan operasional untuk seluruh pengunjung.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 pr-4">
              <Label htmlFor="maintenance-mode" className="text-base">Mode Maintenance</Label>
              <p className="text-sm text-muted-foreground">
                Alihkan situs ke halaman khusus untuk pengunjung non-admin. Ini berguna saat melakukan pembaruan besar.
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
            />
          </div>
          {maintenanceMode && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Peringatan Aktif</AlertTitle>
              <AlertDescription>
                Hanya admin yang dapat mengakses konten situs saat ini.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Terapkan Pengaturan
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
