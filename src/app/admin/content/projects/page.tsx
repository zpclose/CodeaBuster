'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { useProjects } from '@/hooks/useProjects';
import { createProject, updateProject, deleteProject, toggleProjectActive, toggleProjectFeatured } from '@/lib/content-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, StarOff, X } from 'lucide-react';
import ImageUploader from '@/app/admin/components/ImageUploader';
import DeleteConfirmDialog from '@/app/admin/components/DeleteConfirmDialog';
import type { Project, ProjectFormData, ProjectCategory, ProjectStatus } from '@/types/content';

const EMPTY_FORM: ProjectFormData = {
    title: '',
    category: 'Software Development',
    leader: '',
    leaderImageId: '',
    contributors: 1,
    tech: [],
    lastActivity: new Date().toISOString(),
    status: 'Planning',
    summary: '',
    heroImageId: '',
    projectUrl: '',
    caseStudyUrl: '',
    isFeatured: false,
    isActive: true,
    order: 0,
};

const CATEGORIES: ProjectCategory[] = ['UI/UX Design', 'Software Development', 'Research', 'Mobile App', 'Web Development', 'Machine Learning', 'Other'];
const STATUSES: ProjectStatus[] = ['Planning', 'In Progress', 'Completed', 'On Hold'];

export default function ProjectsAdminPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { projects, isLoading } = useProjects({ activeOnly: false });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<ProjectFormData>({ ...EMPTY_FORM });
    const [techInput, setTechInput] = useState('');

    const handleOpenDialog = (project?: Project) => {
        if (project) {
            setEditingProject(project);
            setFormData({
                title: project.title,
                category: project.category,
                leader: project.leader,
                leaderImageId: project.leaderImageId || '',
                contributors: project.contributors,
                tech: project.tech,
                lastActivity: project.lastActivity,
                status: project.status,
                summary: project.summary,
                heroImageId: project.heroImageId || '',
                projectUrl: project.projectUrl || '',
                caseStudyUrl: project.caseStudyUrl || '',
                isFeatured: project.isFeatured,
                isActive: project.isActive,
                order: project.order,
            });
            setTechInput(project.tech.join(', '));
        } else {
            setEditingProject(null);
            setFormData({ ...EMPTY_FORM, order: projects.length });
            setTechInput('');
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!firestore || !formData.title || !formData.leader) {
            toast({ title: 'Validation Error', description: 'Please fill required fields', variant: 'destructive' });
            return;
        }

        const techArray = techInput.split(',').map(t => t.trim()).filter(Boolean);

        setIsSaving(true);
        try {
            const data = { ...formData, tech: techArray };
            if (editingProject) {
                await updateProject(firestore, editingProject.id, data);
                toast({ title: 'Success', description: 'Project updated successfully' });
            } else {
                await createProject(firestore, data);
                toast({ title: 'Success', description: 'Project created successfully' });
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Save error:', error);
            toast({ title: 'Error', description: 'Failed to save project', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!firestore || !projectToDelete) return;
        try {
            await deleteProject(firestore, projectToDelete.id);
            toast({ title: 'Success', description: 'Project deleted successfully' });
            setDeleteConfirmOpen(false);
            setProjectToDelete(null);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete project', variant: 'destructive' });
        }
    };

    const handleToggleActive = async (project: Project) => {
        if (!firestore) return;
        try {
            await toggleProjectActive(firestore, project.id, !project.isActive);
            toast({ title: 'Success', description: `Project ${project.isActive ? 'deactivated' : 'activated'}` });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
        }
    };

    const handleToggleFeatured = async (project: Project) => {
        if (!firestore) return;
        try {
            await toggleProjectFeatured(firestore, project.id, !project.isFeatured);
            toast({ title: 'Success', description: `Project ${project.isFeatured ? 'unfeatured' : 'featured'}` });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update featured status', variant: 'destructive' });
        }
    };

    return (
        <div className="container py-4 lg:py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Projects Management</h1>
                    <p className="text-muted-foreground">Manage portfolio projects</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="shadow-sm">
                    <Plus className="mr-2 h-4 w-4" /> Add Project
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Projects</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{projects.length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{projects.filter(p => p.isActive).length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Featured</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{projects.filter(p => p.isFeatured).length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Completed</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{projects.filter(p => p.status === 'Completed').length}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Projects</CardTitle>
                    <CardDescription>A list of all projects in the system</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-12 text-center text-muted-foreground">Loading projects...</div>
                    ) : projects.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">No projects found. Add your first project!</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">#</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead className="w-32">Category</TableHead>
                                    <TableHead className="w-28">Status</TableHead>
                                    <TableHead className="w-20 text-center">Featured</TableHead>
                                    <TableHead className="w-20 text-center">Active</TableHead>
                                    <TableHead className="w-24 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projects.map((project) => (
                                    <TableRow key={project.id}>
                                        <TableCell className="font-muted text-sm">{project.order}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium truncate max-w-[200px] lg:max-w-xs">{project.title}</span>
                                                <span className="text-xs text-muted-foreground truncate">{project.leader}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="text-xs whitespace-nowrap">{project.category}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={project.status === 'Completed' ? 'default' : project.status === 'In Progress' ? 'outline' : 'secondary'}
                                                className="text-xs whitespace-nowrap"
                                            >
                                                {project.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleFeatured(project)}>
                                                {project.isFeatured ? <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> : <StarOff className="h-4 w-4 text-muted-foreground" />}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleActive(project)}>
                                                {project.isActive ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(project)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setProjectToDelete(project); setDeleteConfirmOpen(true); }}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingProject ? 'Edit Project' : 'Add Project'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Project Title *</Label>
                            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Project name..." />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as ProjectCategory })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as ProjectStatus })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="leader">Project Leader *</Label>
                                <Input id="leader" value={formData.leader} onChange={(e) => setFormData({ ...formData, leader: e.target.value })} placeholder="Leader name..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contributors">Contributors</Label>
                                <Input id="contributors" type="number" value={formData.contributors} onChange={(e) => setFormData({ ...formData, contributors: parseInt(e.target.value) || 1 })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Tech Stack (comma separated)</Label>
                            <Input value={techInput} onChange={(e) => setTechInput(e.target.value)} placeholder="React, Node.js, Firebase, Figma..." />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="summary">Summary</Label>
                            <Textarea id="summary" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} rows={4} placeholder="Project description..." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="projectUrl">Project URL</Label>
                                <Input id="projectUrl" value={formData.projectUrl} onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })} placeholder="https://..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="caseStudyUrl">Case Study URL</Label>
                                <Input id="caseStudyUrl" value={formData.caseStudyUrl} onChange={(e) => setFormData({ ...formData, caseStudyUrl: e.target.value })} placeholder="https://..." />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="order">Display Order</Label>
                                <Input id="order" type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div className="space-y-2 flex items-center gap-2 pt-6">
                                <input type="checkbox" id="isFeatured" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} />
                                <Label htmlFor="isFeatured">Featured</Label>
                            </div>
                            <div className="space-y-2 flex items-center gap-2 pt-6">
                                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                                <Label htmlFor="isActive">Active</Label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : editingProject ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                onConfirm={handleDelete}
                itemName={projectToDelete?.title}
                description="This will permanently delete this project. This action cannot be undone."
            />
        </div>
    );
}
