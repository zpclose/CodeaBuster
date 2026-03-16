'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { useAchievements } from '@/hooks/useAchievements';
import { createAchievement, updateAchievement, deleteAchievement, toggleAchievementActive } from '@/lib/content-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, Star, X, ExternalLink, Image as ImageIcon, Users, BarChart3, Trophy, Layers, Target } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Achievement, AchievementFormData, AchievementCategory, PortfolioTemplate, PortfolioContent, PortfolioTeamMember, PortfolioHighlight, PortfolioLink, PortfolioStrategicPhase, PortfolioReadinessAudit } from '@/types/content';
import ImageUploader from '@/app/admin/components/ImageUploader';
import DeleteConfirmDialog from '@/app/admin/components/DeleteConfirmDialog';

// Helper to slugify title
function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
}

const EMPTY_PC: PortfolioContent = {
    tagline: '',
    problemStatement: '',
    solutionSummary: '',
    heroImageUrl: '',
    certificateImageUrl: '',
    galleryImages: [],
    teamMembers: [],
    highlights: [],
    externalLinks: [],
    videoEmbedUrl: '',
    curatorQuote: '',
    curatorName: '',
    curatorTitle: '',
    strategicPhases: [],
    readinessAudit: [],
    closingQuote: '',
    performanceAuditDescription: '',
    closingNarrative: '',
};

const EMPTY_FORM: AchievementFormData = {
    title: '',
    category: 'Kompetisi',
    type: '',
    description: '',
    year: new Date().getFullYear(),
    team: '',
    institution: '',
    award: '',
    thumbnailUrl: '',
    isHallOfFame: false,
    curatorQuote: '',
    curatorName: '',
    curatorTitle: '',
    curatorImageUrl: '',
    caseStudyLink: '',
    externalLink: '',
    isActive: true,
    order: 0,
    portfolioTemplate: null,
    portfolioSlug: '',
    portfolioContent: { ...EMPTY_PC },
};

const TEMPLATE_OPTIONS: { value: PortfolioTemplate; label: string; description: string; icon: React.ReactNode }[] = [
    { value: 'competition', label: 'Competition', description: 'Bold & dramatic — kompetisi/hackathon', icon: <Trophy className="h-4 w-4" /> },
    { value: 'product', label: 'Product', description: 'Minimalist — produk digital & app', icon: <Layers className="h-4 w-4" /> },
    { value: 'research', label: 'Research', description: 'Academic — riset & paper', icon: <BarChart3 className="h-4 w-4" /> },
    { value: 'event', label: 'Event', description: 'Photo-heavy — kegiatan & workshop', icon: <ImageIcon className="h-4 w-4" /> },
    { value: 'esports', label: 'E-Sports', description: 'Team roster & metrics — esports team', icon: <Target className="h-4 w-4" /> },
];

