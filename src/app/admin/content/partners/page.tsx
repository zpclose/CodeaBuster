'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { useNetworkPartners } from '@/hooks/useNetworkPartners';
import { createNetworkPartner, updateNetworkPartner, deleteNetworkPartner, toggleNetworkPartnerActive } from '@/lib/content-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import Link from 'next/link';
import type { NetworkPartner, NetworkPartnerFormData, PartnerStatus } from '@/types/content';
import ImageUploader from '@/app/admin/components/ImageUploader';
import DeleteConfirmDialog from '@/app/admin/components/DeleteConfirmDialog';
import { cn } from '@/lib/utils';

import { CreatableSelect } from '@/app/admin/components/CreatableSelect';

const DEFAULT_REGIONS = [
    "DKI Jakarta", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Banten", "Yogyakarta",
    "Bali", "Sumatera Utara", "Sulawesi Selatan", "Luar Negeri"
];

export default function PartnersAdminPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { partners, isLoading } = useNetworkPartners();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<NetworkPartner | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [partnerToDelete, setPartnerToDelete] = useState<NetworkPartner | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<NetworkPartnerFormData>({
        name: '',
        city: '',
        region: 'DKI Jakarta',
        status: 'Community Partner',
        specialization: '',
        established: new Date().getFullYear(),
        imageUrl: '',
        description: '',
        website: '',
        isActive: true,
        order: 0,
    });

    // Derive unique regions merging defaults and existing data
    const uniqueRegions = Array.from(new Set([
        ...DEFAULT_REGIONS,
        ...partners.map(p => p.region)
    ])).sort();

    const handleOpenDialog = (partner?: NetworkPartner) => {
        if (partner) {
            setEditingPartner(partner);
            setFormData({
                name: partner.name,
                city: partner.city,
                region: partner.region,
                status: partner.status,
                specialization: partner.specialization,
                established: partner.established,
                imageUrl: partner.imageUrl,
                description: partner.description || '',
                website: partner.website || '',
                isActive: partner.isActive,
                order: partner.order,
            });
        } else {
            setEditingPartner(null);
            setFormData({
                name: '',
                city: '',
                region: 'DKI Jakarta',
                status: 'Community Partner',
                specialization: '',
                established: new Date().getFullYear(),
                imageUrl: '',
                description: '',
                website: '',
                isActive: true,
                order: partners.length,
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!firestore || !formData.imageUrl) {
            toast({
                title: 'Validation Error',
                description: 'Please fill all required fields and upload an image',
                variant: 'destructive',
            });
            return;
        }

        setIsSaving(true);

        try {
            if (editingPartner) {
                await updateNetworkPartner(firestore, editingPartner.id, formData);
                toast({ title: 'Success', description: 'Partner updated successfully' });
            } else {
                await createNetworkPartner(firestore, formData);
                toast({ title: 'Success', description: 'Partner created successfully' });
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Save error:', error);
            toast({
                title: 'Error',
                description: 'Failed to save partner',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!firestore || !partnerToDelete) return;

        try {
            await deleteNetworkPartner(firestore, partnerToDelete.id);
            toast({ title: 'Success', description: 'Partner deleted successfully' });
            setDeleteConfirmOpen(false);
            setPartnerToDelete(null);
        } catch (error) {
            console.error('Delete error:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete partner',
                variant: 'destructive',
            });
        }
    };

    const handleToggleActive = async (partner: NetworkPartner) => {
        if (!firestore) return;

        try {
            await toggleNetworkPartnerActive(firestore, partner.id, !partner.isActive);
            toast({
                title: 'Success',
                description: `Partner ${partner.isActive ? 'deactivated' : 'activated'}`,
            });
        } catch (error) {
            console.error('Toggle error:', error);
            toast({
                title: 'Error',
                description: 'Failed to update status',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="container py-2 lg:py-4 space-y-6 flex flex-col h-[calc(100vh-theme(spacing.28))] lg:h-[calc(100vh-theme(spacing.20))] overflow-hidden">
            {/* Fix Partner Images */}


            {/* Header section (Fixed) */}
            <div className="shrink-0 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Network Partners Management</h1>
                    <p className="text-muted-foreground font-medium">Manage campus partners and collaborations</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="shadow-sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Partner
                </Button>
            </div>

            {/* Stats section (Fixed) */}
            <div className="shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{partners.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Founding Chapters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {partners.filter(p => p.status === 'Founding Chapter').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Strategic Partners</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {partners.filter(p => p.status === 'Strategic Partner').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {partners.filter(p => p.isActive).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="flex flex-col flex-1 min-h-0 border-border/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar flex flex-col h-full w-full">
                    {/* Fixed Card Header + Table Header merged */}
                    <div className="shrink-0 bg-muted/20 border-b border-border/50 min-w-[950px]">
                        <CardHeader className="py-4 px-6 pb-2">
                            <CardTitle>All Network Partners</CardTitle>
                            <CardDescription>A list of all network partners in the system</CardDescription>
                        </CardHeader>
                        <div className="grid grid-cols-[80px_minmax(180px,2fr)_minmax(120px,1fr)_minmax(120px,1fr)_150px_100px_100px] gap-4 px-6 py-3 text-sm font-medium text-muted-foreground mt-2 border-b border-border/30">
                            <div>Image</div>
                            <div>Name</div>
                            <div>City</div>
                            <div>Region</div>
                            <div>Status</div>
                            <div>Active</div>
                            <div className="text-right">Actions</div>
                        </div>
                    </div>
                    {/* Scrollable Table Body */}
                    <CardContent className="flex-1 overflow-y-auto p-0 min-w-[950px]">
                        {isLoading ? (
                            <div className="py-8 text-center text-muted-foreground w-full">Loading...</div>
                        ) : partners.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground w-full">
                                No partners found. Add your first partner!
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {partners.map((partner) => (
                                    <div key={partner.id} className="grid grid-cols-[80px_minmax(180px,2fr)_minmax(120px,1fr)_minmax(120px,1fr)_150px_100px_100px] gap-4 px-6 py-3 text-sm border-b border-border/40 items-center hover:bg-muted/30 transition-colors">
                                        <div className="w-[80px]">
                                            <div className="relative h-12 w-16 rounded-lg overflow-hidden border border-border/50 shadow-sm">
                                                {partner.imageUrl ? (
                                                    <ImageWithSkeleton
                                                        src={partner.imageUrl}
                                                        alt={partner.name}
                                                        fill
                                                        className="object-cover"
                                                        skeletonClassName="rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="text-muted-foreground text-xs font-medium">{partner.name.charAt(0)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="font-medium truncate pr-2">{partner.name}</div>
                                        <div className="truncate pr-2">{partner.city}</div>
                                        <div className="truncate pr-2"><Badge variant="outline" className="font-normal">{partner.region}</Badge></div>
                                        <div>
                                            <Badge variant={
                                                partner.status === 'Founding Chapter' ? 'default' :
                                                    partner.status === 'Strategic Partner' ? 'secondary' : 'outline'
                                            } className={partner.status === 'Founding Chapter' ? 'shadow-sm' : ''}>
                                                {partner.status}
                                            </Badge>
                                        </div>
                                        <div>
                                            <Badge variant={partner.isActive ? 'default' : 'secondary'} className={partner.isActive ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-0 shadow-none' : 'text-muted-foreground'}>
                                                {partner.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <div className="text-right flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleToggleActive(partner)}
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                title={partner.isActive ? "Hide Partner" : "Show Partner"}
                                            >
                                                {partner.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    handleOpenDialog(partner);
                                                }}
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setPartnerToDelete(partner);
                                                    setDeleteConfirmOpen(true);
                                                }}
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </div>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingPartner ? 'Edit Partner' : 'Add Partner'}</DialogTitle>
                        <DialogDescription>
                            {editingPartner ? 'Update partner information' : 'Add a new network partner'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label>Campus/Partner Image *</Label>
                            <ImageUploader
                                contentType="partners"
                                contentId={editingPartner?.id || 'new'}
                                currentImageUrl={formData.imageUrl}
                                onUploadComplete={(url) => setFormData({ ...formData, imageUrl: url })}
                                onDelete={() => setFormData({ ...formData, imageUrl: '' })}
                            />
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Universitas Indonesia"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Jakarta"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="region">Region *</Label>
                                <CreatableSelect
                                    value={formData.region}
                                    onChange={(value) => setFormData({ ...formData, region: value })}
                                    options={uniqueRegions}
                                    placeholder="Select or type region..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value as PartnerStatus })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Founding Chapter">Founding Chapter</SelectItem>
                                        <SelectItem value="Strategic Partner">Strategic Partner</SelectItem>
                                        <SelectItem value="Community Partner">Community Partner</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="established">Established Year *</Label>
                                <Input
                                    id="established"
                                    type="number"
                                    value={formData.established}
                                    onChange={(e) => setFormData({ ...formData, established: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="specialization">Specialization *</Label>
                            <Input
                                id="specialization"
                                value={formData.specialization}
                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                placeholder="AI & Cloud Architecture, Fintech Development, etc."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description about the partner..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://example.com"
                            />
                        </div>

                        {/* Order */}
                        <div className="space-y-2">
                            <Label htmlFor="order">Display Order</Label>
                            <Input
                                id="order"
                                type="number"
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : editingPartner ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <DeleteConfirmDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                onConfirm={handleDelete}
                description="This will permanently delete this partner. This action cannot be undone."
            />
        </div>
    );
}
