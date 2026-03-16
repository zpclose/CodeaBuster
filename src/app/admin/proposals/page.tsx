'use client';

import { useFirestore, useCollection, useMemoFirebase, useAuth } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, User, Edit, LayoutList, Search, Filter } from 'lucide-react';
import type { ProjectProposal, ProposalStatus, AdminComment, StatusHistoryItem } from '@/types/project';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import StatusChangeDialog from '../components/StatusChangeDialog';
import ProposalDetailDialog from '../components/ProposalDetailDialog';
import { createNotification } from '@/lib/notification-utils';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

function getStatusBadgeClasses(status: ProposalStatus): string {
  switch (status) {
    case 'Approved':
      return 'bg-green-500/10 text-green-600 dark:text-green-400 border-none';
    case 'Rejected':
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-none';
    case 'In Progress':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-none';
    case 'Completed':
      return 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-none';
    case 'In Review':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none';
    default:
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-none';
  }
}

export default function AdminProposalsPage() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const [selectedProposal, setSelectedProposal] = useState<ProjectProposal | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailProposal, setDetailProposal] = useState<ProjectProposal | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const proposalsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'project-proposals'), orderBy('submittedAt', 'desc'));
  }, [firestore]);

  const { data: proposals, isLoading } = useCollection<ProjectProposal>(proposalsQuery);

  const filteredProposals = proposals?.filter(p =>
    p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.projectLeader.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (proposal: ProjectProposal) => {
    setSelectedProposal(proposal);
    setDialogOpen(true);
  };

  const handleStatusChange = async (newStatus: ProposalStatus, comment: string) => {
    if (!firestore || !selectedProposal || !auth?.currentUser) return;

    try {
      const proposalRef = doc(firestore, 'project-proposals', selectedProposal.id);

      const adminComment: Omit<AdminComment, 'addedAt'> & { addedAt: any } = {
        text: comment,
        addedBy: auth.currentUser.uid,
        addedAt: Timestamp.now(),
        statusChange: newStatus,
      };

      const historyItem: any = {
        status: newStatus,
        changedAt: Timestamp.now(),
        changedBy: auth.currentUser.uid,
      };

      if (comment && comment.trim()) {
        historyItem.comment = comment;
      }

      const existingComments = selectedProposal.adminComments || [];
      const existingHistory = selectedProposal.statusHistory || [];

      await updateDoc(proposalRef, {
        status: newStatus,
        adminComments: [...existingComments, adminComment],
        statusHistory: [...existingHistory, historyItem],
        updatedAt: serverTimestamp(),
      });

      await createNotification(firestore, {
        userId: selectedProposal.submittedBy,
        proposalId: selectedProposal.id,
        proposalName: selectedProposal.projectName,
        status: newStatus,
        adminComment: comment || undefined,
      });

      toast({
        title: "Status Diperbarui",
        description: `Proposal "${selectedProposal.projectName}" berhasil diperbarui ke ${newStatus}.`,
      });

      setDialogOpen(false);
      setSelectedProposal(null);
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast({
        title: "Gagal Memperbarui",
        description: "Terjadi kesalahan saat memperbarui status proposal.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="container py-4 lg:py-6 space-y-6 flex flex-col h-[calc(100vh-theme(spacing.28))] lg:h-[calc(100vh-theme(spacing.20))] overflow-hidden">
        {/* Header & Action Bar Section (Fixed) */}
        <div className="shrink-0 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-muted/20 p-6 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none" />

            <div className="relative z-10 flex items-center gap-5">
              <div className="hidden sm:flex h-14 w-14 bg-primary/10 rounded-xl items-center justify-center border border-primary/20 text-primary shadow-sm">
                <LayoutList className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Manajemen Proposal
                </h1>
                <p className="text-muted-foreground mt-1 text-sm max-w-xl leading-relaxed">
                  Tinjau dan evaluasi pengajuan proyek dari komunitas.
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama proyek atau ketua..."
                className="pl-10 rounded-xl border-border/60 bg-background shadow-sm focus-visible:ring-primary/20 transition-all h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto rounded-xl border-border/60 bg-background shadow-sm h-10 px-5">
              <Filter className="mr-2 h-4 w-4" />
              Filter Status
            </Button>
          </div>
        </div>

        {/* Custom Data Grid (Fixed Header + Scrollable Body) */}
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-border/60 bg-background overflow-hidden shadow-sm mb-2">
          {/* Fixed Grid Header */}
          <div className="shrink-0 bg-muted/40 border-b border-border/60">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
              <div className="col-span-4">Informasi Proyek</div>
              <div className="col-span-3">Ketua & Institusi</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3 text-right">Tindakan</div>
            </div>
          </div>

          {/* Scrollable Data Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/40 custom-scrollbar min-w-[800px] md:min-w-0">
            {filteredProposals?.map((proposal) => (
              <div key={proposal.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-muted/10 transition-colors group">
                {/* Project Info */}
                <div className="col-span-1 md:col-span-4 flex flex-col gap-1">
                  <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors break-words">{proposal.projectName}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Diajukan: {proposal.submittedAt && 'seconds' in proposal.submittedAt
                      ? new Date(proposal.submittedAt.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'Baru saja'}
                  </p>
                </div>

                {/* Leader Info */}
                <div className="col-span-1 md:col-span-3 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-3 w-3" />
                    </div>
                    {proposal.projectLeader}
                  </div>
                  <Badge variant="outline" className="w-fit text-[9px] bg-background py-0 h-4 font-normal">
                    {proposal.leaderInstitution}
                  </Badge>
                </div>

                {/* Status */}
                <div className="col-span-1 md:col-span-2 flex items-center">
                  <Badge className={cn("rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider", getStatusBadgeClasses(proposal.status))}>
                    {proposal.status}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="col-span-1 md:col-span-3 flex justify-start md:justify-end items-center gap-2 mt-2 md:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg h-8 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all text-[11px] px-3"
                    onClick={() => handleOpenDialog(proposal)}
                  >
                    <Edit className="h-3.5 w-3.5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Update</span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="rounded-lg h-8 shadow-sm hover:shadow transition-all text-[11px] px-3"
                    onClick={() => { setDetailProposal(proposal); setDetailOpen(true); }}
                  >
                    Detail
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            {(!filteredProposals || filteredProposals.length === 0) && (
              <div className="py-20 flex flex-col items-center justify-center text-center w-full">
                <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-bold mb-1">Tidak ada proposal ditemukan</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {searchQuery ? `Tidak ada proposal yang cocok dengan pencarian "${searchQuery}".` : "Belum ada proposal proyek yang diajukan oleh komunitas."}
                </p>
                {searchQuery && (
                  <Button variant="outline" className="mt-4 rounded-xl" onClick={() => setSearchQuery('')}>
                    Hapus Pencarian
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProposal && (
        <StatusChangeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          proposalId={selectedProposal.id}
          proposalName={selectedProposal.projectName}
          currentStatus={selectedProposal.status}
          onSubmit={handleStatusChange}
        />
      )}

      <ProposalDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        proposal={detailProposal}
      />
    </>
  );
}
