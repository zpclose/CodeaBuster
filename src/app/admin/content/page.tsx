'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useAchievements } from '@/hooks/useAchievements';
import { useNetworkPartners } from '@/hooks/useNetworkPartners';
import { Users, Trophy, Network, Image, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ContentDashboard() {
    const { members } = useTeamMembers();
    const { achievements } = useAchievements();
    const { partners } = useNetworkPartners();

    const stats = [
        {
            title: 'Team Members',
            value: members.length,
            description: `${members.filter(m => m.isActive).length} active, ${members.filter(m => !m.isActive).length} inactive`,
            icon: Users,
            href: '/admin/content/team',
            color: 'text-blue-600',
        },
        {
            title: 'Achievements',
            value: achievements.length,
            description: `${achievements.filter(a => a.isHallOfFame).length} in Hall of Fame`,
            icon: Trophy,
            href: '/admin/content/achievements',
            color: 'text-amber-600',
        },
        {
            title: 'Network Partners',
            value: partners.length,
            description: `${partners.filter(p => p.isActive).length} active partnerships`,
            icon: Network,
            href: '/admin/content/partners',
            color: 'text-green-600',
        },
        {
            title: 'Page Images',
            value: '-',
            description: 'Manage images across pages',
            icon: Image,
            href: '/admin/content/images',
            color: 'text-purple-600',
        },
    ];

    return (
        <div className="h-full overflow-y-auto custom-scrollbar pr-2 -mr-2 container py-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Content Management</h1>
                <p className="text-muted-foreground">
                    Manage all content across your website from one place
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mb-4">{stat.description}</p>
                                <Button asChild variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <Link href={stat.href}>
                                        Manage
                                        <ArrowRight className="ml-2 h-3 w-3" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks you might want to perform</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                            <Link href="/admin/content/team">
                                <Plus className="h-5 w-5" />
                                <span>Add Team Member</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                            <Link href="/admin/content/achievements">
                                <Plus className="h-5 w-5" />
                                <span>Add Achievement</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                            <Link href="/admin/content/partners">
                                <Plus className="h-5 w-5" />
                                <span>Add Partner</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                            <Link href="/admin/content/images">
                                <Plus className="h-5 w-5" />
                                <span>Upload Image</span>
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest changes to your content</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Activity feed coming soon...
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
