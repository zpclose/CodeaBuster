
'use client';

import SettingsLayout from '../SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ActivityItem {
  date: string;
  activity: string;
  type: string;
  ip: string;
  status: string;
}

function HistoryForm() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const userDocRef = useMemoFirebase(() => 
    user && firestore ? doc(firestore, 'users', user.uid) : null,
  [user, firestore]);

  const { data: userProfile, isLoading: docLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (!docLoading && userProfile) {
      const history = userProfile.activityHistory || [];
      const formattedHistory: ActivityItem[] = history.map((item: any) => ({
        date: item.timestamp ? new Date(item.timestamp).toLocaleString('id-ID', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : '-',
        activity: item.activity || '-',
        type: item.type || '-',
        ip: item.ip || '-',
        status: item.status || '-'
      }));
      setActivities(formattedHistory);
    } else if (!docLoading && !userProfile) {
      setActivities([
        { date: '2024-07-29 14:00', activity: 'Kata sandi diubah', type: 'Keamanan', ip: '103.22.11.5', status: 'Berhasil' },
        { date: '2024-07-29 10:30', activity: 'Login dari perangkat baru', type: 'Keamanan', ip: '103.22.11.5', status: 'Berhasil' },
        { date: '2024-07-28 18:00', activity: 'Profil publik diperbarui', type: 'Profil', ip: '103.22.11.5', status: 'Berhasil' },
      ]);
    }
    setIsLoading(false);
  }, [docLoading, userProfile]);

  if (isLoading || docLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Riwayat Aktivitas</CardTitle>
        <CardDescription>
          Catatan aktivitas penting yang terkait dengan akun Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Aktivitas</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Alamat IP</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.length > 0 ? (
              activities.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell className="font-medium">{item.activity}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell className="font-mono text-xs">{item.ip}</TableCell>
                  <TableCell className="text-right">
                    <span className={item.status === 'Berhasil' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {item.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Belum ada riwayat aktivitas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function HistoryPage() {
  return (
    <SettingsLayout>
      <HistoryForm />
    </SettingsLayout>
  );
}
