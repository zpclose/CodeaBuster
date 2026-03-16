import type { Timestamp, FieldValue } from 'firebase/firestore';

export type ProposalStatus =
  | 'Submitted'
  | 'In Review'
  | 'Approved'
  | 'Rejected'
  | 'In Progress'
  | 'Completed';

export interface AdminComment {
  text: string;
  addedBy: string; // Admin UID
  addedAt: Timestamp | FieldValue;
  statusChange: ProposalStatus;
}

export interface StatusHistoryItem {
  status: ProposalStatus;
  changedAt: Timestamp | FieldValue;
  comment?: string;
  changedBy?: string; // Admin UID
}

export interface ProjectProposal {
  id: string;
  projectName: string;
  projectCategory: string;
  projectLeader: string;
  leaderInstitution: 'Telkom University' | 'Universitas Mercu Buana';
  executiveSummary: string;
  targetAudience: string;
  techStack: string[];
  currentStatus: 'Ide Murni' | 'Konsep & Desain' | 'Ada Prototipe';
  resourceNeeds?: string;
  additionalLink?: string;
  hasTeam: boolean;
  teamComposition?: string;
  submittedBy: string; // UID
  submittedAt: Timestamp | FieldValue;
  status: ProposalStatus;
  adminComments?: AdminComment[];
  statusHistory?: StatusHistoryItem[]; // NEW: Track all status changes
}
