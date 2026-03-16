import type { Timestamp, FieldValue } from 'firebase/firestore';
import type { ProposalStatus } from './project';

export type NotificationType =
    | 'proposal_status_change'
    | 'system_announcement'
    | 'admin_message';

export interface Notification {
    id: string;
    userId: string; // User penerima
    proposalId?: string; // Optional: linked proposal
    proposalName?: string;
    type: NotificationType;
    title: string;
    message: string;
    status?: ProposalStatus; // For proposal status changes
    isRead: boolean;
    createdAt: Timestamp | FieldValue;
    expiresAt: Timestamp | FieldValue; // TTL: Auto-delete setelah 30 hari
}
