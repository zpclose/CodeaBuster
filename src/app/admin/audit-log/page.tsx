'use client';

import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Activity, Search, Filter, Download, RefreshCw, 
  Shield, Clock, User, FileText, Settings, LogIn, LogOut,
  CheckCircle, XCircle, Edit, Trash2, Eye, Plus,
  ChevronDown, ChevronUp, ArrowUpDown
} from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, where, getCountFromServer } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Link from 'next/link';

interface ActivityLog {
  id: string;
  action: string;
  target: string;
  adminName: string;
  adminEmail: string;
  adminRole: 'owner' | 'admin';
  timestamp: any;
  details?: string;
  ipAddress?: string;
}

interface AuditStats {
  totalActions: number;
  todayActions: number;
  uniqueAdmins: number;
  approveActions: number;
  rejectActions: number;
  editActions: number;
}

const actionIcons: Record<string, any> = {
  'login': LogIn,
  'logout': LogOut,
  'approve': CheckCircle,
  'reject': XCircle,
  'edit': Edit,
  'delete': Trash2,
  'view': Eye,
  'create': Plus,
  'default': Activity,
};

const actionColors: Record<string, string> = {
  'login': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'logout': 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  'approve': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'reject': 'bg-red-500/10 text-red-600 border-red-500/20',
  'edit': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'delete': 'bg-red-500/10 text-red-600 border-red-500/20',
  'view': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'create': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

const convertTimestamp = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  return null;
};

