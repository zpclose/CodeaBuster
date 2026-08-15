'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { useLiveEvents } from '@/hooks/useLiveEvents';
import {
    createLiveEvent,
    updateLiveEvent,
    deleteLiveEvent,
    toggleLiveEventVisible,
} from '@/lib/content-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
    Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft,
    CalendarDays, MapPin, Users, Clock, Building2, X
} from 'lucide-react';
import Link from 'next/link';
import ImageUploader from '@/app/admin/components/ImageUploader';
import DeleteConfirmDialog from '@/app/admin/components/DeleteConfirmDialog';
import type { LiveEvent, LiveEventFormData, LiveEventStatus } from '@/types/content';

const UNIVERSITIES = ['Telkom University', 'Universitas Mercu Buana', 'Keduanya'];

const STATUS_OPTIONS: LiveEventStatus[] = [
    'Akan Berlangsung',
    'Sedang Berlangsung',
    'Selesai',
];

const STATUS_COLORS: Record<LiveEventStatus, string> = {
    'Akan Berlangsung': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'Sedang Berlangsung': 'bg-green-500/10 text-green-600 border-green-500/20',
    'Selesai': 'bg-muted text-muted-foreground border-border',
};

const EMPTY_FORM: LiveEventFormData = {
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    university: 'Telkom University',
    teamName: '',
    teamMembers: [],
    status: 'Akan Berlangsung',
    imageUrl: '',
    imageId: '',
    isVisible: true,
    displayLimit: 3,
    order: 0,
};

