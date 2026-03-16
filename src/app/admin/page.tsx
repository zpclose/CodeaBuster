'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Inbox, Users, FileText, Activity, Zap, User, Trophy, Network, Image as ImageIcon, ArrowRight, CheckCircle2, Clock, XCircle, LayoutDashboard, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Calendar, Eye, Plus, Settings, Bell, Shield, Database, FileCode, Globe, RefreshCw, AlertCircle, Crown, UserCog } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, limit, query, orderBy } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import type { ProjectProposal } from '@/types/project';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useAchievements } from '@/hooks/useAchievements';
import { useNetworkPartners } from '@/hooks/useNetworkPartners';
import { useProjects } from '@/hooks/useProjects';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function AdminDashboardPage() {
  const firestore = useFirestore();
  const [adminUsername, setAdminUsername] = useState('Admin');
  const [adminRole, setAdminRole] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const { members } = useTeamMembers();
  const { achievements } = useAchievements();
  const { partners } = useNetworkPartners();
  const { projects } = useProjects({ activeOnly: false });

  useEffect(() => {
    const session = localStorage.getItem('admin-session');
    if (session) {
      setAdminUsername('Admin');
    }
    setAdminRole(localStorage.getItem('admin-role') || '');
    
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const recentProposalsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'project-proposals'), orderBy('submittedAt', 'desc'), limit(5));
  }, [firestore]);

  const allProposalsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'project-proposals'));
  }, [firestore]);

  const { data: recentProposals } = useCollection<ProjectProposal>(recentProposalsQuery);
  const { data: allProposals } = useCollection<ProjectProposal>(allProposalsQuery);

  const totalProposals = allProposals?.length || 0;
  const approvedProposals = allProposals?.filter(p => p.status === 'Approved').length || 0;
  const processingProposals = allProposals?.filter(p => p.status === 'In Progress' || p.status === 'In Review').length || 0;
  const completedProposals = allProposals?.filter(p => p.status === 'Completed').length || 0;
  const rejectedProposals = allProposals?.filter(p => p.status === 'Rejected').length || 0;
  const submittedProposals = allProposals?.filter(p => p.status === 'Submitted').length || 0;

  const proposalStatusData = [
    { name: 'Submitted', value: submittedProposals, color: '#3b82f6' },
    { name: 'In Review', value: processingProposals, color: '#f59e0b' },
    { name: 'Approved', value: approvedProposals, color: '#10b981' },
    { name: 'In Progress', value: allProposals?.filter(p => p.status === 'In Progress').length || 0, color: '#8b5cf6' },
    { name: 'Completed', value: completedProposals, color: '#06b6d4' },
    { name: 'Rejected', value: rejectedProposals, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const contentStatsData = [
    { name: 'Proposals', count: totalProposals },
    { name: 'Projects', count: projects.length },
    { name: 'Team', count: members.length },
    { name: 'Achievements', count: achievements.length },
    { name: 'Partners', count: partners.length },
  ];

  const weeklyData = [
    { day: 'Mon', proposals: 4, projects: 2 },
    { day: 'Tue', proposals: 3, projects: 1 },
    { day: 'Wed', proposals: 8, projects: 3 },
    { day: 'Thu', proposals: 5, projects: 2 },
    { day: 'Fri', proposals: 12, projects: 4 },
    { day: 'Sat', proposals: 6, projects: 3 },
    { day: 'Sun', proposals: 2, projects: 1 },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const stats = [
    { 
      title: 'Total Proposals', 
      value: totalProposals, 
      change: '+12%',
      trend: 'up',
      icon: Inbox,
      color: 'blue'
    },
    { 
      title: 'Active Projects', 
      value: projects.filter(p => p.isActive).length, 
      change: '+5%',
      trend: 'up',
      icon: Zap,
      color: 'purple'
    },
    { 
      title: 'Team Members', 
      value: members.length, 
      change: '+2%',
      trend: 'up',
      icon: Users,
      color: 'green'
    },
    { 
      title: 'Achievements', 
      value: achievements.length, 
      change: '+8%',
      trend: 'up',
      icon: Trophy,
      color: 'amber'
    },
  ];

  const quickActions = [
    { title: 'Add Project', icon: Plus, href: '/admin/content/projects', color: 'bg-purple-500' },
    { title: 'View Proposals', icon: FileText, href: '/admin/proposals', color: 'bg-blue-500' },
    { title: 'Settings', icon: Settings, href: '/admin/settings', color: 'bg-gray-500' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-10 -mb-10" />
        
        <div className="relative z-10 flex items-start gap-5">
          <div className="h-14 w-14 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Dashboard Admin
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Selamat datang, <span className="text-white font-medium">{adminUsername}</span>
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-lg border border-white/10">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-300">{formatDate(currentTime)}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
            </span>
            <span className="text-xs font-medium">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className={cn(
              "absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity -mr-8 -mt-8",
              stat.color === 'blue' && "bg-blue-500",
              stat.color === 'purple' && "bg-purple-500",
              stat.color === 'green' && "bg-green-500",
              stat.color === 'amber' && "bg-amber-500"
            )} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"> {stat.title}</span>
                <div className={cn(
                  "p-2 rounded-lg",
                  stat.color === 'blue' && "bg-blue-50 dark:bg-blue-950 text-blue-600",
                  stat.color === 'purple' && "bg-purple-50 dark:bg-purple-950 text-purple-600",
                  stat.color === 'green' && "bg-green-50 dark:bg-green-950 text-green-600",
                  stat.color === 'amber' && "bg-amber-50 dark:bg-amber-950 text-amber-600"
                )}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  stat.trend === 'up' ? "text-green-600" : "text-red-600"
                )}>
                  {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart - Weekly Activity */}
        <Card className="lg:col-span-2 border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Weekly Overview
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">Proposal & Project submissions this week</p>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProposals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="proposals" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorProposals)" 
                    name="Proposals"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="projects" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorProjects)" 
                    name="Projects"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Status Distribution */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-purple-500" />
              Proposal Status
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">Distribution by status</p>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {proposalStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={proposalStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {proposalStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No data available
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {proposalStatusData.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-slate-500">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Stats Bar */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Database className="h-4 w-4 text-green-500" />
            Content Overview
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">Total records in database</p>
        </CardHeader>
        <CardContent>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contentStatsData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[0, 4, 4, 0]}
                  maxBarSize={24}
                >
                  {contentStatsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action, idx) => (
              <Link key={idx} href={action.href}>
                <Button variant="outline" className="w-full justify-start h-11 text-sm font-medium">
                  <div className={cn("p-1.5 rounded-lg mr-3", action.color)}>
                    <action.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  {action.title}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Proposals */}
        <Card className="lg:col-span-2 border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Recent Proposals
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-slate-500">
                <Link href="/admin/proposals">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentProposals?.length === 0 ? (
              <div className="py-8 text-center">
                <Inbox className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No proposals yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentProposals?.slice(0, 4).map((proposal) => (
                  <div key={proposal.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{proposal.projectName}</p>
                      <p className="text-xs text-slate-500">{proposal.projectLeader}</p>
                    </div>
                    <Badge className={cn(
                      "rounded-md px-2 py-0.5 text-[10px] font-medium ml-2 shrink-0",
                      proposal.status === 'Approved' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                      proposal.status === 'Rejected' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                      proposal.status === 'In Progress' && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                      proposal.status === 'In Review' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                      proposal.status === 'Submitted' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                      proposal.status === 'Completed' && "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
                    )}>
                      {proposal.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation Grid */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Content Management
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { title: 'Proposals', icon: Inbox, count: totalProposals, href: '/admin/proposals', color: 'blue' },
            { title: 'Projects', icon: Zap, count: projects.length, href: '/admin/content/projects', color: 'purple' },
            { title: 'Team', icon: Users, count: members.length, href: '/admin/content/team', color: 'green' },
            { title: 'Achievements', icon: Trophy, count: achievements.length, href: '/admin/content/achievements', color: 'amber' },
            { title: 'Partners', icon: Network, count: partners.length, href: '/admin/content/partners', color: 'pink' },
            { title: 'Images', icon: ImageIcon, count: '-', href: '/admin/content/images', color: 'cyan' },
          ].map((item, idx) => (
            <Link key={idx} href={item.href}>
              <div className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    item.color === 'blue' && "bg-blue-50 dark:bg-blue-950 text-blue-600",
                    item.color === 'purple' && "bg-purple-50 dark:bg-purple-950 text-purple-600",
                    item.color === 'green' && "bg-green-50 dark:bg-green-950 text-green-600",
                    item.color === 'amber' && "bg-amber-50 dark:bg-amber-950 text-amber-600",
                    item.color === 'pink' && "bg-pink-50 dark:bg-pink-950 text-pink-600",
                    item.color === 'cyan' && "bg-cyan-50 dark:bg-cyan-950 text-cyan-600",
                  )}>
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{item.title}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">{item.count}</span>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Owner Only - Admin Management */}
      {adminRole === 'owner' && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500" />
            Admin Management
            <Badge variant="outline" className="ml-2 text-[10px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">
              Owner Only
            </Badge>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Admins */}
            <div className="group bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-5 border border-amber-200 dark:border-amber-800/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide">Total Admins</span>
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                  <UserCog className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-amber-900 dark:text-amber-300">-</span>
                <div className="h-8 w-8 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Owner Account */}
            <div className="group bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-xl p-5 border border-purple-200 dark:border-purple-800/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-purple-700 dark:text-purple-400 uppercase tracking-wide">Owner</span>
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                  <Crown className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-xl font-bold text-purple-900 dark:text-purple-300">1</span>
                <div className="h-8 w-8 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Active Admins */}
            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-5 border border-green-200 dark:border-green-800/50 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">Active Admins</span>
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                  <Shield className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-green-900 dark:text-green-300">-</span>
                <div className="h-8 w-8 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Manage Admins Button */}
            <Link href="/admin/manage-admins" className="group">
              <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-xl p-5 border border-slate-700 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-300 uppercase tracking-wide">Kelola Admin</span>
                  <div className="p-2 rounded-lg bg-slate-700 text-slate-300">
                    <Settings className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-sm text-slate-400">Akses penuh</span>
                  <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-colors">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Info for Owner */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 shrink-0">
                <Crown className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300">Akun Owner</h4>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  Anda memiliki akses penuh ke sistem. Hanya akun owner yang dapat mengelola admin lain, mengubah kata sandi, dan mengakses pengaturan sistem tingkat tinggi.
                </p>
                <Button variant="link" asChild className="h-auto p-0 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700">
                  <Link href="/admin/manage-admins">
                    Kelola Admin <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
