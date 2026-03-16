'use client';

import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import type { ProposalStatus } from '@/types/project';

function getStatusColor(status?: ProposalStatus): string {
    if (!status) return 'bg-slate-500';
    switch (status) {
        case 'Approved': return 'bg-green-500';
        case 'Rejected': return 'bg-red-500';
        case 'In Progress': return 'bg-orange-500';
        case 'Completed': return 'bg-green-700';
        case 'In Review': return 'bg-blue-500';
        default: return 'bg-slate-500';
    }
}

function getStatusEmoji(status?: ProposalStatus): string {
    if (!status) return '📝';
    switch (status) {
        case 'Approved': return '✅';
        case 'Rejected': return '❌';
        case 'In Progress': return ' ';
        case 'Completed': return '🎉';
        case 'In Review': return '👀';
        default: return '📝';
    }
}

export default function NotificationBell() {
    const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2">
                    <h3 className="font-semibold text-sm">Notifikasi</h3>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
                            Tandai Semua
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            Memuat notifikasi...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            Belum ada notifikasi
                        </div>
                    ) : (
                        notifications.slice(0, 10).map((notif) => {
                            const timestamp = notif.createdAt && 'seconds' in notif.createdAt
                                ? new Date(notif.createdAt.seconds * 1000)
                                : new Date();

                            return (
                                <DropdownMenuItem
                                    key={notif.id}
                                    className="cursor-pointer px-4 py-3 focus:bg-muted/50"
                                    onSelect={() => markAsRead(notif.id)}
                                >
                                    <div className="flex gap-3 w-full">
                                        {!notif.isRead && (
                                            <div className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${getStatusColor(notif.status)}`} />
                                        )}
                                        <div className="flex-1 space-y-1 min-w-0" style={{ paddingLeft: notif.isRead ? '12px' : '0' }}>
                                            <div className="flex items-start gap-2">
                                                <span className="text-lg leading-none">{getStatusEmoji(notif.status)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium leading-tight truncate">
                                                        {notif.title}
                                                    </p>
                                                    {notif.proposalName && (
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {notif.proposalName}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground mt-1">
                                                        {formatDistanceToNow(timestamp, { addSuffix: true, locale: localeId })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            );
                        })
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
