'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { signUpWithEmailAndPassword, sendVerificationEmail } from '@/firebase/auth/auth';
import { useRouter } from 'next/navigation';


const programmingLanguages = ["Python", "JavaScript", "C++", "Java", "TypeScript", "Go", "Rust", "Kotlin"];

const formSchema = z.object({
    fullName: z.string().min(3, { message: 'Nama lengkap harus diisi.' }),
    nim: z.string().min(5, { message: 'NIM harus diisi.' }),
    institution: z.string().min(2, { message: 'Institusi harus diisi.' }),
    major: z.string().min(3, { message: 'Jurusan harus diisi.' }),
    email: z.string().email({ message: 'Format email tidak valid.' }),
    password: z.string().min(6, { message: 'Kata sandi minimal 6 karakter.' }),
    phone: z.string().min(10, { message: 'Nomor kontak tidak valid.' }),
    languages: z.array(z.string()).refine(value => value.some(item => item), {
        message: "Anda harus memilih setidaknya satu bahasa pemrograman.",
    }),
    specialization: z.string({ required_error: 'Spesialisasi harus dipilih.' }),
    skillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced'], { required_error: 'Tingkat keahlian harus dipilih.' }),
    portfolioUrl: z.string().url({ message: 'URL portofolio tidak valid.' }).or(z.literal('')),
    linkedinUrl: z.string().url({ message: 'URL LinkedIn tidak valid.' }).optional().or(z.literal('')),
    motivation: z.string().min(50, 'Motivasi minimal 50 karakter.').max(1000, 'Motivasi maksimal 1000 karakter.'),
    commitment: z.string({ required_error: 'Pilih komitmen waktu Anda.' }),
    agreement: z.boolean().refine(val => val === true, {
        message: "Anda harus menyetujui pernyataan ini untuk melanjutkan.",
    }),
});

export type FormValues = z.infer<typeof formSchema>;

export default function RegisterForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const auth = useAuth();
    const firestore = useFirestore();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            nim: '',
            institution: '',
            major: '',
            email: '',
            password: '',
            phone: '',
            languages: [],
            specialization: '',
            skillLevel: 'Beginner',
            portfolioUrl: '',
            linkedinUrl: '',
            motivation: '',
            commitment: '',
            agreement: false,
        },
    });

    async function onSubmit(values: FormValues) {
        setIsLoading(true);

        if (!auth || !firestore) {
            toast({
                title: "Error",
                description: "Layanan otentikasi atau database tidak tersedia.",
                variant: "destructive"
            })
            setIsLoading(false);
            return;
        }

        try {
            const userCredential = await signUpWithEmailAndPassword(auth, firestore, values);
            await sendVerificationEmail(userCredential.user);
            await auth.signOut();
            toast({
                title: "Pendaftaran Berhasil!",
                description: "Silakan cek email Anda untuk verifikasi akun. Jangan lupa cek folder Spam.",
            });
            router.push('/login');
        } catch (error: any) {
            let errorMessage = "Terjadi kesalahan saat pendaftaran.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Email ini sudah terdaftar. Silakan gunakan email lain.';
            }
            toast({
                title: "Pendaftaran Gagal",
                description: errorMessage,
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Section 1: Personal & Institutional Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Personal & Institutional Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="fullName" render={({ field }) => (
                                <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="nim" render={({ field }) => (
                                <FormItem><FormLabel>NIM</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="institution" render={({ field }) => (
                            <FormItem><FormLabel>Institusi</FormLabel><FormControl><Input {...field} placeholder="Contoh: Telkom University, Universitas Mercu Buana, dll" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="major" render={({ field }) => (
                            <FormItem><FormLabel>Fakultas / Jurusan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email Institusi</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>Nomor Kontak (WhatsApp)</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>Kata Sandi</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>

                {/* Section 2: Technical Proficiency & Experience */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Technical Proficiency & Experience</CardTitle>
                        <CardDescription>Jelaskan jejak digital dan keahlian teknis Anda.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="languages" render={() => (
                            <FormItem>
                                <FormLabel>Bahasa Pemrograman Utama</FormLabel>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {programmingLanguages.map((item) => (
                                        <FormField key={item} control={form.control} name="languages" render={({ field }) => (
                                            <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(item)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...(field.value || []), item])
                                                                : field.onChange(field.value?.filter((value) => value !== item));
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">{item}</FormLabel>
                                            </FormItem>
                                        )} />
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="specialization" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Spesialisasi</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Pilih spesialisasi Anda" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Front-End">Front-End Development</SelectItem>
                                        <SelectItem value="Back-End">Back-End Development</SelectItem>
                                        <SelectItem value="Full-Stack">Full-Stack Development</SelectItem>
                                        <SelectItem value="Data-Science">Data Science</SelectItem>
                                        <SelectItem value="AI/ML">AI/ML Engineering</SelectItem>
                                        <SelectItem value="Cyber-Security">Cyber Security</SelectItem>
                                        <SelectItem value="Mobile-Dev">Mobile Development</SelectItem>
                                        <SelectItem value="UI/UX-Design">UI/UX Design</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="skillLevel" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tingkat Keahlian (Secara Umum)</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-8">
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="Beginner" /></FormControl><FormLabel className="font-normal">Beginner</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="Intermediate" /></FormControl><FormLabel className="font-normal">Intermediate</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="Advanced" /></FormControl><FormLabel className="font-normal">Advanced</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="portfolioUrl" render={({ field }) => (
                            <FormItem><FormLabel>Link Portofolio (GitHub/GitLab/Website)</FormLabel><FormControl><Input placeholder="https://github.com/username" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Link LinkedIn <span className="text-muted-foreground text-xs">(Sangat Dianjurkan)</span></FormLabel>
                                <FormControl><Input placeholder="https://linkedin.com/in/username" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                {/* Section 3: Statement of Intent */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Statement of Intent</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="motivation" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Motivation Statement</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Jelaskan, dalam 200-1000 karakter, mengapa Anda layak menjadi bagian dari Codebusters dan bagaimana Anda akan berkontribusi pada sinergi Telkom-Mercu Buana?"
                                        className="min-h-[120px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="commitment" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Komitmen Waktu per Minggu</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-x-6 gap-y-2">
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="1-3" /></FormControl><FormLabel className="font-normal">1-3 Jam</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="4-6" /></FormControl><FormLabel className="font-normal">4-6 Jam</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="7-10" /></FormControl><FormLabel className="font-normal">7-10 Jam</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="10+" /></FormControl><FormLabel className="font-normal">10+ Jam</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                {/* Agreement and Submission */}
                <div className="space-y-6">
                    <FormField control={form.control} name="agreement" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Pernyataan dan Persetujuan</FormLabel>
                                <FormDescription>
                                    Saya menyatakan bahwa semua data yang saya masukkan adalah benar dan saya siap mengikuti proses seleksi yang ketat.
                                </FormDescription>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )} />

                    <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Application
                    </Button>
                </div>
            </form>
        </Form >
    );
}
