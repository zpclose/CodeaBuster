'use client';

import SettingsLayout from '../SettingsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';


function IntegrationsForm() {
    return (
        <div className="space-y-8">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Akun Layanan Terhubung</CardTitle>
                    <CardDescription>
                        Ini adalah layanan pihak ketiga yang telah Anda otorisasi untuk mengakses data profil Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-muted rounded-full p-4 mb-4">
                            <Clock className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Segera Hadir</h3>
                        <p className="text-muted-foreground max-w-md">
                            Fitur akun layanan terhubung sedang dalam pengembangan. Silakan tunggu pembaruan selanjutnya.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Hubungkan Akun Baru</CardTitle>
                    <CardDescription>
                        Tingkatkan fungsionalitas dan profil Anda dengan menghubungkan layanan berikut.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-muted rounded-full p-4 mb-4">
                            <Clock className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Segera Hadir</h3>
                        <p className="text-muted-foreground max-w-md">
                            Fitur akun layanan terhubung sedang dalam pengembangan. Silakan tunggu pembaruan selanjutnya.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function IntegrationsSettingsPage() {
  return (
    <SettingsLayout>
        <IntegrationsForm />
    </SettingsLayout>
  );
}