const formatTimestamp = (timestamp: any): string => {
  const date = convertTimestamp(timestamp);
  if (!date) return '-';
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function AuditLogPage() {
  const firestore = useFirestore();
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateSort, setDateSort] = useState<'desc' | 'asc'>('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('admin-role');
    setAdminRole(role);
  }, []);

  const logsQuery = useMemoFirebase(() => {
    // Disabled - waiting for Firestore rules deployment
    return null;
  }, [firestore, dateSort]);

  const { data: logs, error } = useCollection<ActivityLog>(logsQuery);

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter(log => {
      const matchesSearch = searchQuery === '' || 
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.adminEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAction = actionFilter === 'all' || 
        log.action.toLowerCase().includes(actionFilter.toLowerCase());
      return matchesSearch && matchesAction;
    });
  }, [logs, searchQuery, actionFilter]);

  const stats: AuditStats = useMemo(() => {
    if (!logs) {
      return { totalActions: 0, todayActions: 0, uniqueAdmins: 0, approveActions: 0, rejectActions: 0, editActions: 0 };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const uniqueEmails = new Set<string>();
    let approveCount = 0;
    let rejectCount = 0;
    let editCount = 0;

    logs.forEach(log => {
      uniqueEmails.add(log.adminEmail);
      if (log.action.toLowerCase().includes('approve')) approveCount++;
      if (log.action.toLowerCase().includes('reject')) rejectCount++;
      if (log.action.toLowerCase().includes('edit')) editCount++;
    });

    return {
      totalActions: logs.length,
      todayActions: logs.filter(l => {
        const logDate = convertTimestamp(l.timestamp);
        return logDate && logDate >= today;
      }).length,
      uniqueAdmins: uniqueEmails.size,
      approveActions: approveCount,
      rejectActions: rejectCount,
      editActions: editCount,
    };
  }, [logs]);

  const dailyActivity = useMemo(() => {
    if (!logs) return [];
    const days: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('id-ID', { weekday: 'short' });
      days[key] = 0;
    }
    
    logs.forEach(log => {
      const date = convertTimestamp(log.timestamp);
      if (date) {
        const key = date.toLocaleDateString('id-ID', { weekday: 'short' });
        if (days[key] !== undefined) days[key]++;
      }
    });
    
    return Object.entries(days).map(([name, value]) => ({ name, value }));
  }, [logs]);

  const actionTypeDistribution = useMemo(() => {
    if (!logs) return [];
    const types: Record<string, number> = {};
    
    logs.forEach(log => {
      const action = log.action.toLowerCase();
      let type = 'other';
      if (action.includes('login') || action.includes('logout')) type = 'session';
      else if (action.includes('approve')) type = 'approve';
      else if (action.includes('reject')) type = 'reject';
      else if (action.includes('edit') || action.includes('update')) type = 'edit';
      else if (action.includes('delete')) type = 'delete';
      else if (action.includes('create') || action.includes('add')) type = 'create';
      
      types[type] = (types[type] || 0) + 1;
    });
    
    return Object.entries(types)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
      .sort((a, b) => b.value - a.value);
  }, [logs]);

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const exportLogs = () => {
    if (!filteredLogs) return;
    
    const csvContent = [
      ['Timestamp', 'Action', 'Target', 'Admin Name', 'Admin Email', 'Details', 'IP Address'].join(','),
      ...filteredLogs.map(l => [
        `"${formatTimestamp(l.timestamp)}"`,
        `"${l.action}"`,
        `"${l.target}"`,
        `"${l.adminName}"`,
        `"${l.adminEmail}"`,
        `"${l.details || ''}"`,
        `"${l.ipAddress || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    alert('Log berhasil diekspor!');
  };

  if (adminRole !== 'owner') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <Shield className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1>
        <p className="text-muted-foreground max-w-md">
          Halaman ini hanya dapat diakses oleh Owner. Silakan hubungi owner untuk mengakses log audit.
        </p>
      </div>
    );
  }

  if (!logs && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
          <Activity className="h-10 w-10 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Fitur Audit Log</h1>
        <p className="text-muted-foreground max-w-md mb-4">
          Log aktivitas admin sedang dalam pengembangan. Fitur ini akan tersedia setelah deployment rules Firebase.
        </p>
        <p className="text-xs text-muted-foreground">
          Jalankan: firebase deploy --only firestore:rules --project studio-8281963604-c316a
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 pt-1 pr-2">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1 text-card-foreground">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] font-black uppercase tracking-widest px-1.5 py-0 h-4">
              <Shield className="h-2.5 w-2.5 mr-1" />
              Owner Only
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Log Audit Sistem</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Pantau seluruh aktivitas admin secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 px-3 font-medium gap-2 hover:bg-muted border-border/60"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 px-3 font-medium gap-2 hover:bg-muted border-border/60"
            onClick={exportLogs}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {[
          { label: "Total Aktivitas", value: stats.totalActions, icon: Activity, color: "bg-blue-500/10 text-blue-500" },
          { label: "Hari Ini", value: stats.todayActions, icon: Clock, color: "bg-emerald-500/10 text-emerald-500" },
          { label: "Admin Aktif", value: stats.uniqueAdmins, icon: User, color: "bg-purple-500/10 text-purple-500" },
          { label: "Persetujuan", value: stats.approveActions, icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-500" },
          { label: "Penolakan", value: stats.rejectActions, icon: XCircle, color: "bg-red-500/10 text-red-500" },
          { label: "Pengeditan", value: stats.editActions, icon: Edit, color: "bg-amber-500/10 text-amber-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", stat.color)}>
                <stat.icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
          </div>
        ))}
      </section>

      {/* Charts Row */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* Daily Activity Chart */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Aktivitas Mingguan
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize: 11}} stroke="#94a3b8" />
                <YAxis tick={{fontSize: 11}} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Distribution */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Distribusi Tipe Aktivitas
          </h3>
          <div className="space-y-3">
            {actionTypeDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", [
                    'bg-emerald-500', 'bg-red-500', 'bg-amber-500', 'bg-purple-500', 'bg-blue-500', 'bg-slate-500'
                  ][i % 6])} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full", [
                        'bg-emerald-500', 'bg-red-500', 'bg-amber-500', 'bg-purple-500', 'bg-blue-500', 'bg-slate-500'
                      ][i % 6])} 
                      style={{ width: `${(item.value / stats.totalActions) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logs Table */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Riwayat Aktivitas</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Cari aktivitas..." 
                className="h-8 pl-9 pr-3 text-xs rounded-lg w-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="h-8 px-2 text-xs rounded-lg border border-input bg-background"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="all">Semua Tipe</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
              <option value="edit">Edit</option>
              <option value="delete">Delete</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={() => setDateSort(prev => prev === 'desc' ? 'asc' : 'desc')}
            >
              {dateSort === 'desc' ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="px-5 py-3.5">Waktu</th>
                  <th className="px-5 py-3.5">Aksi</th>
                  <th className="px-5 py-3.5">Target</th>
                  <th className="px-5 py-3.5">Admin</th>
                  <th className="px-5 py-3.5">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">
                      {searchQuery || actionFilter !== 'all' ? 'Tidak ada hasil yang cocok.' : 'Belum ada aktivitas.'}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.slice(0, 50).map((log) => {
                    const ActionIcon = actionIcons[log.action.toLowerCase()] || actionIcons.default;
                    const actionColor = actionColors[log.action.toLowerCase()] || actionColors.default;
                    
                    return (
                      <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant="secondary" className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold border", actionColor)}>
                            <ActionIcon className="h-2.5 w-2.5 mr-1" />
                            {log.action}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-foreground">
                          {log.target}
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-semibold">{log.adminName}</p>
                            <p className="text-[10px] text-muted-foreground">{log.adminEmail}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground max-w-[200px] truncate">
                          {log.details || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {filteredLogs.length > 50 && (
            <div className="p-3 border-t border-border bg-muted/10 text-center">
              <span className="text-[11px] text-muted-foreground">
                Menampilkan 50 dari {filteredLogs.length} aktivitas
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
