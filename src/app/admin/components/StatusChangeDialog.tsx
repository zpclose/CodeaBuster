'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { ProposalStatus } from '@/types/project';

interface StatusChangeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    proposalId: string;
    proposalName: string;
    currentStatus: ProposalStatus;
    onSubmit: (status: ProposalStatus, comment: string) => Promise<void>;
}

const statusOptions: { value: ProposalStatus; label: string }[] = [
    { value: 'In Review', label: 'Sedang Ditinjau' },
    { value: 'Approved', label: 'Disetujui' },
    { value: 'Rejected', label: 'Ditolak' },
    { value: 'In Progress', label: 'Sedang Dikerjakan' },
    { value: 'Completed', label: 'Selesai' },
];

export default function StatusChangeDialog({
    open,
    onOpenChange,
    proposalId,
    proposalName,
    currentStatus,
    onSubmit,
}: StatusChangeDialogProps) {
    const [selectedStatus, setSelectedStatus] = useState<ProposalStatus>(currentStatus);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setError('');

        // Validation: Comment wajib jika status = Rejected
        if (selectedStatus === 'Rejected' && !comment.trim()) {
            setError('Catatan wajib diisi untuk proposal yang ditolak.');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(selectedStatus, comment.trim());
            // Reset form
            setComment('');
            setError('');
            onOpenChange(false);
        } catch (err) {
            setError('Terjadi kesalahan saat memperbarui status.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Update Status Proposal</DialogTitle>
                    <DialogDescription>
                        Ubah status dan berikan catatan untuk proposal ini.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Proposal Info */}
                    <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground">Proposal</p>
                        <p className="font-semibold">{proposalName}</p>
                    </div>

                    {/* Status Selector */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Status Baru</Label>
                        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ProposalStatus)}>
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Comment Textarea */}
                    <div className="space-y-2">
                        <Label htmlFor="comment">
                            Catatan Admin {selectedStatus === 'Rejected' && <span className="text-destructive">*</span>}
                        </Label>
                        <Textarea
                            id="comment"
                            placeholder="Berikan catatan atau feedback untuk user..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                        {selectedStatus === 'Rejected' && (
                            <p className="text-xs text-muted-foreground">
                                Catatan wajib diisi untuk proposal yang ditolak
                            </p>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                            {error}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Perubahan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
