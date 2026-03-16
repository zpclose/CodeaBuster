'use client';

import SettingsLayout from '../SettingsLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Github, Linkedin, Slack, Search, CheckCircle, Gitlab } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';

const serviceCategories = ['Semua', 'Code Repository', 'Professional', 'Communication', 'Design', 'Productivity'];

function ServiceCatalogDialog({ allServices, onConnect, open, onOpenChange }: { allServices: any[], onConnect: (name: string) => void, open: boolean, onOpenChange: (open: boolean) => void }) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('Semua');

    const filteredServices = useMemo(() => {
        return allServices.filter(service => {
            const matchesCategory = filter === 'Semua' || service.category === filter;
            const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [search, filter, allServices]);
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="link" className="text-muted-foreground mx-auto">Lihat Semua Layanan yang Kompatibel</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Katalog Layanan Kompatibel</DialogTitle>
                    <DialogDescription>
                        Temukan dan hubungkan semua layanan pihak ketiga yang dapat mengintegrasikan data dengan profil Anda.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Cari layanan..."
                            className="pl-10 focus-visible:ring-primary"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {serviceCategories.map(category => (
                            <Button 
                                key={category}
                                variant={filter === category ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter(category)}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[40vh] overflow-y-auto pr-2">
                        {filteredServices.map(service => (
                            <Card key={service.name} className="flex flex-col items-center justify-center p-4 text-center">
                                <div className="relative mb-3">
                                    {service.icon}
                                    {service.connected && (
                                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                                            <CheckCircle className="h-4 w-4 text-white" />
                                        </div>
                                    )}
                                </div>
                                <p className="font-semibold text-sm mb-3">{service.name}</p>
                                {service.connected ? (
                                    <span className="text-xs font-medium text-muted-foreground">Terhubung</span>
                                ) : (
                                    <Button variant="outline" size="sm" onClick={() => onConnect(service.name)}>Hubungkan</Button>
                                )}
                            </Card>
                        ))}
                         {filteredServices.length === 0 && (
                            <div className="col-span-full text-center py-8 text-muted-foreground">
                                <p>Tidak ada layanan yang cocok.</p>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter className="sm:justify-between">
                    <DialogClose asChild>
                        <Button variant="ghost">Tutup Katalog</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


function IntegrationsForm() {
    const { toast } = useToast();
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);

    const initialServices = [
        { name: 'GitHub', category: 'Code Repository', icon: <Github className="h-8 w-8" />, connected: true, accountName: 'Benedict', connectedDate: '2023-01-15' },
        { name: 'LinkedIn', category: 'Professional', icon: <Linkedin className="h-8 w-8 text-[#0A66C2]" />, connected: true, accountName: 'Benedict', connectedDate: '2023-02-20' },
        { name: 'Slack', category: 'Communication', icon: <Slack className="h-8 w-8 text-[#4A154B]" />, connected: false },
        { name: 'GitLab', category: 'Code Repository', icon: <Gitlab className="h-8 w-8 text-[#FC6D26]" />, connected: false },
        { name: 'Behance', category: 'Design', icon: <svg className="h-8 w-8" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Behance</title><path d="M8.22.002H0v7.12h8.22c.05-4.133.05-7.118 0-7.118zm10.74 3.018c-2.283 0-4.008 1.637-4.008 3.99s1.725 4.01 4.008 4.01c2.284 0 4.008-1.63 4.008-4.01.01-2.353-1.724-3.99-4.008-3.99zM24 16.295H13.88V24h8.86c.05-4.14.05-7.705 1.26-7.705zM8.22 8.752H0v7.118h8.22c.05-4.133.05-7.118 0-7.118z"/></svg>, connected: false },
        { name: 'Figma', category: 'Design', icon: <svg className="h-8 w-8" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Figma</title><path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z" fill="#f24e1e"/><path d="M12.5 18a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" fill="#ff7262"/><path d="M12.5 13a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" fill="#a259ff"/><path d="M12.5 8a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" fill="#1abcfe"/><path d="M7.5 13a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" fill="#0acf83"/><path d="M17.5 13a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" fill="#ff7262"/></svg>, connected: false },
        { name: 'Jira', category: 'Productivity', icon: <svg className="h-8 w-8" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Jira</title><path d="M12.43 23.31l-9.5-9.49a1.5 1.5 0 010-2.12l9.5-9.49a1.5 1.5 0 012.12 0l9.5 9.49a1.5 1.5 0 010 2.12l-9.5 9.49a1.5 1.5 0 01-2.12 0zm-8.08-10.6l8.08 8.08 8.08-8.08-8.08-8.07z" fill="#0052CC"/></svg>, connected: false },
        { name: 'Trello', category: 'Productivity', icon: <svg className="h-8 w-8" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Trello</title><path d="M21 2H3c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM11 18H6V6h5v12zm7 0h-5V6h5v12z" fill="#0079BF"/></svg>, connected: false },
    ];
    
    const [allServices, setAllServices] = useState(initialServices);

    const connectedAccounts = allServices.filter(s => s.connected);
    const availableConnections = allServices.filter(s => !s.connected);


    const handleDisconnectAccount = (name: string) => {
        setAllServices(prev => prev.map(s => s.name === name ? { ...s, connected: false } : s));
        toast({ title: "Koneksi Diputuskan", description: `Koneksi dengan ${name} telah berhasil dihapus.` });
    };

    const handleConnectAccount = (name: string) => {
        setAllServices(prev => prev.map(s => s.name === name ? { ...s, connected: true } : s));
        toast({ title: "Akun Terhubung", description: `Akun ${name} Anda telah berhasil terhubung.` });
        setIsCatalogOpen(false);
    };

    return (
        <div className="space-y-8">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Akun Layanan Terhubung</CardTitle>
                    <CardDescription>
                        Ini adalah layanan pihak ketiga yang telah Anda otorisasi untuk mengakses data profil Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {connectedAccounts.map((account) => (
                        <div key={account.name} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                            <div className="flex items-center gap-4">
                                {React.cloneElement(account.icon as React.ReactElement, { className: "h-6 w-6" })}
                                <div>
                                    <p className="font-semibold">{account.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Terhubung sebagai <span className="font-medium text-primary">{account.accountName}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Sejak: {account.connectedDate ? new Date(account.connectedDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                                    </p>
                                </div>
                            </div>
                            <Button variant="link" className="text-destructive hover:text-destructive/80 p-0 h-auto self-start sm:self-center" onClick={() => handleDisconnectAccount(account.name)}>
                                Putuskan Koneksi
                            </Button>
                        </div>
                    ))}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableConnections.slice(0, 3).map(service => (
                            <Card key={service.name} className="flex flex-col items-center justify-center p-6 text-center">
                                <div className="mb-4">{service.icon}</div>
                                <p className="font-semibold mb-4">{service.name}</p>
                                <Button variant="outline" onClick={() => handleConnectAccount(service.name)}>Hubungkan Akun</Button>
                            </Card>
                        ))}
                    </div>
                </CardContent>
                 <CardFooter>
                    <ServiceCatalogDialog allServices={allServices} onConnect={handleConnectAccount} open={isCatalogOpen} onOpenChange={setIsCatalogOpen} />
                </CardFooter>
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
