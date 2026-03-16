
'use client';

import SettingsLayout from '../SettingsLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Globe, Smartphone, Trash2, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { useUser, useAuth } from '@/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, verifyBeforeUpdateEmail, getAuth } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { sendSecurityNotification } from '@/app/actions/email-actions';

function AccountSecurityForm() {
    const { user } = useUser();
    const auth = useAuth();
    const { toast } = useToast();
    
    const [emailData, setEmailData] = useState({ newEmail: '', password: '' });
    const [passData, setPassData] = useState({ currentPass: '', newPass: '', confirmPass: '' });
    const [isLoadingEmail, setIsLoadingEmail] = useState(false);
    const [isLoadingPass, setIsLoadingPass] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleEmailChange = async () => {
        if (!user || !auth || !user.email) return;
        if (!emailData.newEmail || !emailData.password) {
            toast({ title: "Data tidak lengkap", description: "Mohon isi email baru dan kata sandi konfirmasi.", variant: "destructive" });
            return;
        }

        setIsLoadingEmail(true);
        setError(null);
        try {
            const oldEmail = user.email;
            const credential = EmailAuthProvider.credential(oldEmail, emailData.password);
            
            // Re-otentikasi untuk keamanan
            await reauthenticateWithCredential(user, credential);
            
            // 1. Kirim Notifikasi ke EMAIL LAMA (via Resend)
            await sendSecurityNotification(oldEmail, emailData.newEmail);
            
            // 2. Kirim Link Verifikasi ke EMAIL BARU (via Firebase)
            // Ini wajib ke email baru agar Firebase bisa memverifikasi kepemilikannya.
            const actionCodeSettings = {
                url: `${window.location.origin}/auth/action`,
                handleCodeInApp: true,
            };
            await verifyBeforeUpdateEmail(user, emailData.newEmail, actionCodeSettings);
            
            toast({ 
                title: "Proses Dimulai", 
                description: "Notifikasi dikirim ke email lama Anda. Silakan periksa email BARU Anda untuk memverifikasi perubahan." 
            });
            setEmailData({ newEmail: '', password: '' });
        } catch (err: any) {
            console.error(err);
            let errorMessage = "Gagal mengubah email. Pastikan kata sandi benar.";
            if (err.code === 'auth/operation-not-allowed') {
                errorMessage = "Operasi dibatasi. Pastikan email baru valid.";
            }
            setError(errorMessage);
            toast({ title: "Gagal Mengubah Email", description: errorMessage, variant: "destructive" });
        } finally {
            setIsLoadingEmail(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!user || !auth || !user.email) return;
        if (!passData.newPass || passData.newPass !== passData.confirmPass) {
            toast({ title: "Kata sandi tidak cocok", description: "Konfirmasi kata sandi baru tidak sesuai.", variant: "destructive" });
            return;
        }

        setIsLoadingPass(true);
        setError(null);
        try {
            const credential = EmailAuthProvider.credential(user.email, passData.currentPass);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, passData.newPass);
            toast({ title: "Kata Sandi Diperbarui", description: "Kata sandi Anda telah berhasil diubah." });
            setPassData({ currentPass: '', newPass: '', confirmPass: '' });
        } catch (err: any) {
            console.error(err);
            setError("Gagal mengubah kata sandi. Pastikan kata sandi lama Anda benar.");
            toast({ title: "Gagal Mengubah Kata Sandi", description: "Terjadi kesalahan keamanan.", variant: "destructive" });
        } finally {
            setIsLoadingPass(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
                {error && (
                    <Alert variant="destructive" className="lg:col-span-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Card className="shadow-sm border-primary/20">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2">
                            Alamat Email
                        </CardTitle>
                        <CardDescription>Ubah alamat email Anda. Notifikasi akan dikirim ke email lama.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-email">Email Saat Ini</Label>
                            <Input id="current-email" type="email" value={user?.email || ''} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-email">Email Baru</Label>
                            <Input 
                                id="new-email" 
                                type="email" 
                                placeholder="emailbaru@example.com" 
                                value={emailData.newEmail}
                                onChange={(e) => setEmailData({...emailData, newEmail: e.target.value})}
                                className="focus-visible:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password-confirm-email">Konfirmasi Kata Sandi</Label>
                            <Input 
                                id="password-confirm-email" 
                                type="password" 
                                placeholder="••••••••" 
                                value={emailData.password}
                                onChange={(e) => setEmailData({...emailData, password: e.target.value})}
                                className="focus-visible:ring-primary"
                            />
                        </div>
                        <Alert className="bg-blue-50 border-blue-200">
                            <ShieldAlert className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-xs text-blue-700">
                                Kami akan mengirimkan email konfirmasi ke alamat lama Anda untuk keamanan, dan link verifikasi ke alamat baru.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            onClick={handleEmailChange} 
                            disabled={isLoadingEmail}
                            className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                        >
                            {isLoadingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Email & Beritahu Email Lama
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Kata Sandi</CardTitle>
                        <CardDescription>Pastikan kata sandi Anda kuat dan unik.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Kata Sandi Lama</Label>
                            <Input 
                                id="current-password" 
                                type="password" 
                                value={passData.currentPass}
                                onChange={(e) => setPassData({...passData, currentPass: e.target.value})}
                                className="focus-visible:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Kata Sandi Baru</Label>
                            <Input 
                                id="new-password" 
                                type="password" 
                                value={passData.newPass}
                                onChange={(e) => setPassData({...passData, newPass: e.target.value})}
                                className="focus-visible:ring-primary"
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="confirm-new-password">Konfirmasi Kata Sandi Baru</Label>
                            <Input 
                                id="confirm-new-password" 
                                type="password" 
                                value={passData.confirmPass}
                                onChange={(e) => setPassData({...passData, confirmPass: e.target.value})}
                                className="focus-visible:ring-primary"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            onClick={handlePasswordChange} 
                            disabled={isLoadingPass}
                            className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                        >
                            {isLoadingPass && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan Kata Sandi Baru
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="space-y-8">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Verifikasi Dua Langkah (2FA)</CardTitle>
                        <CardDescription>Tambahkan lapisan keamanan ekstra dengan kode unik saat login.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                                <p className="font-medium">Status 2FA</p>
                                <p className="text-sm text-muted-foreground">Tidak Aktif (Dalam Pengembangan)</p>
                            </div>
                            <Switch id="two-factor-switch" disabled />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Sesi Aktif</CardTitle>
                        <CardDescription>Periksa perangkat yang sedang login ke akun Anda.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-md">
                            <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Browser Sesi Ini</p>
                                    <p className="text-xs text-green-600">Aktif sekarang</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function AccountSettingsPage() {
  return (
    <SettingsLayout>
        <AccountSecurityForm />
    </SettingsLayout>
  );
}
