
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { useCouncilDirectives } from '@/hooks/useCouncilDirectives';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { createCouncilDirective, updateCouncilDirective, deleteCouncilDirective, toggleCouncilDirectiveActive } from '@/lib/content-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import type { CouncilDirective, CouncilDirectiveFormData, DirectiveStatus } from '@/types/content';
import DeleteConfirmDialog from '@/app/admin/components/DeleteConfirmDialog';

export default function DirectivesAdminPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const { directives, isLoading } = useCouncilDirectives();
    const { members: teamMembers } = useTeamMembers({ activeOnly: true });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDirective, setEditingDirective] = useState<CouncilDirective | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [directiveToDelete, setDirectiveToDelete] = useState<CouncilDirective | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState<CouncilDirectiveFormData>({
        title: '',
        description: '',
        status: 'DALAM PENGEMBANGAN',
        date: new Date().toISOString().split('T')[0],
        leaderId: '',
        order: 0,
        isActive: true,
    });

    const handleOpenDialog = (directive?: CouncilDirective) => {
        if (directive) {
            setEditingDirective(directive);
            setFormData({
                title: directive.title,
                description: directive.description,
                status: directive.status,
                date: directive.date,
                leaderId: directive.leaderId,
                order: directive.order,
                isActive: directive.isActive,
            });
        } else {
            setEditingDirective(null);
            setFormData({
                title: '',
                description: '',
                status: 'DALAM PENGEMBANGAN',
                date: new Date().toISOString().split('T')[0],
                leaderId: teamMembers.length > 0 ? teamMembers[0].id : '',
                order: directives.length,
                isActive: true,
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!firestore || !formData.title || !formData.date || !formData.leaderId) {
            toast({
                title: 'Validation Error',
                description: 'Please fill all required fields',
                variant: 'destructive',
            });
            return;
        }

        setIsSaving(true);

        try {
            if (editingDirective) {
                await updateCouncilDirective(firestore, editingDirective.id, formData);
                toast({ title: 'Success', description: 'Directive updated successfully' });
            } else {
                await createCouncilDirective(firestore, formData);
                toast({ title: 'Success', description: 'Directive created successfully' });
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Save error:', error);
            toast({
                title: 'Error',
                description: 'Failed to save directive',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!firestore || !directiveToDelete) return;

        try {
            await deleteCouncilDirective(firestore, directiveToDelete.id);
            toast({ title: 'Success', description: 'Directive deleted successfully' });
            setDeleteConfirmOpen(false);
            setDirectiveToDelete(null);
        } catch (error) {
            console.error('Delete error:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete directive',
                variant: 'destructive',
            });
        }
    };

    const handleToggleActive = async (directive: CouncilDirective) => {
        if (!firestore) return;

        try {
            await toggleCouncilDirectiveActive(firestore, directive.id, !directive.isActive);
            toast({
                title: 'Success',
                description: `Directive ${directive.isActive ? 'hidden' : 'visible'}`,
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

    const getStatusBadge = (status: DirectiveStatus) => {
        switch (status) {
            case 'DISETUJUI':
                return <Badge className="bg-blue-500 hover:bg-blue-600">Disetujui</Badge>;
            case 'SELESAI':
                return <Badge className="bg-green-500 hover:bg-green-600">Selesai</Badge>;
            case 'DALAM PENGEMBANGAN':
                return <Badge className="bg-orange-500 hover:bg-orange-600">Dalam Pengembangan</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="container py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>

                    <h1 className="text-3xl font-bold">Council Directives</h1>
                    <p className="text-muted-foreground">Manage strategic decisions and initiatives</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Directive
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Directives</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{directives.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {directives.filter(d => d.status === 'SELESAI').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active (Visible)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {directives.filter(d => d.isActive).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Directives</CardTitle>
                    <CardDescription>A list of all council decisions and initiatives</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Leader</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Visibility</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : directives.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        No directives found. Add your first directive!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                directives.map((directive) => {
                                    const leader = teamMembers.find(m => m.id === directive.leaderId);
                                    return (
                                        <TableRow key={directive.id}>
                                            <TableCell className="whitespace-nowrap font-medium text-xs text-muted-foreground">
                                                {directive.date}
                                            </TableCell>
                                            <TableCell className="font-medium">{directive.title}</TableCell>
                                            <TableCell>{getStatusBadge(directive.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {leader ? (
                                                        <>
                                                            <div className="relative h-6 w-6 rounded-full overflow-hidden">
                                                                {leader.imageUrl ? (
                                                                    <img src={leader.imageUrl} alt={leader.name} className="object-cover h-full w-full" />
                                                                ) : (
                                                                    <div className="bg-primary/10 h-full w-full flex items-center justify-center">
                                                                        <User className="h-3 w-3" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-sm">{leader.name}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">Unknown Leader ({directive.leaderId})</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{directive.order}</TableCell>
                                            <TableCell>
                                                <Badge variant={directive.isActive ? 'outline' : 'secondary'}>
                                                    {directive.isActive ? 'Visible' : 'Hidden'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleToggleActive(directive)}
                                                    >
                                                        {directive.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenDialog(directive)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setDirectiveToDelete(directive);
                                                            setDeleteConfirmOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingDirective ? 'Edit Directive' : 'Add Directive'}</DialogTitle>
                        <DialogDescription>
                            {editingDirective ? 'Update directive details' : 'Create a new council directive or initiative'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date *</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="date"
                                        type="date"
                                        className="pl-9"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value as DirectiveStatus })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DALAM PENGEMBANGAN">Dalam Pengembangan</SelectItem>
                                        <SelectItem value="DISETUJUI">Disetujui</SelectItem>
                                        <SelectItem value="SELESAI">Selesai</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Peluncuran Program Mentorship"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description of the initiative..."
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="leader">Project Leader</Label>
                            <Select
                                value={formData.leaderId}
                                onValueChange={(value) => setFormData({ ...formData, leaderId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a team member" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teamMembers.map(member => (
                                        <SelectItem key={member.id} value={member.id}>
                                            <div className="flex items-center gap-2">
                                                <div className="relative h-5 w-5 rounded-full overflow-hidden bg-muted">
                                                    {member.imageUrl && <img src={member.imageUrl} alt="" className="object-cover h-full w-full" />}
                                                </div>
                                                <span>{member.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

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
                            {isSaving ? 'Saving...' : editingDirective ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <DeleteConfirmDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                onConfirm={handleDelete}
                itemName={directiveToDelete?.title}
                description="This will permanently delete this directive. This action cannot be undone."
            />
        </div>
    );
}
