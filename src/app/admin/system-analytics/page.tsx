'use client';

import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Activity, TrendingUp, TrendingDown, Users, FileText, 
  Database, HardDrive, Cpu, Globe, Eye, Clock, Shield,
  CheckCircle, AlertTriangle, ArrowUpRight, Download,
  Calendar, BarChart3, PieChart as LucidePieChart, LineChart as LucideLineChart, Trophy
} from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, getCountFromServer, where } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Link from 'next/link';

interface ProjectProposal {
  id: string;
  projectName: string;
  projectCategory?: string;
  projectLeader: string;
  status: string;
  submittedAt: any;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  tier?: string;
  isActive: boolean;
}

interface Achievement {
  id: string;
  title: string;
  isPublished: boolean;
}

interface NetworkPartner {
  id: string;
  name: string;
  isActive: boolean;
}

interface SystemStats {
  totalProposals: number;
  totalMembers: number;
  totalAchievements: number;
  totalPartners: number;
  activeProposals: number;
  completedProposals: number;
}

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

export default function SystemAnalyticsPage() {
  const firestore = useFirestore();
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    const role = localStorage.getItem('admin-role');
    setAdminRole(role);
  }, []);

  const proposalsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'project-proposals'), orderBy('submittedAt', 'desc'));
  }, [firestore]);

  const membersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'team-members'), where('isActive', '==', true));
  }, [firestore]);

  const achievementsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'achievements'));
  }, [firestore]);

  const partnersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'network-partners'));
  }, [firestore]);

  const { data: proposals } = useCollection<ProjectProposal>(proposalsQuery);
  const { data: members } = useCollection<TeamMember>(membersQuery);
  const { data: achievements } = useCollection<Achievement>(achievementsQuery);
  const { data: partners } = useCollection<NetworkPartner>(partnersQuery);

  const stats: SystemStats = useMemo(() => {
    return {
      totalProposals: proposals?.length || 0,
      totalMembers: members?.length || 0,
      totalAchievements: achievements?.length || 0,
      totalPartners: partners?.length || 0,
      activeProposals: proposals?.filter(p => 
        p.status === 'In Progress' || p.status === 'In Review' || p.status === 'Submitted'
      ).length || 0,
      completedProposals: proposals?.filter(p => p.status === 'Completed').length || 0,
    };
  }, [proposals, members, achievements, partners]);

  const proposalTrend = useMemo(() => {
    if (!proposals) return [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 180;
    const data: Record<string, number> = {};
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
      data[key] = 0;
    }
    
    proposals.forEach(p => {
      const date = convertTimestamp(p.submittedAt);
      if (date) {
        const d = new Date(date);
        const key = d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
        const diffTime = Math.abs(now.getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= days) {
          data[key] = (data[key] || 0) + 1;
        }
      }
    });
    
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [proposals, timeRange]);

  const statusBreakdown = useMemo(() => {
    if (!proposals) return [];
    const statuses = ['Approved', 'In Progress', 'In Review', 'Completed', 'Rejected', 'Submitted'];
    return statuses.map(status => ({
      name: status,
      value: proposals.filter(p => p.status === status).length
    })).filter(s => s.value > 0);
  }, [proposals]);

  const categoryBreakdown = useMemo(() => {
    if (!proposals) return [];
    const categories: Record<string, number> = {};
    proposals.forEach(p => {
      const cat = p.projectCategory || 'Uncategorized';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [proposals]);

  const memberTierBreakdown = useMemo(() => {
    if (!members) return [];
    const tiers: Record<string, number> = {};
    members.forEach(m => {
      const tier = m.tier || 'Other';
      tiers[tier] = (tiers[tier] || 0) + 1;
    });
    return Object.entries(tiers).map(([name, value]) => ({ name, value }));
  }, [members]);

  const recentActivity = useMemo(() => {
    if (!proposals) return [];
    return proposals.slice(0, 5).map(p => ({
      type: 'proposal',
      title: p.projectName,
      status: p.status,
      timestamp: p.submittedAt
    }));
  }, [proposals]);

  if (adminRole !== 'owner') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <Shield className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1>
        <p className="text-muted-foreground max-w-md">
          Halaman ini hanya dapat diakses oleh Owner.
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
          <h1 className="text-2xl font-bold tracking-tight">Analitik Sistem</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Insights mendalam tentang performa platform Tel-Nect.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setTimeRange(range)}
            >
              {range === 'all' ? 'All' : range}
            </Button>
          ))}
        </div>
      </header>

      {/* Key Metrics */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              Total Proposal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProposals}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-500">+12% dari bulan lalu</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              Anggota Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalMembers}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-500">+5% dari bulan lalu</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" />
              Proposal Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeProposals}</div>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3 text-amber-500" />
              <span className="text-xs text-amber-500">Sedang diproses</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalProposals > 0 
                ? Math.round((stats.completedProposals / stats.totalProposals) * 100) 
                : 0}%
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-500">{stats.completedProposals} selesai</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Charts Row */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* Proposal Trend */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <LineChart className="h-4 w-4 text-primary" />
              Tren Proposal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={proposalTrend}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{fontSize: 10}} stroke="#94a3b8" />
                  <YAxis tick={{fontSize: 10}} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="value" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorTrend)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <LucidePieChart className="h-4 w-4 text-primary" />
              Distribusi Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{fontSize: 10}} stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 10}} stroke="#94a3b8" width={80} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Second Charts Row */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Top Categories */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Top Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryBreakdown.length > 0 ? categoryBreakdown.map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${(cat.value / stats.totalProposals) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-6 text-right">{cat.value}</span>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-muted-foreground text-center py-4">Belum ada data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Member Tiers */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Struktur Anggota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {memberTierBreakdown.length > 0 ? memberTierBreakdown.map((tier, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{tier.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full", [
                          'bg-amber-500', 'bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-slate-500'
                        ][i % 5])} 
                        style={{ width: `${(tier.value / stats.totalMembers) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-6 text-right">{tier.value}</span>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-muted-foreground text-center py-4">Belum ada data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Ringkasan Platform
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <span className="text-sm">Pencapaian</span>
                </div>
                <span className="text-lg font-bold">{stats.totalAchievements}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Mitra</span>
                </div>
                <span className="text-lg font-bold">{stats.totalPartners}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm">Penyimpanan</span>
                </div>
                <span className="text-lg font-bold">1.2 GB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* System Health */}
      <section>
        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 px-1">
          Kesehatan Sistem
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Database className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Database</p>
                  <p className="text-lg font-bold text-emerald-600">99.9% Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <HardDrive className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Storage</p>
                  <p className="text-lg font-bold">24% Terpakai</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <Cpu className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CPU Load</p>
                  <p className="text-lg font-bold">12% (Optimal)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Response</p>
                  <p className="text-lg font-bold">124ms</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