export default function LiveEventsAdminPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { events, isLoading } = useLiveEvents();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<LiveEvent | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<LiveEvent | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<LiveEventFormData>({ ...EMPTY_FORM });
    const [newMemberName, setNewMemberName] = useState('');

    // --- Dialog Handlers ---
    const handleOpenDialog = (event?: LiveEvent) => {
        if (event) {
            setEditingEvent(event);
            setFormData({
                title: event.title,
                description: event.description,
                eventDate: event.eventDate,
                eventTime: event.eventTime,
                location: event.location,
                university: event.university,
                teamName: event.teamName,
                teamMembers: event.teamMembers || [],
                status: event.status,
                imageUrl: event.imageUrl,
                imageId: event.imageId || '',
                isVisible: event.isVisible,
                displayLimit: event.displayLimit || 3,
                order: event.order,
            });
        } else {
            setEditingEvent(null);
            setFormData({ ...EMPTY_FORM, order: events.length });
        }
        setNewMemberName('');
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingEvent(null);
        setFormData({ ...EMPTY_FORM });
        setNewMemberName('');
    };

    const handleSave = async () => {
        if (!firestore) return;
        if (!formData.title.trim()) {
            toast({ title: 'Validasi Gagal', description: 'Nama event wajib diisi.', variant: 'destructive' });
            return;
        }
        if (!formData.eventDate) {
            toast({ title: 'Validasi Gagal', description: 'Tanggal event wajib diisi.', variant: 'destructive' });
            return;
        }
        if (!formData.teamName.trim()) {
            toast({ title: 'Validasi Gagal', description: 'Nama tim wajib diisi.', variant: 'destructive' });
            return;
        }

        setIsSaving(true);
        try {
            if (editingEvent) {
                await updateLiveEvent(firestore, editingEvent.id, formData);
                toast({ title: 'Berhasil!', description: 'Event berhasil diupdate.' });
            } else {
                await createLiveEvent(firestore, formData);
                toast({ title: 'Berhasil!', description: 'Event berhasil ditambahkan.' });
            }
            handleCloseDialog();
        } catch (err) {
            toast({ title: 'Error', description: 'Gagal menyimpan event.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!firestore || !eventToDelete) return;
        try {
            await deleteLiveEvent(firestore, eventToDelete.id);
            toast({ title: 'Dihapus', description: 'Event berhasil dihapus.' });
            setDeleteConfirmOpen(false);
            setEventToDelete(null);
        } catch {
            toast({ title: 'Error', description: 'Gagal menghapus event.', variant: 'destructive' });
        }
    };

    const handleToggleVisible = async (event: LiveEvent) => {
        if (!firestore) return;
        try {
            await toggleLiveEventVisible(firestore, event.id, !event.isVisible);
            toast({
                title: event.isVisible ? 'Disembunyikan' : 'Ditampilkan',
                description: `Event "${event.title}" ${event.isVisible ? 'disembunyikan' : 'ditampilkan'} di homepage.`,
            });
        } catch {
            toast({ title: 'Error', description: 'Gagal mengubah visibilitas.', variant: 'destructive' });
        }
    };

    // --- Team Member Handlers ---
    const handleAddMember = () => {
        const trimmed = newMemberName.trim();
        if (!trimmed) return;
        setFormData(prev => ({
            ...prev,
            teamMembers: [...(prev.teamMembers || []), { name: trimmed }],
        }));
        setNewMemberName('');
    };

    const handleRemoveMember = (index: number) => {
        setFormData(prev => ({
            ...prev,
            teamMembers: (prev.teamMembers || []).filter((_, i) => i !== index),
        }));
    };

    // --- Stats ---
    const totalEvents = events.length;
    const visibleEvents = events.filter(e => e.isVisible).length;
    const ongoingEvents = events.filter(e => e.status === 'Sedang Berlangsung').length;
    const upcomingEvents = events.filter(e => e.status === 'Akan Berlangsung').length;

    return (
        <div className="container py-4 lg:py-6 space-y-6 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/content"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Live Campus Events</h1>
                        <p className="text-sm text-muted-foreground">Kelola event & kegiatan kampus di beranda</p>
                    </div>
                </div>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <Plus className="h-4 w-4" /> Tambah Event
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
                {[
                    { label: 'Total Event', value: totalEvents, color: 'text-foreground' },
                    { label: 'Ditampilkan', value: visibleEvents, color: 'text-green-600' },
                    { label: 'Sedang Berlangsung', value: ongoingEvents, color: 'text-emerald-600' },
                    { label: 'Akan Berlangsung', value: upcomingEvents, color: 'text-blue-600' },
                ].map((stat) => (
                    <Card key={stat.label} className="shadow-none">
                        <CardContent className="p-4">
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table */}
            <Card className="shadow-none flex-1 flex flex-col overflow-hidden">
                <CardHeader className="flex-shrink-0 pb-3 border-b">
                    <CardTitle className="text-base">Daftar Event ({totalEvents})</CardTitle>
                </CardHeader>
                <div className="flex-1 overflow-y-auto">
                    {/* Table Header */}
                    <div className="grid grid-cols-[60px_minmax(180px,2fr)_140px_130px_120px_100px_110px] gap-3 px-6 py-3 border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0">
                        <span>Gambar</span>
                        <span>Event</span>
                        <span>Tanggal & Waktu</span>
                        <span>Tim</span>
                        <span>Kampus</span>
                        <span>Status</span>
                        <span className="text-right">Aksi</span>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-16 text-muted-foreground">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
                            Memuat...
                        </div>
                    ) : events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                            <CalendarDays className="h-10 w-10 opacity-30" />
                            <p className="text-sm">Belum ada event. Tambah event pertama!</p>
                        </div>
                    ) : (
                        events.map((event) => (
                            <div
                                key={event.id}
                                className="grid grid-cols-[60px_minmax(180px,2fr)_140px_130px_120px_100px_110px] gap-3 px-6 py-4 border-b hover:bg-muted/20 transition-colors items-center"
                            >
                                {/* Thumbnail */}
                                <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                    {event.imageUrl ? (
                                        <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <CalendarDays className="h-5 w-5 text-muted-foreground/40" />
                                        </div>
                                    )}
                                </div>

                                {/* Title & Description */}
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm truncate">{event.title}</p>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">{event.description}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground truncate">{event.location}</span>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="text-xs text-muted-foreground space-y-0.5">
                                    <div className="flex items-center gap-1">
                                        <CalendarDays className="h-3 w-3" />
                                        <span>{event.eventDate}</span>
                                    </div>
                                    {event.eventTime && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{event.eventTime}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Team */}
                                <div className="text-xs min-w-0">
                                    <p className="font-medium truncate">{event.teamName}</p>
                                    <p className="text-muted-foreground">{event.teamMembers?.length || 0} anggota</p>
                                </div>

                                {/* University */}
                                <div className="text-xs text-muted-foreground truncate">
                                    <Building2 className="h-3 w-3 inline mr-1" />
                                    {event.university === 'Keduanya' ? 'Keduanya' : event.university === 'Telkom University' ? 'Telkom' : 'Mercu Buana'}
                                </div>

                                {/* Status */}
                                <div>
                                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${STATUS_COLORS[event.status]}`}>
                                        {event.status}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        title={event.isVisible ? 'Sembunyikan' : 'Tampilkan'}
                                        onClick={() => handleToggleVisible(event)}
                                    >
                                        {event.isVisible
                                            ? <Eye className="h-3.5 w-3.5 text-green-500" />
                                            : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => handleOpenDialog(event)}
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => { setEventToDelete(event); setDeleteConfirmOpen(true); }}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingEvent ? 'Edit Event' : 'Tambah Event Baru'}</DialogTitle>
                        <DialogDescription>
                            {editingEvent ? 'Perbarui informasi event kampus.' : 'Tambahkan event atau kegiatan kampus yang sedang berlangsung.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        {/* Gambar */}
                        <div className="space-y-2">
                            <Label>Gambar Event</Label>
                            <ImageUploader
                                contentType="live-events"
                                contentId={editingEvent?.id || 'new'}
                                currentImageUrl={formData.imageUrl}
                                onUploadComplete={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                                onDelete={() => setFormData(prev => ({ ...prev, imageUrl: '', imageId: '' }))}
                                maxSizeMB={10}
                            />
                        </div>

                        {/* Nama Event */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Nama Event <span className="text-destructive">*</span></Label>
                            <Input
                                id="title"
                                placeholder="Contoh: GEMASTIK XVII — Divisi Keamanan Siber"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi Singkat</Label>
                            <Textarea
                                id="description"
                                placeholder="Deskripsi singkat tentang event ini..."
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>

                        {/* Tanggal, Waktu, Lokasi */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="eventDate">Tanggal <span className="text-destructive">*</span></Label>
                                <Input
                                    id="eventDate"
                                    type="date"
                                    value={formData.eventDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="eventTime">Waktu</Label>
                                <Input
                                    id="eventTime"
                                    type="time"
                                    value={formData.eventTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, eventTime: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Lokasi</Label>
                            <Input
                                id="location"
                                placeholder="Contoh: Gedung Damar, Telkom University"
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            />
                        </div>

                        {/* Kampus */}
                        <div className="space-y-2">
                            <Label>Kampus</Label>
                            <Select
                                value={formData.university}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, university: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kampus" />
                                </SelectTrigger>
                                <SelectContent>
                                    {UNIVERSITIES.map(u => (
                                        <SelectItem key={u} value={u}>{u}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Nama Tim */}
                        <div className="space-y-2">
                            <Label htmlFor="teamName">Nama Tim <span className="text-destructive">*</span></Label>
                            <Input
                                id="teamName"
                                placeholder="Contoh: Tim Sifonix"
                                value={formData.teamName}
                                onChange={(e) => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
                            />
                        </div>

                        {/* Anggota Tim */}
                        <div className="space-y-2">
                            <Label>Anggota Tim</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Nama anggota..."
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddMember(); } }}
                                />
                                <Button type="button" variant="outline" onClick={handleAddMember}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            {(formData.teamMembers || []).length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {(formData.teamMembers || []).map((member, idx) => (
                                        <span
                                            key={idx}
                                            className="flex items-center gap-1 bg-muted text-sm px-3 py-1 rounded-full"
                                        >
                                            {member.name}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMember(idx)}
                                                className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Status & Visibilitas */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, status: val as LiveEventStatus }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map(s => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tampil di Homepage</Label>
                                <Select
                                    value={formData.isVisible ? 'true' : 'false'}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, isVisible: val === 'true' }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Tampilkan</SelectItem>
                                        <SelectItem value="false">Sembunyikan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Display Limit & Order */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="displayLimit">Maks. Event di Homepage</Label>
                                <Input
                                    id="displayLimit"
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={formData.displayLimit}
                                    onChange={(e) => setFormData(prev => ({ ...prev, displayLimit: Number(e.target.value) }))}
                                />
                                <p className="text-xs text-muted-foreground">Berapa event yg ditampilkan sekaligus di homepage</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="order">Urutan Tampil</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    min={0}
                                    value={formData.order}
                                    onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog} disabled={isSaving}>Batal</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Menyimpan...' : editingEvent ? 'Simpan Perubahan' : 'Tambah Event'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <DeleteConfirmDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                onConfirm={handleDelete}
                title="Hapus Event?"
                description={`Event "${eventToDelete?.title}" akan dihapus permanen beserta gambarnya.`}
            />
        </div>
    );
}
