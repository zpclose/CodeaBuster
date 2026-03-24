import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { ProjectProposal, StatusHistoryItem } from '@/types/project';

const isDev = process.env.NODE_ENV === 'development';

export interface ProposalNotification {
    id: string; // proposalId
    proposalName: string;
    statusHistory: StatusHistoryItem[];
    latestStatus: StatusHistoryItem;
}

const DISMISSED_KEY = 'dismissedNotifications';

function getDismissedNotifications(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    return dismissed ? new Set(JSON.parse(dismissed)) : new Set();
}

function dismissNotification(notificationKey: string) {
    const dismissed = getDismissedNotifications();
    dismissed.add(notificationKey);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(dismissed)));
}

export function useProposalNotifications() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [proposals, setProposals] = useState<ProjectProposal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!firestore || !user) {
            setProposals([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        if (isDev) console.log('[useProposalNotifications] Setting up listener for user:', user.uid);

        // Fetch user's proposals
        const proposalsQuery = query(
            collection(firestore, 'project-proposals'),
            where('submittedBy', '==', user.uid)
        );

        const unsubscribe: Unsubscribe = onSnapshot(
            proposalsQuery,
            (snapshot) => {
                if (isDev) console.log('[useProposalNotifications] Received proposals:', snapshot.docs.length);
                const proposalsList: ProjectProposal[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as ProjectProposal));

                setProposals(proposalsList);
                setIsLoading(false);
            },
            (error) => {
                if (isDev) console.error('[useProposalNotifications] Error fetching proposals:', error);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [firestore, user]);

    // Convert proposals to notifications
    const notifications = useMemo(() => {
        const dismissed = getDismissedNotifications();
        const notifs: ProposalNotification[] = [];

        proposals.forEach(proposal => {
            if (!proposal.statusHistory || proposal.statusHistory.length === 0) return;

            // Each status change becomes a notification
            proposal.statusHistory.forEach((historyItem, index) => {
                const notifKey = `${proposal.id}-${index}`;

                // Skip dismissed notifications
                if (dismissed.has(notifKey)) return;

                notifs.push({
                    id: notifKey,
                    proposalName: proposal.projectName,
                    statusHistory: [historyItem],
                    latestStatus: historyItem,
                });
            });
        });

        // Sort by timestamp descending
        notifs.sort((a, b) => {
            const aTime = a.latestStatus.changedAt && 'seconds' in a.latestStatus.changedAt
                ? a.latestStatus.changedAt.seconds : 0;
            const bTime = b.latestStatus.changedAt && 'seconds' in b.latestStatus.changedAt
                ? b.latestStatus.changedAt.seconds : 0;
            return bTime - aTime;
        });

        if (isDev) console.log('[useProposalNotifications] Generated notifications:', notifs.length);
        return notifs;
    }, [proposals]);

    const unreadCount = notifications.length;

    const dismiss = (notificationId: string) => {
        dismissNotification(notificationId);
        // Trigger re-render by updating proposals (triggers useMemo)
        setProposals([...proposals]);
    };

    return {
        notifications,
        unreadCount,
        isLoading,
        dismiss,
    };
}
