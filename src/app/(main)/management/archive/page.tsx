
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Search, ChevronDown, CheckCircle, Layers, Bot, XCircle, FileText } from 'lucide-react';
import { executiveCouncil, divisionDirectors } from '../page-data';

const allLeaders = [...executiveCouncil, ...divisionDirectors];

const fullDirectiveHistory = [
    {
        id: 'DIR-001',
        title: "Peluncuran Program Mentorship 2.0",
        date: "2024-07-15",
        status: "DISETUJUI",
        leaderId: "ketua-umum",
        summary: "Program mentorship baru dengan integrasi AI untuk penjodohan mentor-mentee.",
    },
    {
        id: 'DIR-002',
        title: "Standarisasi Proses Kontribusi Proyek",
        date: "2024-07-10",
        status: "DALAM PENGEMBANGAN",
        leaderId: "kepala-divisi-proyek",
        summary: "Menetapkan pedoman dan alur kerja standar untuk pengajuan dan kontribusi proyek.",
    },
    {
        id: 'DIR-003',
        title: "Kemitraan Strategis dengan Startup Lokal",
        date: "2024-06-28",
        status: "SELESAI",
        leaderId: "wakil-ketua",
        summary: "Menjalin kemitraan resmi dengan 3 startup untuk studi kasus dan peluang magang.",
    },
    {
        id: 'DIR-004',
        title: "Implementasi Sistem Poin Kontribusi",
        date: "2024-05-20",
        status: "SELESAI",
        leaderId: "kepala-divisi-acara",
        summary: "Sistem gamifikasi untuk memberi penghargaan kepada anggota yang paling aktif.",
    },
    {
        id: 'DIR-005',
        title: "Proposal Pembentukan Chapter Surabaya",
        date: "2024-04-15",
        status: "DITOLAK",
        leaderId: "wakil-ketua",
        summary: "Proposal ditolak karena belum memenuhi syarat minimum jumlah anggota awal.",
    },
    {
        id: 'DIR-006',
        title: "Pengembangan Kurikulum AI-Fintech",
        date: "2024-03-01",
        status: "SELESAI",
        leaderId: "kepala-divisi-proyek",
        summary: "Meluncurkan jalur pembelajaran baru yang berfokus pada AI dalam sektor finansial.",
    }
];

const statusConfig: { [key: string]: { icon: React.ReactNode, className: string } } = {
  DISETUJUI: { icon: <Bot className="h-4 w-4" />, className: "bg-blue-100 text-blue-800" },
  SELESAI: { icon: <CheckCircle className="h-4 w-4" />, className: "bg-green-100 text-green-800" },
  'DALAM PENGEMBANGAN': { icon: <Layers className="h-4 w-4" />, className: "bg-orange-100 text-orange-800" },
  DITOLAK: { icon: <XCircle className="h-4 w-4" />, className: "bg-red-100 text-red-800" },
};

export default function ArchivePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua');
    const [yearFilter, setYearFilter] = useState('Semua');

    const filteredDirectives = useMemo(() => {
        return fullDirectiveHistory.filter(item => {
            const date = new Date(item.date);
            const year = date.getFullYear().toString();
            
            const searchMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = statusFilter === 'Semua' || item.status === statusFilter;
            const yearMatch = yearFilter === 'Semua' || year === yearFilter;

            return searchMatch && statusMatch && yearMatch;
        });
    }, [searchTerm, statusFilter, yearFilter]);

    const availableYears = ['Semua', ...Array.from(new Set(fullDirectiveHistory.map(item => new Date(item.date).getFullYear().toString())))];
    const availableStatuses = ['Semua', ...Object.keys(statusConfig)];

    return (
        <div className="bg-background text-foreground min-h-screen">
            <div className="container py-12 md:py-16">
                <div className="max-w-5xl mx-auto">
                    <Card className="shadow-lg border">
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-4">
                                <FileText className="h-8 w-8 text-primary"/>
                                <div>
                                    <CardTitle className="font-headline text-3xl">Arsip Keputusan Dewan</CardTitle>
                                    <CardDescription>Database lengkap semua inisiatif dan keputusan strategis yang telah dicatat.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="relative md:col-span-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Cari inisiatif..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full md:w-auto justify-between">
                                            Status: {statusFilter} <ChevronDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {availableStatuses.map(status => (
                                            <DropdownMenuItem key={status} onSelect={() => setStatusFilter(status)}>{status}</DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full md:w-auto justify-between">
                                            Tahun: {yearFilter} <ChevronDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {availableYears.map(year => (
                                            <DropdownMenuItem key={year} onSelect={() => setYearFilter(year)}>{year}</DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead className="min-w-[250px]">Inisiatif</TableHead>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Penanggung Jawab</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredDirectives.map(item => {
                                            const leader = allLeaders.find(l => l.id === item.leaderId);
                                            const leaderImage = leader ? PlaceHolderImages.find(p => p.id === leader.imageId) : null;
                                            const statusInfo = statusConfig[item.status];
                                            return (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">{item.id}</TableCell>
                                                    <TableCell className="font-medium">{item.title}</TableCell>
                                                    <TableCell>{new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                                                    <TableCell>
                                                        {leader && (
                                                            <div className="flex items-center gap-2">
                                                                {leaderImage && <Image src={leaderImage.imageUrl} alt={leader.name} width={24} height={24} className="rounded-full h-6 w-6 object-cover" />}
                                                                <span className="text-xs font-medium">{leader.name}</span>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={statusInfo.className}>
                                                          <span className="mr-1.5">{statusInfo.icon}</span>  
                                                          {item.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm">Lihat Detail</Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                                {filteredDirectives.length === 0 && (
                                    <div className="text-center py-16 text-muted-foreground">
                                        <p>Tidak ada data arsip yang cocok dengan filter Anda.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
