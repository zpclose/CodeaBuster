'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { createTeamMember, updateTeamMember, deleteTeamMember, toggleTeamMemberActive } from '@/lib/content-utils';
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
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import Link from 'next/link';
import type { TeamMember, TeamMemberFormData, TeamMemberTier } from '@/types/content';
import ImageUploader from '@/app/admin/components/ImageUploader';
import DeleteConfirmDialog from '@/app/admin/components/DeleteConfirmDialog';
import { CreatableSelect } from '@/app/admin/components/CreatableSelect';
import MigrateTeamData from '@/components/MigrateTeamData';

const DEFAULT_TIERS = [
    "Executive Council",
    "Division Director",
    "Head to Tribe",
    "Staff",
    "executive",
    "director"
];

export default function TeamMembersAdminPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const { members, isLoading } = useTeamMembers();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState<TeamMemberFormData>({
        name: '',
        role: '',
        university: 'Telkom University',
        quote: '',
        bio: '',
        imageUrl: '',
        socials: {
            linkedin: '',
            github: '',
            twitter: '',
        },
        tier: 'director',
        order: 0,
        isActive: true,
    });

    // Derive unique tiers merging defaults and existing data
    const uniqueTiers = Array.from(new Set([
        ...DEFAULT_TIERS,
        ...members.map(m => m.tier)
    ])).sort();

    const uniqueUniversities = Array.from(new Set([
        'Telkom University',
        'Universitas Mercu Buana',
        ...members.map(m => m.university)
    ])).filter(Boolean).sort();

    const handleOpenDialog = (member?: TeamMember) => {
        if (member) {
            setEditingMember(member);
            setFormData({
                name: member.name,
                role: member.role,
                university: member.university,
                quote: member.quote || '',
                bio: member.bio || '',
                imageUrl: member.imageUrl,
                socials: member.socials,
                tier: member.tier,
                order: member.order,
                isActive: member.isActive,
            });
        } else {
            setEditingMember(null);
            setFormData({
                name: '',
                role: '',
                university: 'Telkom University',
                quote: '',
                bio: '',
                imageUrl: '',
                socials: { linkedin: '', github: '', twitter: '' },
                tier: 'director',
                order: members.length,
                isActive: true,
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
            if (editingMember) {
                await updateTeamMember(firestore, editingMember.id, formData);
                toast({ title: 'Success', description: 'Team member updated successfully' });
            } else {
                await createTeamMember(firestore, formData);
                toast({ title: 'Success', description: 'Team member created successfully' });
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Save error:', error);
            toast({
                title: 'Error',
                description: 'Failed to save team member',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!firestore || !memberToDelete) return;

        try {
            await deleteTeamMember(firestore, memberToDelete.id);
            toast({ title: 'Success', description: 'Team member deleted successfully' });
            setDeleteConfirmOpen(false);
            setMemberToDelete(null);
        } catch (error) {
            console.error('Delete error:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete team member',
                variant: 'destructive',
            });
        }
    };

    const handleToggleActive = async (member: TeamMember) => {
        if (!firestore) return;

        try {
            await toggleTeamMemberActive(firestore, member.id, !member.isActive);
            toast({
                title: 'Success',
                description: `Team member ${member.isActive ? 'deactivated' : 'activated'}`,
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
        <div className="container py-4 lg:py-6 space-y-6 flex flex-col h-[calc(100vh-theme(spacing.28))] lg:h-[calc(100vh-theme(spacing.20))]">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div>

                    <h1 className="text-3xl font-bold">Team Members Management</h1>
                    <p className="text-muted-foreground">Manage executive council and division directors</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="shadow-sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Member
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{members.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Executive Council</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {members.filter(m => m.tier === 'executive').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Division Directors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {members.filter(m => m.tier === 'director').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {members.filter(m => m.isActive).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="flex flex-col flex-1 min-h-0 border-border/50 shadow-sm overflow-hidden mb-2">
                <div className="overflow-x-auto custom-scrollbar flex flex-col h-full w-full">
                    {/* Fixed Card Header + Table Header merged */}
                    <div className="shrink-0 bg-muted/20 border-b border-border/50 min-w-[950px]">
                        <CardHeader className="py-4 px-6 pb-2">
                            <CardTitle>All Team Members</CardTitle>
                            <CardDescription>A list of all team members in the system</CardDescription>
                        </CardHeader>
                        <div className="grid grid-cols-[80px_minmax(180px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)_150px_100px_100px] gap-4 px-6 py-3 text-sm font-medium text-muted-foreground mt-2 border-b border-border/30">
                            <div>Image</div>
                            <div>Name</div>
                            <div>Role</div>
                            <div>University</div>
                            <div>Tier</div>
                            <div>Status</div>
                            <div className="text-right">Actions</div>
                        </div>
                    </div>
                    {/* Scrollable Table Body */}
                    <CardContent className="flex-1 overflow-y-auto p-0 min-w-[950px]">
                        {isLoading ? (
                            <div className="py-12 text-center text-muted-foreground w-full">Loading team members...</div>
                        ) : members.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground w-full">
                                No team members found. Add your first member!
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {members.map((member) => (
                                    <div key={member.id} className="grid grid-cols-[80px_minmax(180px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)_150px_100px_100px] gap-4 px-6 py-3 text-sm border-b border-border/40 items-center hover:bg-muted/30 transition-colors">
                                        <div className="w-[80px]">
                                            <div className="relative h-12 w-12 rounded-full overflow-hidden border border-border/50 shadow-sm">
                                                <ImageWithSkeleton
                                                    src={member.imageUrl}
                                                    alt={member.name}
                                                    fill
                                                    className="object-cover"
                                                    fallback="/placeholder-avatar.jpg"
                                                    skeletonClassName="rounded-full"
                                                />
                                            </div>
                                        </div>
                                        <div className="font-medium truncate pr-2">{member.name}</div>
                                        <div className="truncate pr-2">{member.role}</div>
                                        <div className="truncate pr-2 text-muted-foreground">{member.university}</div>
                                        <div>
                                            <Badge variant={member.tier.toLowerCase().includes('executive') ? 'default' : 'secondary'} className="font-normal">
                                                {member.tier}
                                            </Badge>
                                        </div>
                                        <div>
                                            <Badge variant={member.isActive ? 'default' : 'secondary'} className={member.isActive ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-0 shadow-none' : 'text-muted-foreground'}>
                                                {member.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <div className="text-right flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleToggleActive(member)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                {member.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(member)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => { setMemberToDelete(member); setDeleteConfirmOpen(true); }} className="h-8 w-8 text-muted-foreground hover:text-destructive">
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
                        <DialogTitle>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
                        <DialogDescription>
                            {editingMember ? 'Update team member information' : 'Add a new team member to your organization'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label>Profile Image *</Label>
                            <ImageUploader
                                contentType="team-members"
                                contentId={editingMember?.id || 'new'}
                                currentImageUrl={formData.imageUrl}
                                onUploadComplete={(url) => setFormData({ ...formData, imageUrl: url })}
                                onDelete={() => setFormData({ ...formData, imageUrl: '' })}
                            />
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <Input
                                    id="role"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    placeholder="Ketua Umum"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="university">University *</Label>
                                <CreatableSelect
                                    value={formData.university}
                                    onChange={(value) => setFormData({ ...formData, university: value })}
                                    options={uniqueUniversities}
                                    placeholder="Select or type university..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tier">Tier *</Label>
                                <CreatableSelect
                                    value={formData.tier}
                                    onChange={(value) => setFormData({ ...formData, tier: value })}
                                    options={uniqueTiers}
                                    placeholder="Select or type tier..."
                                />
                            </div>
                        </div>

                        {/* Quote & Bio */}
                        <div className="space-y-2">
                            <Label htmlFor="quote">Quote</Label>
                            <Textarea
                                id="quote"
                                value={formData.quote}
                                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                                placeholder="A short inspiring quote..."
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Professional biography..."
                                rows={3}
                            />
                        </div>

                        {/* Socials */}
                        <div className="space-y-4">
                            <Label>Social Media Links</Label>
                            <div className="space-y-2">
                                <Input
                                    placeholder="LinkedIn URL"
                                    value={formData.socials.linkedin}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socials: { ...formData.socials, linkedin: e.target.value }
                                    })}
                                />
                                <Input
                                    placeholder="GitHub URL"
                                    value={formData.socials.github}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socials: { ...formData.socials, github: e.target.value }
                                    })}
                                />
                                <Input
                                    placeholder="Twitter URL"
                                    value={formData.socials.twitter}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socials: { ...formData.socials, twitter: e.target.value }
                                    })}
                                />
                            </div>
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
                            {isSaving ? 'Saving...' : editingMember ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <DeleteConfirmDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                onConfirm={handleDelete}
                itemName={memberToDelete?.name}
                description="This will permanently delete this team member. This action cannot be undone."
            />
        </div>
    );
}
