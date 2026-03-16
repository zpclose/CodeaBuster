'use client';

import { useForm, useFieldArray } from 'react-hook-form';
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
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import type { ProjectProposal } from '@/types/project';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { sendProposalConfirmation } from '@/app/actions/email-actions';
import { Separator } from '@/components/ui/separator';

const technologies = ["React", "Next.js", "Python", "Firebase", "Node.js", "TypeScript", "Go", "Java", "Docker", "TensorFlow", "Swift", "Flutter"];

const institutions = [
    'Telkom University',
    'Universitas Mercu Buana',
    'Universitas Padjadjaran',
    'Universitas Pamulang',
    'Universitas Bina Sarana Informatika (BSI)',
    'Universitas Bina Nusantara (Binus)',
    'Institut Teknologi Sepuluh Nopember (ITS)'
] as const;

const collaborationTypes = [
    'Internal (Satu Institusi)',
    'Bilateral (TU + UMB)',
    'Multilateral (3+ Institusi Jaringan)',
    'Eksternal (TU/UMB + Institusi Luar)',
    'Lintas Disiplin (Satu Institusi)',
    'Lintas Disiplin & Lintas Kampus'
] as const;

const formSchema = z.object({
    projectName: z.string().min(3, { message: 'Nama proyek harus diisi.' }),
    projectCategory: z.string({ required_error: 'Kategori proyek harus dipilih.' }),
    projectLeader: z.string().min(3, { message: 'Nama pemimpin proyek harus diisi.' }),
    leaderInstitution: z.enum(institutions, { required_error: 'Institusi harus dipilih.' }),
    executiveSummary: z.string().min(50, 'Ringkasan minimal 50 karakter.').max(1500, 'Ringkasan maksimal 1500 karakter.'),
    targetAudience: z.string().min(3, { message: 'Target audiens harus diisi.' }),
    techStack: z.array(z.string()).refine(value => value.some(item => item), {
        message: "Anda harus memilih setidaknya satu teknologi.",
    }),
    currentStatus: z.enum(['Ide Murni', 'Konsep & Desain', 'Ada Prototipe'], { required_error: 'Status proyek harus dipilih.' }),
    roadmap: z.string().min(50, 'Roadmap minimal 50 karakter.').max(2000, 'Roadmap maksimal 2000 karakter.'),
    successMetrics: z.string().min(20, 'Metrik keberhasilan minimal 20 karakter.'),
    technicalChallenges: z.string().min(20, 'Tantangan teknis minimal 20 karakter.'),
    institutionalImpact: z.string().min(20, 'Dampak institusi minimal 20 karakter.'),
    resourceNeeds: z.string().optional(),
    additionalLink: z.string().url({ message: 'URL tidak valid.' }).or(z.literal('')),
    hasTeam: z.boolean().default(false),
    teamComposition: z.string().optional(),
    teamMembers: z.array(z.object({
        name: z.string().min(2, { message: 'Nama anggota minimal 2 karakter.' }),
        institution: z.string({ required_error: 'Asal institusi harus dipilih.' }),
    })).optional(),
    agreement: z.boolean().refine(val => val === true, {
        message: "Anda harus menyetujui pernyataan ini untuk melanjutkan.",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProposalForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() =>
        user && firestore ? doc(firestore, 'users', user.uid) : null,
        [user, firestore]);
    const { data: userProfile } = useDoc(userDocRef);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            projectName: '',
            projectLeader: '',
            executiveSummary: '',
            targetAudience: '',
            techStack: [],
            roadmap: '',
            successMetrics: '',
            technicalChallenges: '',
            institutionalImpact: '',
            resourceNeeds: '',
            additionalLink: '',
            hasTeam: false,
            teamComposition: '',
            teamMembers: [],
            agreement: false,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "teamMembers",
    });

    async function onSubmit(values: FormValues) {
        setIsLoading(true);

        if (!firestore) {
            toast({ title: "Error", description: "Database service not available.", variant: "destructive" });
            setIsLoading(false);
            return;
        }

        if (!user || !user.email) {
            toast({ title: "Authentication Error", description: "Anda harus login dengan email valid untuk mengirim proposal.", variant: "destructive" });
            setIsLoading(false);
            return;
        }

        const proposalData: Omit<ProjectProposal, 'id'> = {
            ...values,
            resourceNeeds: values.resourceNeeds || '',
            submittedBy: user.uid,
            submittedAt: serverTimestamp(),
            status: 'Submitted',
        };

        const proposalsCollection = collection(firestore, 'project-proposals');

        try {
            await addDoc(proposalsCollection, proposalData);

            const emailResult = await sendProposalConfirmation(
                user.email,
                values.projectName,
                userProfile?.fullName || values.projectLeader
            );

            if (emailResult.success) {
                toast({
                    title: "Proposal Terkirim!",
                    description: `Terima kasih. Konfirmasi telah dikirim ke ${user.email}.`,
                });
            } else {
                toast({
                    title: "Proposal Tersimpan",
                    description: "Data tersimpan, namun gagal mengirim notifikasi email. Cek folder Spam atau batasan Sandbox Resend.",
                    variant: "destructive"
                });
            }

            form.reset();
        } catch (serverError: any) {
            console.error(serverError);
            const contextualError = new FirestorePermissionError({
                path: proposalsCollection.path,
                operation: 'create',
                requestResourceData: proposalData,
            });
            errorEmitter.emit('permission-error', contextualError);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Project Identity & Scope</CardTitle>
                        <CardDescription>Definisikan visi dan identitas dasar proyek Anda.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="projectName" render={({ field }) => (
                            <FormItem><FormLabel>Nama Proyek</FormLabel><FormControl><Input placeholder="Contoh: Tel-Nect Smart Connect" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="projectCategory" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kategori Proyek</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih Kategori" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="AI/ML">AI/ML Engineering</SelectItem>
                                            <SelectItem value="IoT">Internet of Things (IoT)</SelectItem>
                                            <SelectItem value="Web-Dev">Web Development</SelectItem>
                                            <SelectItem value="Mobile-Dev">Mobile Development</SelectItem>
                                            <SelectItem value="Cyber-Security">Cyber Security</SelectItem>
                                            <SelectItem value="Blockchain">Blockchain & Web3</SelectItem>
                                            <SelectItem value="FinTech">Financial Technology</SelectItem>
                                            <SelectItem value="UI/UX-Research">UI/UX Research</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="projectLeader" render={({ field }) => (
                                <FormItem><FormLabel>Project Leader</FormLabel><FormControl><Input placeholder="Nama lengkap pemimpin proyek" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="leaderInstitution" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Institusi Project Leader</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih Institusi" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {institutions.map((inst) => (
                                                <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="executiveSummary" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ringkasan Eksekutif</FormLabel>
                                <FormDescription>Jelaskan masalah, solusi, dan keunikan proyek (Maks 1500 karakter).</FormDescription>
                                <FormControl>
                                    <Textarea
                                        placeholder="Tuliskan intisari proyek Anda di sini..."
                                        className="min-h-[120px] break-words resize-y"
                                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Validation & Implementation Plan</CardTitle>
                        <CardDescription>Rencana teknis, validasi pasar, dan strategi eksekusi proyek.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <FormField control={form.control} name="targetAudience" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Target Audiens / Pengguna</FormLabel>
                                <FormControl><Input placeholder="Contoh: Mahasiswa semester akhir, UMKM lokal, dll." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="techStack" render={() => (
                            <FormItem>
                                <FormLabel>Teknologi Utama</FormLabel>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-muted/20 p-4 rounded-lg border">
                                    {technologies.map((item) => (
                                        <FormField key={item} control={form.control} name="techStack" render={({ field }) => (
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
                                                <FormLabel className="font-normal text-xs">{item}</FormLabel>
                                            </FormItem>
                                        )} />
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="currentStatus" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kematangan Proyek</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-8">
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="Ide Murni" /></FormControl><FormLabel className="font-normal">Ide Murni</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="Konsep & Desain" /></FormControl><FormLabel className="font-normal">Konsep & Desain</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value="Ada Prototipe" /></FormControl><FormLabel className="font-normal">Ada Prototipe</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <Separator />

                        <div className="grid grid-cols-1 gap-6">
                            <FormField control={form.control} name="roadmap" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Proposed Roadmap</FormLabel>
                                    <FormDescription>Jelaskan timeline pengembangan (Contoh: Bulan 1 - Riset, Bulan 2 - Development...)</FormDescription>
                                    <FormControl>
                                        <Textarea placeholder="Rencana bertahap pengembangan proyek..." className="min-h-[100px] break-words resize-y" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="successMetrics" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Success Metrics (KPI)</FormLabel>
                                    <FormDescription>Bagaimana Anda mengukur keberhasilan proyek ini?</FormDescription>
                                    <FormControl>
                                        <Textarea placeholder="Contoh: Digunakan oleh 100 user aktif, Akurasi model 95%..." className="min-h-[80px] break-words resize-y" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="technicalChallenges" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Technical Hurdles & Risks</FormLabel>
                                    <FormDescription>Identifikasi potensi hambatan teknis dan cara mengatasinya.</FormDescription>
                                    <FormControl>
                                        <Textarea placeholder="Hambatan yang mungkin muncul dan mitigasinya..." className="min-h-[80px] break-words resize-y" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="institutionalImpact" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Institutional Synergy & Impact</FormLabel>
                                    <FormDescription>Bagaimana proyek ini mendukung kolaborasi TU & UMB?</FormDescription>
                                    <FormControl>
                                        <Textarea placeholder="Dampak proyek terhadap komunitas dan institusi..." className="min-h-[80px] break-words resize-y" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="resourceNeeds" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Resource & Budget Allocation</FormLabel>
                                <FormDescription>Estimasi kebutuhan dana, server, atau akses API khusus.</FormDescription>
                                <FormControl>
                                    <Textarea
                                        placeholder="Contoh: Kebutuhan server AWS $50/bln, Budget hardware Rp 2jt..."
                                        className="break-words resize-y"
                                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="additionalLink" render={({ field }) => (
                            <FormItem><FormLabel>Link Tambahan (Pitch Deck / Figma Mockup)</FormLabel><FormControl><Input placeholder="https://figma.com/... atau https://drive.google.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Team Composition</CardTitle>
                        <CardDescription>Informasi tentang tim yang akan mengerjakan proyek.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="hasTeam"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/10">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Apakah sudah memiliki tim?</FormLabel>
                                        <FormDescription>Aktifkan jika Anda sudah memiliki rekan kolaborasi.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {form.watch('hasTeam') && (
                            <div className="space-y-6 pt-4 border-t animate-in fade-in slide-in-from-top-4 duration-300">
                                <FormField control={form.control} name="teamComposition" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipe Kolaborasi Tim</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Tipe Kolaborasi" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {collaborationTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold">Daftar Anggota Tim</h4>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => append({ name: '', institution: '' })}
                                            className="text-xs"
                                        >
                                            <Plus className="mr-1 h-3 w-3" /> Tambah Anggota
                                        </Button>
                                    </div>

                                    {fields.length === 0 && (
                                        <p className="text-xs text-muted-foreground italic bg-muted/50 p-3 rounded-md border border-dashed text-center">
                                            Belum ada anggota yang didaftarkan. Klik "Tambah Anggota" untuk memulai.
                                        </p>
                                    )}

                                    <div className="space-y-3">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-card p-4 rounded-md border shadow-sm group">
                                                <div className="grid flex-grow grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                                    <FormField
                                                        control={form.control}
                                                        name={`teamMembers.${index}.name`}
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-1">
                                                                <FormLabel className="text-xs">Nama Anggota</FormLabel>
                                                                <FormControl><Input placeholder="Nama lengkap" {...field} /></FormControl>
                                                                <FormMessage className="text-[10px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`teamMembers.${index}.institution`}
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-1">
                                                                <FormLabel className="text-xs">Asal Institusi</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-10">
                                                                            <SelectValue placeholder="Pilih Institusi" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {institutions.map((inst) => (
                                                                            <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage className="text-[10px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    className="text-destructive hover:bg-destructive/10 h-10 w-10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <FormField control={form.control} name="agreement" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-destructive/5 border-destructive/20">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-bold">Pernyataan Integritas Proyek</FormLabel>
                                <FormDescription className="text-xs">
                                    Saya mengerti bahwa proyek ini akan melewati proses kurasi yang ketat oleh tim Codebusters TU & UMB. Saya menyatakan bahwa ide ini orisinal dan tim kami siap untuk mempresentasikan kelayakan teknis di hadapan dewan penilai.
                                </FormDescription>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )} />

                    <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20" disabled={isLoading || !user}>
                        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {isLoading ? 'Processing Proposal...' : 'Submit Project Proposal'}
                    </Button>
                    {!user && (
                        <Alert variant="destructive">
                            <AlertTitle>Otentikasi Diperlukan</AlertTitle>
                            <AlertDescription>Anda harus masuk ke akun Tel-Nect Anda untuk mengirimkan proposal proyek.</AlertDescription>
                        </Alert>
                    )}
                </div>
            </form>
        </Form>
    );
}
