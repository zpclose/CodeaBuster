'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2, UserCog, Shield, Crown, User, MoreVertical } from 'lucide-react';
import { fetchAdmins, addAdmin, editAdmin, removeAdmin } from './actions';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface AdminItem {
    id: string;
    email: string;
    role: 'owner' | 'admin';
    displayName: string;
    createdAt: number;
    updatedAt: number;
}

export default function ManageAdminsPage() {
    const [admins, setAdmins] = useState<AdminItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    // Add dialog
    const [addOpen, setAddOpen] = useState(false);
    const [addEmail, setAddEmail] = useState('');
    const [addPassword, setAddPassword] = useState('');
    const [addName, setAddName] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    // Edit dialog
    const [editOpen, setEditOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AdminItem | null>(null);
    const [editName, setEditName] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    // Delete dialog
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<AdminItem | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const loadAdmins = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchAdmins();
            setAdmins(data as AdminItem[]);
        } catch (err) {
            toast({ title: 'Error', description: 'Gagal memuat daftar admin.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => { loadAdmins(); }, [loadAdmins]);

    const handleAdd = async () => {
        if (!addEmail || !addPassword || !addName) {
            toast({ title: 'Error', description: 'Semua field harus diisi.', variant: 'destructive' });
            return;
        }
        setAddLoading(true);
        try {
            const result = await addAdmin(addEmail, addPassword, addName);
            if (result.success) {
                toast({ title: 'Berhasil', description: `Admin ${addEmail} berhasil ditambahkan.` });
                setAddOpen(false);
                setAddEmail(''); setAddPassword(''); setAddName('');
                loadAdmins();
            } else {
                toast({ title: 'Gagal', description: result.error, variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Error', description: 'Gagal menambahkan admin.', variant: 'destructive' });
        } finally {
            setAddLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!editTarget) return;
        if (!editName && !editPassword) {
            toast({ title: 'Error', description: 'Isi minimal satu field.', variant: 'destructive' });
            return;
        }
        setEditLoading(true);
        try {
            const data: { displayName?: string; password?: string } = {};
            if (editName) data.displayName = editName;
            if (editPassword) data.password = editPassword;
            const result = await editAdmin(editTarget.email, data);
            if (result.success) {
                toast({ title: 'Berhasil', description: `Admin ${editTarget.email} berhasil diupdate.` });
                setEditOpen(false);
                setEditTarget(null); setEditName(''); setEditPassword('');
                loadAdmins();
            } else {
                toast({ title: 'Gagal', description: result.error, variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Error', description: 'Gagal mengupdate admin.', variant: 'destructive' });
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            const result = await removeAdmin(deleteTarget.email);
            if (result.success) {
                toast({ title: 'Berhasil', description: `Admin ${deleteTarget.email} berhasil dihapus.` });
                setDeleteOpen(false);
                setDeleteTarget(null);
                loadAdmins();
            } else {
                toast({ title: 'Gagal', description: result.error, variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Error', description: 'Gagal menghapus admin.', variant: 'destructive' });
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-r from-background to-background/50 p-6 sm:p-8 rounded-3xl border border-border/50 shadow-sm backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none" />

                <div className="relative z-10 flex items-start gap-5">
                    <div className="hidden sm:flex h-16 w-16 bg-primary/10 rounded-2xl items-center justify-center border border-primary/20 text-primary shadow-inner">
                        <UserCog className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold font-headline tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                            Otoritas Sistem
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm max-w-xl leading-relaxed">
                            Kelola akses pengguna dengan hak istimewa (Admin/Owner) ke portal kontrol pusat.
                        </p>
                    </div>
                </div>

                <div className="relative z-10">
                    <Button onClick={() => setAddOpen(true)} className="rounded-full shadow-md shadow-primary/20 hover:shadow-lg transition-all px-6 py-5">
                        <Plus className="mr-2 h-5 w-5" />
                        Tambah Admin Baru
                    </Button>
                </div>
            </div>

            {/* Custom Data List */}
            <div className="rounded-3xl border border-border/60 bg-background overflow-hidden relative shadow-sm">
                <div className="p-6 border-b border-border/60 bg-muted/20">
                    <h3 className="font-headline font-bold text-lg">Daftar Admin Aktif</h3>
                    <p className="text-xs text-muted-foreground mt-1">Admin yang memiliki wewenang mengelola data Tel-Nect.</p>
                </div>

                <div className="p-2 sm:p-4">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {admins.map((admin) => (
                                <div key={admin.id} className="relative group p-5 rounded-2xl bg-muted/30 border border-border/50 hover:bg-background hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                                    <div className="absolute top-4 right-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl border-border/50 shadow-lg">
                                                <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => {
                                                    setEditTarget(admin);
                                                    setEditName(admin.displayName);
                                                    setEditPassword('');
                                                    setEditOpen(true);
                                                }}>
                                                    <Pencil className="h-4 w-4 mr-2" /> Edit Info
                                                </DropdownMenuItem>
                                                {admin.role !== 'owner' && (
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => {
                                                            setDeleteTarget(admin);
                                                            setDeleteOpen(true);
                                                        }}>
                                                        <Trash2 className="h-4 w-4 mr-2" /> Hapus Akses
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="flex items-center gap-4 mb-5 mt-2">
                                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-inner">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg tracking-tight truncate max-w-[150px]">{admin.displayName}</h4>
                                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{admin.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-border/40">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Level Akses</span>
                                            {admin.role === 'owner' ? (
                                                <Badge className="bg-amber-500 hover:bg-amber-600 text-[10px] rounded-full px-2 border-none">
                                                    <Crown className="h-3 w-3 mr-1" />
                                                    OWNER
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-sky-500 text-white hover:bg-sky-600 text-[10px] rounded-full px-2 border-none">
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    ADMIN
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Bergabung</span>
                                            <span className="text-xs font-medium">
                                                {new Date(admin.createdAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {admins.length === 0 && (
                                <div className="col-span-full py-20 text-center flex flex-col items-center">
                                    <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                        <Shield className="h-8 w-8 text-muted-foreground/50" />
                                    </div>
                                    <h3 className="text-lg font-bold">Belum ada Admin</h3>
                                    <p className="text-sm text-muted-foreground">Silakan tambahkan admin baru untuk mengelola sistem.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Admin Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Tambah Admin Baru</DialogTitle>
                        <DialogDescription>Beri akses admin baru untuk mengelola portal ini.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nama Tampilan</Label>
                            <Input className="rounded-xl bg-muted/30" placeholder="Nama lengkap admin" value={addName} onChange={(e) => setAddName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email Terdaftar</Label>
                            <Input className="rounded-xl bg-muted/30" type="email" placeholder="admin@domain.com" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Kata Sandi Akses</Label>
                            <Input className="rounded-xl bg-muted/30" type="password" placeholder="Min. 6 karakter rahasia" value={addPassword} onChange={(e) => setAddPassword(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-xl" onClick={() => setAddOpen(false)} disabled={addLoading}>Batal</Button>
                        <Button className="rounded-xl" onClick={handleAdd} disabled={addLoading}>
                            {addLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Registrasi Admin
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Admin Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Otoritas Profil</DialogTitle>
                        <DialogDescription>Mengubah detail dari <strong>{editTarget?.email}</strong></DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nama Tampilan Baru</Label>
                            <Input className="rounded-xl bg-muted/30" value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Keamanan (Kata Sandi Baru)</Label>
                            <Input className="rounded-xl bg-muted/30" type="password" placeholder="Kosongkan jika tak diubah" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-xl" onClick={() => setEditOpen(false)} disabled={editLoading}>Batal</Button>
                        <Button className="rounded-xl" onClick={handleEdit} disabled={editLoading}>
                            {editLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Terapkan Perubahan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl border-destructive/20">
                    <DialogHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <DialogTitle className="text-center text-xl">Cabut Otoritas?</DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            Tindakan ini permanen. <strong>{deleteTarget?.email}</strong> akan kehilangan seluruh hak aksesnya ke panel pengawasan ini.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center mt-4">
                        <Button variant="outline" className="rounded-xl" onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>Batal</Button>
                        <Button variant="destructive" className="rounded-xl shadow-md" onClick={handleDelete} disabled={deleteLoading}>
                            {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Cabut Akses
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
