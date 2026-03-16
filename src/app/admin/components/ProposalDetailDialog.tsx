'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import {
    User, Building2, FolderOpen, Target, Cpu, Link2,
    Users, FileText, Clock, MessageSquare, History,
    CheckCircle2, AlertCircle, PlayCircle, Trophy, HelpCircle,
    ChevronRight, Calendar, Zap, ShieldCheck
} from 'lucide-react';
import type { ProjectProposal, ProposalStatus } from '@/types/project';
import { cn } from '@/lib/utils';

interface ProposalDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    proposal: ProjectProposal | null;
}

function getStatusConfig(status: ProposalStatus) {
    switch (status) {
        case 'Approved': return { label: 'Disetujui', color: 'bg-green-500/10 text-green-600 border-green-500/20', banner: 'bg-green-600', icon: CheckCircle2 };
        case 'Rejected': return { label: 'Ditolak', color: 'bg-red-500/10 text-red-600 border-red-500/20', banner: 'bg-red-600', icon: AlertCircle };
        case 'In Progress': return { label: 'Proses', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', banner: 'bg-orange-600', icon: PlayCircle };
        case 'Completed': return { label: 'Selesai', color: 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20', banner: 'bg-emerald-600', icon: Trophy };
        case 'In Review': return { label: 'Review', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', banner: 'bg-blue-600', icon: Clock };
        default: return { label: status, color: 'bg-slate-500/10 text-slate-600 border-slate-500/20', banner: 'bg-slate-600', icon: HelpCircle };
    }
}

function formatTimestamp(ts: any): string {
    if (!ts) return 'N/A';
    if ('seconds' in ts) {
        return new Date(ts.seconds * 1000).toLocaleString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    }
    return 'Baru saja';
}

function InfoItem({ icon: Icon, label, value, className }: { icon: any; label: string; value: React.ReactNode; className?: string }) {
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                <Icon size={12} className="text-primary/70" />
                {label}
            </div>
            <div className="text-sm font-medium leading-tight">{value}</div>
        </div>
    );
}

function SectionHeader({ icon: Icon, title, badge }: { icon: any; title: string; badge?: string }) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-sm">
                    <Icon size={16} />
                </div>
                <h4 className="font-headline font-bold text-sm tracking-tight">{title}</h4>
            </div>
            {badge && <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest px-2 py-0 border-primary/20 text-primary/80">{badge}</Badge>}
        </div>
    );
}

export default function ProposalDetailDialog({
    open,
    onOpenChange,
    proposal,
}: ProposalDetailDialogProps) {
    if (!proposal) return null;

    const statusConfig = getStatusConfig(proposal.status);
    const StatusIcon = statusConfig.icon;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">

                {/* Status Top Strip */}
                <div className={cn("h-1.5 w-full shrink-0", statusConfig.banner)} />

                {/* Hero Header */}
                <div className="relative bg-muted/30 px-8 py-10 border-b border-border/50">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="rounded-full bg-background/50 border-primary/20 text-primary text-[10px] font-bold tracking-widest px-3">
                                    {proposal.projectCategory}
                                </Badge>
                                <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border tracking-widest", statusConfig.color)}>
                                    <StatusIcon size={12} />
                                    {statusConfig.label.toUpperCase()}
                                </div>
                            </div>
                            <DialogTitle className="text-3xl font-black font-headline tracking-tighter text-foreground drop-shadow-sm leading-[1.1]">
                                {proposal.projectName}
                            </DialogTitle>
                        </div>

                        {/* Visual Status Indicator */}
                        <div className={cn("shrink-0 flex flex-col items-center justify-center p-4 rounded-2xl border bg-background/50 backdrop-blur-sm shadow-sm md:w-32", statusConfig.color.replace('/10', '/5'))}>
                            <StatusIcon size={32} className="mb-2 opacity-80" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{statusConfig.label}</span>
                        </div>
                    </div>
                </div>

                <ScrollArea className="max-h-[calc(90vh-(140px+6px))] bg-background">
                    <div className="p-8 space-y-10 pb-16">

                        {/* Highlights Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <InfoItem icon={User} label="Project Leader" value={proposal.projectLeader} />
                            <InfoItem icon={Building2} label="Institusi" value={proposal.leaderInstitution} />
                            <InfoItem icon={Zap} label="Status Sekarang" value={proposal.currentStatus} />
                            <InfoItem icon={Calendar} label="Diajukan Pada" value={formatTimestamp(proposal.submittedAt)} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                            {/* Main Content Area */}
                            <div className="lg:col-span-3 space-y-10">

                                {/* Section: Executive Summary */}
                                <div className="overflow-hidden">
                                    <SectionHeader icon={FileText} title="Ringkasan Eksekutif" />
                                    <div className="bg-muted/30 rounded-2xl p-6 border border-border/40 shadow-sm">
                                        <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
                                            {proposal.executiveSummary}
                                        </p>
                                    </div>
                                </div>

                                {/* Section: Target & Implementation */}
                                <div className="grid gap-8 overflow-hidden">
                                    <div>
                                        <SectionHeader icon={Target} title="Target Audiens" />
                                        <p className="text-sm text-muted-foreground pl-1.5 border-l-2 border-primary/20 ml-3 py-1 break-words">
                                            {proposal.targetAudience}
                                        </p>
                                    </div>

                                    <div>
                                        <SectionHeader icon={Cpu} title="Implementasi Teknik" />
                                        <div className="space-y-5 pl-3 border-l-2 border-primary/20 ml-3">
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">Tech Stack</span>
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {proposal.techStack.map((tech) => (
                                                        <Badge key={tech} variant="secondary" className="px-3 py-1 text-[11px] font-medium bg-muted border border-border/20 rounded-lg hover:bg-primary/5 transition-colors">
                                                            {tech}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {proposal.resourceNeeds && (
                                                <div className="space-y-2 overflow-hidden">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">Kebutuhan Sumber Daya</span>
                                                    <p className="text-sm text-foreground/80 leading-relaxed font-medium break-words">
                                                        {proposal.resourceNeeds}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar-ish Area */}
                            <div className="lg:col-span-2 space-y-10 overflow-hidden">

                                {/* Section: Team */}
                                <div>
                                    <SectionHeader icon={Users} title="Informasi Tim" />
                                    <div className="bg-primary/[0.03] rounded-2xl p-5 border border-primary/10 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-muted-foreground">Kesiapan Tim:</span>
                                            <Badge variant={proposal.hasTeam ? 'default' : 'outline'} className={cn("px-4 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest", proposal.hasTeam ? "bg-primary" : "text-muted-foreground")}>
                                                {proposal.hasTeam ? 'SUDAH ADA' : 'BELUM ADA'}
                                            </Badge>
                                        </div>
                                        {proposal.hasTeam && proposal.teamComposition && (
                                            <div className="pt-2 border-t border-primary/5 overflow-hidden">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60 block mb-2">Struktur:</span>
                                                <p className="text-xs font-medium leading-relaxed break-words">{proposal.teamComposition}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Section: History & Admin Notes */}
                                <div>
                                    <SectionHeader icon={History} title="Riwayat Status" />
                                    <div className="space-y-6 relative pl-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-muted-foreground/10">
                                        {proposal.statusHistory?.map((item, idx) => {
                                            const cfg = getStatusConfig(item.status);
                                            const isLast = idx === (proposal.statusHistory?.length || 1) - 1;
                                            return (
                                                <div key={idx} className="relative group">
                                                    <div className={cn(
                                                        "absolute -left-4 top-1.5 h-2 w-2 rounded-full ring-4 ring-background z-10",
                                                        idx === 0 ? "bg-primary scale-125 shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "bg-muted-foreground/30"
                                                    )} />
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className={cn("text-[11px] font-black uppercase tracking-widest", idx === 0 ? "text-primary bg-primary/5 px-2 py-0.5 rounded" : "text-muted-foreground/80")}>
                                                                {cfg.label}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                                {formatTimestamp(item.changedAt)}
                                                            </span>
                                                        </div>
                                                        {item.comment && (
                                                            <div className="bg-muted/40 p-3 rounded-xl border border-border/30 text-xs italic text-muted-foreground leading-relaxed break-words">
                                                                &ldquo;{item.comment}&rdquo;
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }).reverse()}
                                    </div>
                                </div>

                                {/* Additional Links */}
                                {proposal.additionalLink && (
                                    <div className="pt-6">
                                        <a
                                            href={proposal.additionalLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted border border-border/50 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                                                    <Link2 size={14} />
                                                </div>
                                                <span className="text-xs font-bold tracking-tight text-foreground group-hover:text-primary">External Resources</span>
                                            </div>
                                            <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                {/* Footer Gradient Fade */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </DialogContent>
        </Dialog>
    );
}