export default function AchievementsAdminPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { achievements, isLoading } = useAchievements();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [achievementToDelete, setAchievementToDelete] = useState<Achievement | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<AchievementFormData>({ ...EMPTY_FORM });

    // Updater helpers
    const updateForm = (patch: Partial<AchievementFormData>) => setFormData(prev => ({ ...prev, ...patch }));
    const updatePC = (patch: Partial<PortfolioContent>) =>
        setFormData(prev => ({ ...prev, portfolioContent: { ...(prev.portfolioContent || EMPTY_PC), ...patch } }));

    const pc = formData.portfolioContent || EMPTY_PC;


    // ─── Team / Highlights / Links editors ───────────────────────────────
    const addTeamMember = () => updatePC({ teamMembers: [...(pc.teamMembers || []), { name: '', role: '' }] });
    const updateTeamMember = (i: number, patch: Partial<PortfolioTeamMember>) => {
        const members = [...(pc.teamMembers || [])];
        members[i] = { ...members[i], ...patch };
        updatePC({ teamMembers: members });
    };
    const removeTeamMember = (i: number) => updatePC({ teamMembers: (pc.teamMembers || []).filter((_, idx) => idx !== i) });

    const addHighlight = () => updatePC({ highlights: [...(pc.highlights || []), { label: '', value: '' }] });
    const updateHighlight = (i: number, patch: Partial<PortfolioHighlight>) => {
        const list = [...(pc.highlights || [])];
        list[i] = { ...list[i], ...patch };
        updatePC({ highlights: list });
    };
    const removeHighlight = (i: number) => updatePC({ highlights: (pc.highlights || []).filter((_, idx) => idx !== i) });

    const addLink = () => updatePC({ externalLinks: [...(pc.externalLinks || []), { label: '', url: '' }] });
    const updateLink = (i: number, patch: Partial<PortfolioLink>) => {
        const list = [...(pc.externalLinks || [])];
        list[i] = { ...list[i], ...patch };
        updatePC({ externalLinks: list });
    };
    const removeLink = (i: number) => updatePC({ externalLinks: (pc.externalLinks || []).filter((_, idx) => idx !== i) });

    // ─── E-Sports Specific ─────────────────────────────────────────────────
    const addStrategicPhase = () => updatePC({ strategicPhases: [...(pc.strategicPhases || []), { title: '', focus: '', protocol: '', metrics: '' }] });
    const updateStrategicPhase = (i: number, patch: Partial<PortfolioStrategicPhase>) => {
        const list = [...(pc.strategicPhases || [])];
        list[i] = { ...list[i], ...patch };
        updatePC({ strategicPhases: list });
    };
    const removeStrategicPhase = (i: number) => updatePC({ strategicPhases: (pc.strategicPhases || []).filter((_, idx) => idx !== i) });

    const addReadinessAudit = () => updatePC({ readinessAudit: [...(pc.readinessAudit || []), { id: '', title: '', detail: '' }] });
    const updateReadinessAudit = (i: number, patch: Partial<PortfolioReadinessAudit>) => {
        const list = [...(pc.readinessAudit || [])];
        list[i] = { ...list[i], ...patch };
        updatePC({ readinessAudit: list });
    };
    const removeReadinessAudit = (i: number) => updatePC({ readinessAudit: (pc.readinessAudit || []).filter((_, idx) => idx !== i) });

    const addGalleryUrl = () => updatePC({ galleryImages: [...(pc.galleryImages || []), ''] });
    const updateGalleryUrl = (i: number, url: string) => {
        const list = [...(pc.galleryImages || [])];
        list[i] = url;
        updatePC({ galleryImages: list });
    };
    const removeGalleryUrl = (i: number) => updatePC({ galleryImages: (pc.galleryImages || []).filter((_, idx) => idx !== i) });


    // ─── Dialog handlers ─────────────────────────────────────────────────────
    const handleOpenDialog = (achievement?: Achievement) => {
        if (achievement) {
            setEditingAchievement(achievement);
            setFormData({
                title: achievement.title,
                category: achievement.category,
                type: achievement.type,
                description: achievement.description,
                year: achievement.year,
                team: achievement.team,
                institution: achievement.institution,
                award: achievement.award,
                thumbnailUrl: achievement.thumbnailUrl,
                isHallOfFame: achievement.isHallOfFame,
                curatorQuote: achievement.curatorQuote || '',
                curatorName: achievement.curatorName || '',
                curatorTitle: achievement.curatorTitle || '',
                curatorImageUrl: achievement.curatorImageUrl || '',
                caseStudyLink: achievement.caseStudyLink || '',
                externalLink: achievement.externalLink || '',
                isActive: achievement.isActive,
                order: achievement.order,
                portfolioTemplate: achievement.portfolioTemplate || null,
                portfolioSlug: achievement.portfolioSlug || '',
                portfolioContent: { ...EMPTY_PC, ...(achievement.portfolioContent || {}) },
            });
        } else {
            setEditingAchievement(null);
            setFormData({ ...EMPTY_FORM, order: achievements.length + 1 });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!firestore || !formData.thumbnailUrl) {
            toast({ title: 'Validation Error', description: 'Please fill all required fields and upload a thumbnail', variant: 'destructive' });
            return;
        }
        setIsSaving(true);
        try {
            const dataToSave = {
                ...formData,
                // Auto-generate slug from title if empty and template is set
                portfolioSlug: formData.portfolioTemplate
                    ? (formData.portfolioSlug || slugify(formData.title))
                    : '',
            };
            if (editingAchievement) {
                await updateAchievement(firestore, editingAchievement.id, dataToSave);
                toast({ title: 'Success', description: 'Achievement updated successfully' });
            } else {
                await createAchievement(firestore, dataToSave);
                toast({ title: 'Success', description: 'Achievement created successfully' });
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Save error:', error);
            toast({ title: 'Error', description: 'Failed to save achievement', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!firestore || !achievementToDelete) return;
        try {
            await deleteAchievement(firestore, achievementToDelete.id);
            toast({ title: 'Success', description: 'Achievement deleted successfully' });
            setDeleteConfirmOpen(false);
            setAchievementToDelete(null);
        } catch (error) {
            console.error('Delete error:', error);
            toast({ title: 'Error', description: 'Failed to delete achievement', variant: 'destructive' });
        }
    };

    const handleToggleActive = async (achievement: Achievement) => {
        if (!firestore) return;
        try {
            await toggleAchievementActive(firestore, achievement.id, !achievement.isActive);
            toast({ title: 'Success', description: `Achievement ${achievement.isActive ? 'deactivated' : 'activated'}` });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
        }
    };

    return (
        <div className="container py-4 lg:py-6 space-y-6 flex flex-col h-[calc(100vh-theme(spacing.28))] lg:h-[calc(100vh-theme(spacing.20))] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div>

                    <h1 className="text-3xl font-bold">Achievements Management</h1>
                    <p className="text-muted-foreground">Manage community achievements and portfolio pages</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="shadow-sm">
                    <Plus className="mr-2 h-4 w-4" />Add Achievement
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                {[
                    { label: 'Total', value: achievements.length },
                    { label: 'Hall of Fame', value: achievements.filter(a => a.isHallOfFame).length },
                    { label: 'With Portfolio', value: achievements.filter(a => a.portfolioTemplate).length },
                    { label: 'Active', value: achievements.filter(a => a.isActive).length },
                ].map(stat => (
                    <Card key={stat.label}>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{stat.label}</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent>
                    </Card>
                ))}
            </div>

            {/* Table */}
            <Card className="flex flex-col flex-1 min-h-0 border-border/50 shadow-sm overflow-hidden mb-2">
                <div className="overflow-x-auto custom-scrollbar flex flex-col h-full w-full">
                    {/* Fixed Card Header + Table Header merged */}
                    <div className="shrink-0 bg-muted/20 border-b border-border/50 min-w-[1000px]">
                        <CardHeader className="py-4 px-6 pb-2">
                            <CardTitle>All Achievements</CardTitle>
                            <CardDescription>A list of all achievements in the system</CardDescription>
                        </CardHeader>
                        <div className="grid grid-cols-[80px_minmax(200px,2fr)_120px_80px_150px_120px_100px_100px] gap-4 px-6 py-3 text-sm font-medium text-muted-foreground mt-2 border-b border-border/30">
                            <div>Image</div>
                            <div>Title</div>
                            <div>Category</div>
                            <div>Year</div>
                            <div>Award</div>
                            <div>Portfolio</div>
                            <div>Status</div>
                            <div className="text-right">Actions</div>
                        </div>
                    </div>
                    {/* Scrollable Table Body */}
                    <CardContent className="flex-1 overflow-y-auto p-0 min-w-[1000px]">
                        {isLoading ? (
                            <div className="py-12 text-center text-muted-foreground w-full">Loading achievements...</div>
                        ) : achievements.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground w-full">
                                No achievements found. Add your first achievement!
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {achievements.map((achievement) => (
                                    <div key={achievement.id} className="grid grid-cols-[80px_minmax(200px,2fr)_120px_80px_150px_120px_100px_100px] gap-4 px-6 py-3 text-sm border-b border-border/40 items-center hover:bg-muted/30 transition-colors">
                                        <div className="w-[80px]">
                                            <div className="relative h-12 w-16 rounded-lg overflow-hidden border border-border/50 shadow-sm bg-muted/30">
                                                <Image src={achievement.thumbnailUrl} alt={achievement.title} fill className="object-cover" />
                                            </div>
                                        </div>
                                        <div className="font-medium truncate pr-2">{achievement.title}</div>
                                        <div><Badge variant="outline" className="font-normal">{achievement.category}</Badge></div>
                                        <div>{achievement.year}</div>
                                        <div className="text-sm truncate pr-2">{achievement.award}</div>
                                        <div>
                                            {achievement.portfolioTemplate ? (
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="default" className="capitalize text-[10px] h-4 px-1">{achievement.portfolioTemplate}</Badge>
                                                    {achievement.portfolioSlug && (
                                                        <a href={`/achievements/${achievement.portfolioSlug}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">—</span>
                                            )}
                                        </div>
                                        <div>
                                            <Badge variant={achievement.isActive ? 'default' : 'secondary'} className={achievement.isActive ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-0 shadow-none' : 'text-muted-foreground'}>
                                                {achievement.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <div className="text-right flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleToggleActive(achievement)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                {achievement.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(achievement)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => { setAchievementToDelete(achievement); setDeleteConfirmOpen(true); }} className="h-8 w-8 text-muted-foreground hover:text-destructive">
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
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingAchievement ? 'Edit Achievement' : 'Add Achievement'}</DialogTitle>
                        <DialogDescription>
                            {editingAchievement ? 'Update achievement information and portfolio content' : 'Add a new achievement — optionally create a portfolio page'}
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="portfolio">
                                Portfolio Page
                                {formData.portfolioTemplate && <span className="ml-2 h-2 w-2 rounded-full bg-primary inline-block" />}
                            </TabsTrigger>
                        </TabsList>

                        {/* ═══ TAB 1: BASIC INFO ═══ */}
                        <TabsContent value="basic" className="space-y-4 mt-4">
                            {/* Thumbnail */}
                            <div className="space-y-2">
                                <Label>Thumbnail *</Label>
                                <ImageUploader
                                    contentType="achievements"
                                    contentId={editingAchievement?.id || 'new'}
                                    currentImageUrl={formData.thumbnailUrl}
                                    onUploadComplete={(url) => updateForm({ thumbnailUrl: url })}
                                    onDelete={() => updateForm({ thumbnailUrl: '' })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input id="title" value={formData.title} onChange={(e) => updateForm({ title: e.target.value })} placeholder="Juara 1 Hackathon Nasional" />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Category *</Label>
                                    <Select value={formData.category} onValueChange={(v) => updateForm({ category: v as AchievementCategory })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Kompetisi">Kompetisi</SelectItem>
                                            <SelectItem value="Proyek Industri">Proyek Industri</SelectItem>
                                            <SelectItem value="Karya Individu">Karya Individu</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type *</Label>
                                    <Input id="type" value={formData.type} onChange={(e) => updateForm({ type: e.target.value })} placeholder="Hackathon, UI/UX, E-Sports" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year">Year *</Label>
                                    <Input id="year" type="number" value={formData.year} onChange={(e) => updateForm({ year: parseInt(e.target.value) })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea id="description" value={formData.description} onChange={(e) => updateForm({ description: e.target.value })} rows={3} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="team">Team *</Label>
                                    <Input id="team" value={formData.team} onChange={(e) => updateForm({ team: e.target.value })} placeholder='Tim "Sifonix"' />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="institution">Institution *</Label>
                                    <Input id="institution" value={formData.institution} onChange={(e) => updateForm({ institution: e.target.value })} placeholder="Codebusters Mercu Buana" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="award">Award *</Label>
                                <Input id="award" value={formData.award} onChange={(e) => updateForm({ award: e.target.value })} placeholder="JUARA 1" />
                            </div>

                            {/* Hall of Fame */}
                            <div className="flex items-center space-x-2 p-4 border rounded-lg">
                                <Checkbox
                                    id="hallOfFame" checked={formData.isHallOfFame}
                                    onCheckedChange={(checked) => updateForm({ isHallOfFame: checked as boolean })}
                                />
                                <div className="flex-1">
                                    <Label htmlFor="hallOfFame" className="cursor-pointer">Add to Hall of Fame</Label>
                                    <p className="text-xs text-muted-foreground">Featured achievements with curator commentary</p>
                                </div>
                            </div>

                            {formData.isHallOfFame && (
                                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                                    <h4 className="font-semibold">Curator Information</h4>
                                    <div className="space-y-2">
                                        <Label>Curator Image</Label>
                                        <ImageUploader
                                            contentType="achievements"
                                            contentId={editingAchievement?.id || 'new-curator'}
                                            currentImageUrl={formData.curatorImageUrl}
                                            onUploadComplete={(url) => updateForm({ curatorImageUrl: url })}
                                            onDelete={() => updateForm({ curatorImageUrl: '' })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Curator Quote</Label>
                                        <Textarea value={formData.curatorQuote} onChange={(e) => updateForm({ curatorQuote: e.target.value })} rows={2} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Curator Name</Label>
                                            <Input value={formData.curatorName} onChange={(e) => updateForm({ curatorName: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Curator Title</Label>
                                            <Input value={formData.curatorTitle} onChange={(e) => updateForm({ curatorTitle: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="caseStudy">Case Study Link</Label>
                                    <Input id="caseStudy" value={formData.caseStudyLink} onChange={(e) => updateForm({ caseStudyLink: e.target.value })} placeholder="/sifonix-portfolio" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="externalLink">External Link</Label>
                                    <Input id="externalLink" value={formData.externalLink} onChange={(e) => updateForm({ externalLink: e.target.value })} placeholder="https://example.com" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="order">Display Order</Label>
                                <Input id="order" type="number" value={formData.order} onChange={(e) => updateForm({ order: parseInt(e.target.value) || 0 })} />
                            </div>
                        </TabsContent>

                        {/* ═══ TAB 2: PORTFOLIO PAGE ═══ */}
                        <TabsContent value="portfolio" className="space-y-6 mt-4">
                            {/* Template Selector */}
                            <div className="space-y-3">
                                <Label>Portfolio Template</Label>
                                <p className="text-xs text-muted-foreground">Pilih template untuk halaman porfolio achievement ini. Kosongkan jika tidak perlu halaman portfolio.</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {/* No template */}
                                    <button
                                        type="button"
                                        onClick={() => updateForm({ portfolioTemplate: null })}
                                        className={`p-3 rounded-lg border-2 text-left text-sm transition-all ${!formData.portfolioTemplate ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}
                                    >
                                        <div className="font-semibold mb-0.5">None</div>
                                        <div className="text-xs text-muted-foreground">Tidak ada portfolio page</div>
                                    </button>
                                    {TEMPLATE_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => updateForm({ portfolioTemplate: opt.value })}
                                            className={`p-3 rounded-lg border-2 text-left text-sm transition-all ${formData.portfolioTemplate === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}
                                        >
                                            <div className="flex items-center gap-1.5 font-semibold mb-0.5">
                                                {opt.icon}{opt.label}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{opt.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formData.portfolioTemplate && (
                                <>
                                    {/* Slug */}
                                    <div className="space-y-2">
                                        <Label>Portfolio URL Slug *</Label>
                                        <div className="flex gap-2">
                                            <div className="flex items-center text-sm text-muted-foreground bg-muted px-3 rounded-l border border-r-0 border-input">/achievements/</div>
                                            <Input
                                                className="rounded-l-none"
                                                value={formData.portfolioSlug}
                                                onChange={(e) => updateForm({ portfolioSlug: e.target.value })}
                                                placeholder={slugify(formData.title || 'contoh-nama-achievement')}
                                            />
                                            <Button type="button" variant="outline" size="sm" onClick={() => updateForm({ portfolioSlug: slugify(formData.title) })}>
                                                Auto
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Tagline */}
                                    <div className="space-y-2">
                                        <Label>Tagline</Label>
                                        <Input value={pc.tagline} onChange={(e) => updatePC({ tagline: e.target.value })} placeholder="Satu kalimat yang menggambarkan pencapaian ini..." />
                                    </div>

                                    {/* Hero Image */}
                                    <div className="space-y-2">
                                        <Label>Hero Image (Full-page header)</Label>
                                        <ImageUploader
                                            contentType="achievements"
                                            contentId={editingAchievement?.id || 'portfolio-hero'}
                                            currentImageUrl={pc.heroImageUrl}
                                            onUploadComplete={(url) => updatePC({ heroImageUrl: url })}
                                            onDelete={() => updatePC({ heroImageUrl: '' })}
                                        />
                                    </div>

                                    {/* Problem / Solution */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Latar Belakang / Problem</Label>
                                            <Textarea value={pc.problemStatement} onChange={(e) => updatePC({ problemStatement: e.target.value })} rows={4} placeholder="Jelaskan masalah atau konteks yang melatarbelakangi pencapaian ini..." />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Solusi / Metodologi</Label>
                                            <Textarea value={pc.solutionSummary} onChange={(e) => updatePC({ solutionSummary: e.target.value })} rows={4} placeholder="Jelaskan pendekatan, solusi, atau metodologi yang digunakan..." />
                                        </div>
                                    </div>

                                    {/* Highlights / Stats */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Highlights / Stats</Label>
                                            <Button type="button" variant="outline" size="sm" onClick={addHighlight}>
                                                <Plus className="h-3 w-3 mr-1" />Add
                                            </Button>
                                        </div>
                                        {(pc.highlights || []).map((h, i) => (
                                            <div key={i} className="flex gap-2 items-center">
                                                <Input placeholder="Label (e.g. Team Size)" value={h.label} onChange={(e) => updateHighlight(i, { label: e.target.value })} />
                                                <Input placeholder="Value (e.g. 5 Orang)" value={h.value} onChange={(e) => updateHighlight(i, { value: e.target.value })} />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeHighlight(i)}>
                                                    <X className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Gallery Images */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Gallery Images (URL)</Label>
                                            <Button type="button" variant="outline" size="sm" onClick={addGalleryUrl} disabled={(pc.galleryImages || []).length >= 8}>
                                                <Plus className="h-3 w-3 mr-1" />Add URL (max 8)
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {(pc.galleryImages || []).map((url, i) => (
                                                <div key={i} className="space-y-2 border p-2 rounded-lg bg-background">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] font-medium text-muted-foreground uppercase">Slot {i + 1}</span>
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeGalleryUrl(i)} className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10">
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <ImageUploader
                                                        contentType="achievements"
                                                        contentId={`${editingAchievement?.id || 'new'}-gallery-${i}`}
                                                        currentImageUrl={url}
                                                        onUploadComplete={(newUrl) => updateGalleryUrl(i, newUrl)}
                                                        onDelete={() => updateGalleryUrl(i, '')}
                                                        className="aspect-square"
                                                    />
                                                </div>
                                            ))}
                                            {(!pc.galleryImages || pc.galleryImages.length < 9) && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="aspect-square flex flex-col items-center justify-center border-dashed gap-2 h-auto"
                                                    onClick={addGalleryUrl}
                                                >
                                                    <Plus className="h-6 w-6" />
                                                    <span className="text-xs">Add Gallery Slot</span>
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Gunakan URL gambar yang sudah diupload ke Firebase Storage atau external URL</p>
                                    </div>

                                    {/* Team Members */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label><Users className="inline h-3 w-3 mr-1" />Team Members</Label>
                                            <Button type="button" variant="outline" size="sm" onClick={addTeamMember}>
                                                <Plus className="h-3 w-3 mr-1" />Add Member
                                            </Button>
                                        </div>
                                        {(pc.teamMembers || []).map((member, i) => (
                                            <div key={i} className="flex gap-2 items-center">
                                                <Input placeholder="Nama" value={member.name} onChange={(e) => updateTeamMember(i, { name: e.target.value })} />
                                                <Input placeholder="Role/Jabatan" value={member.role} onChange={(e) => updateTeamMember(i, { role: e.target.value })} />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeTeamMember(i)}>
                                                    <X className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* External Links */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label><ExternalLink className="inline h-3 w-3 mr-1" />External Links</Label>
                                            <Button type="button" variant="outline" size="sm" onClick={addLink}>
                                                <Plus className="h-3 w-3 mr-1" />Add Link
                                            </Button>
                                        </div>
                                        {(pc.externalLinks || []).map((link, i) => (
                                            <div key={i} className="flex gap-2 items-center">
                                                <Input placeholder="Label (e.g. Figma, GitHub)" value={link.label} onChange={(e) => updateLink(i, { label: e.target.value })} className="max-w-36" />
                                                <Input placeholder="https://..." value={link.url} onChange={(e) => updateLink(i, { url: e.target.value })} />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(i)}>
                                                    <X className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Video Embed */}
                                    <div className="space-y-2">
                                        <Label>Video Embed URL (opsional)</Label>
                                        <Input value={pc.videoEmbedUrl} onChange={(e) => updatePC({ videoEmbedUrl: e.target.value })} placeholder="https://www.youtube.com/embed/..." />
                                        <p className="text-xs text-muted-foreground">Gunakan YouTube embed URL: youtube.com/embed/VIDEO_ID</p>
                                    </div>

                                    {/* ═══ E-SPORTS SPECIFIC ═══ */}
                                    {(formData.portfolioTemplate === 'esports') && (
                                        <>
                                            {/* Certificate Image */}
                                            <div className="space-y-2 pt-4 border-t">
                                                <Label>Certificate Image (opsional)</Label>
                                                <p className="text-xs text-muted-foreground">Upload sertifikat penghargaan. Jika tidak ada, section ini tidak akan muncul.</p>
                                                <ImageUploader
                                                    contentType="achievements"
                                                    contentId={`${editingAchievement?.id || 'new'}-certificate`}
                                                    currentImageUrl={pc.certificateImageUrl}
                                                    onUploadComplete={(url) => updatePC({ certificateImageUrl: url })}
                                                    onDelete={() => updatePC({ certificateImageUrl: '' })}
                                                />
                                            </div>

                                            {/* Curator Info (Portfolio) */}
                                            <div className="space-y-3 pt-4 border-t">
                                                <Label className="font-semibold">Curator Information (untuk Portfolio)</Label>
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Quote</Label>
                                                    <Textarea value={pc.curatorQuote} onChange={(e) => updatePC({ curatorQuote: e.target.value })} rows={2} placeholder="Quote dari team captain..." />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Nama</Label>
                                                        <Input value={pc.curatorName} onChange={(e) => updatePC({ curatorName: e.target.value })} placeholder="Contoh: Farel M Rahman" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Jabatan</Label>
                                                        <Input value={pc.curatorTitle} onChange={(e) => updatePC({ curatorTitle: e.target.value })} placeholder="Contoh: Tactical Strategic Lead" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Enhanced Team Members */}
                                            <div className="space-y-3 pt-4 border-t">
                                                <div className="flex items-center justify-between">
                                                    <Label><Users className="inline h-3 w-3 mr-1" />Team Members (E-Sports)</Label>
                                                    <Button type="button" variant="outline" size="sm" onClick={addTeamMember}>
                                                        <Plus className="h-3 w-3 mr-1" />Add Member
                                                    </Button>
                                                </div>
                                                {(pc.teamMembers || []).map((member, i) => (
                                                    <div key={i} className="p-3 border rounded-lg space-y-2">
                                                        <div className="flex gap-2 items-center">
                                                            <Input placeholder="Nama" value={member.name} onChange={(e) => updateTeamMember(i, { name: e.target.value })} className="flex-1" />
                                                            <Input placeholder="Role (contoh: Jungler)" value={member.role} onChange={(e) => updateTeamMember(i, { role: e.target.value })} className="flex-1" />
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeTeamMember(i)}>
                                                                <X className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                        <Input placeholder="Specialization (contoh: Objective Control & Retribution Timing)" value={member.specialization || ''} onChange={(e) => updateTeamMember(i, { specialization: e.target.value })} />
                                                        <Textarea placeholder="Description" value={member.description || ''} onChange={(e) => updateTeamMember(i, { description: e.target.value })} rows={2} />
                                                        <Input placeholder="Operational Impact (contoh: Menjaga keunggulan nilai aset tim)" value={member.operationalImpact || ''} onChange={(e) => updateTeamMember(i, { operationalImpact: e.target.value })} />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Strategic Phases */}
                                            <div className="space-y-3 pt-4 border-t">
                                                <div className="flex items-center justify-between">
                                                    <Label><Target className="inline h-3 w-3 mr-1" />Strategic Phases</Label>
                                                    <Button type="button" variant="outline" size="sm" onClick={addStrategicPhase}>
                                                        <Plus className="h-3 w-3 mr-1" />Add Phase
                                                    </Button>
                                                </div>
                                                {(pc.strategicPhases || []).map((phase, i) => (
                                                    <div key={i} className="p-3 border rounded-lg space-y-2">
                                                        <div className="flex gap-2 items-center">
                                                            <Input placeholder="Title (contoh: Phase I: Early Capitalization)" value={phase.title} onChange={(e) => updateStrategicPhase(i, { title: e.target.value })} className="flex-1" />
                                                            <Input placeholder="Focus (contoh: Resource Acquisition)" value={phase.focus} onChange={(e) => updateStrategicPhase(i, { focus: e.target.value })} className="flex-1" />
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeStrategicPhase(i)}>
                                                                <X className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                        <Textarea placeholder="Protocol (protokol yang diterapkan)" value={phase.protocol} onChange={(e) => updateStrategicPhase(i, { protocol: e.target.value })} rows={2} />
                                                        <Input placeholder="Metrics (contoh: Target: Selisih emas minimal 1.5k)" value={phase.metrics} onChange={(e) => updateStrategicPhase(i, { metrics: e.target.value })} />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Readiness Audit */}
                                            <div className="space-y-3 pt-4 border-t">
                                                <div className="flex items-center justify-between">
                                                    <Label><BarChart3 className="inline h-3 w-3 mr-1" />Performance Readiness Audit</Label>
                                                    <Button type="button" variant="outline" size="sm" onClick={addReadinessAudit}>
                                                        <Plus className="h-3 w-3 mr-1" />Add Protocol
                                                    </Button>
                                                </div>
                                                {(pc.readinessAudit || []).map((audit, i) => (
                                                    <div key={i} className="p-3 border rounded-lg space-y-2">
                                                        <div className="flex gap-2 items-center">
                                                            <Input placeholder="ID (contoh: MET-01)" value={audit.id} onChange={(e) => updateReadinessAudit(i, { id: e.target.value })} className="w-24" />
                                                            <Input placeholder="Title (contoh: Meta Environmental Scanning)" value={audit.title} onChange={(e) => updateReadinessAudit(i, { title: e.target.value })} className="flex-1" />
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeReadinessAudit(i)}>
                                                                <X className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                        <Textarea placeholder="Detail (deskripsi protokol)" value={audit.detail} onChange={(e) => updateReadinessAudit(i, { detail: e.target.value })} rows={2} />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Closing Quote */}
                                            <div className="space-y-3 pt-4 border-t">
                                                <Label className="font-semibold">Closing Quote</Label>
                                                <p className="text-xs text-muted-foreground">Quote penutup yang ditampilkan di akhir halaman portfolio</p>
                                                <Textarea 
                                                    value={pc.closingQuote} 
                                                    onChange={(e) => updatePC({ closingQuote: e.target.value })} 
                                                    rows={3} 
                                                    placeholder="Contoh: Bertanding bukan hanya untuk menang, tetapi untuk membuktikan bahwa kecerdasan taktik dan kekompakan adalah kekuatan utama." 
                                                />
                                            </div>

                                            {/* Performance Audit Description */}
                                            <div className="space-y-3 pt-4 border-t">
                                                <Label className="font-semibold">Performance Audit Description</Label>
                                                <p className="text-xs text-muted-foreground">Deskripsi untuk section Performance Audit</p>
                                                <Textarea 
                                                    value={pc.performanceAuditDescription} 
                                                    onChange={(e) => updatePC({ performanceAuditDescription: e.target.value })} 
                                                    rows={3} 
                                                    placeholder="Contoh: Serangkaian protokol persiapan yang diterapkan guna memastikan konsistensi performa seluruh anggota dalam setiap siklus kompetisi resmi dengan mengacu pada pembaruan meta permainan." 
                                                />
                                            </div>

                                            {/* Closing Narrative */}
                                            <div className="space-y-3 pt-4 border-t">
                                                <Label className="font-semibold">Closing Narrative</Label>
                                                <p className="text-xs text-muted-foreground">Teks penutup tentang tim (akan digabungkan dengan team name & institution)</p>
                                                <Textarea 
                                                    value={pc.closingNarrative} 
                                                    onChange={(e) => updatePC({ closingNarrative: e.target.value })} 
                                                    rows={3} 
                                                    placeholder="Contoh: sebagai representasi keunggulan taktis dan disiplin dalam ekosistem kompetitif. Melalui dedikasi dan sinkronisasi yang tinggi, kami terus berkomitmen untuk mengharumkan nama institusi di kancah {gameTitle}." 
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Preview link */}
                                    {formData.portfolioSlug && (
                                        <div className="p-3 bg-muted/50 rounded-lg border text-sm flex items-center justify-between">
                                            <span className="text-muted-foreground">Portfolio URL: <code className="text-foreground font-mono">/achievements/{formData.portfolioSlug || slugify(formData.title)}</code></span>
                                            <a href={`/achievements/${formData.portfolioSlug || slugify(formData.title)}`} target="_blank" rel="noopener noreferrer">
                                                <Button type="button" variant="outline" size="sm">
                                                    Preview <ExternalLink className="ml-1 h-3 w-3" />
                                                </Button>
                                            </a>
                                        </div>
                                    )}
                                </>
                            )}

                            {!formData.portfolioTemplate && (
                                <div className="py-12 text-center text-muted-foreground">
                                    <Trophy className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    <p className="font-medium">Pilih template di atas untuk mengaktifkan portfolio page</p>
                                    <p className="text-sm mt-1">Setiap template memiliki layout dan gaya yang berbeda</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : editingAchievement ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <DeleteConfirmDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                onConfirm={handleDelete}
                itemName={achievementToDelete?.title}
                description="This will permanently delete this achievement. This action cannot be undone."
            />
        </div>
    );
}
