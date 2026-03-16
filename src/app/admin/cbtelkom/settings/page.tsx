
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  // In a real app, this state would be connected to a database setting.
  const [isMaintenance, setIsMaintenance] = useState(false);

  return (
    <div className="space-y-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Situs</CardTitle>
          <CardDescription>
            Kelola pengaturan global untuk seluruh situs web.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                  <Label htmlFor="maintenance-mode" className="text-base">Mode Maintenance</Label>
                  <p className="text-sm text-muted-foreground">
                    Alihkan situs ke halaman maintenance untuk semua pengunjung.
                  </p>
              </div>
              <Switch
                  id="maintenance-mode"
                  checked={isMaintenance}
                  onCheckedChange={setIsMaintenance}
              />
          </div>
          {isMaintenance && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Peringatan: Mode Maintenance Aktif</AlertTitle>
              <AlertDescription>
                Situs saat ini tidak dapat diakses oleh pengunjung biasa.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
            <Button>Simpan Pengaturan</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
