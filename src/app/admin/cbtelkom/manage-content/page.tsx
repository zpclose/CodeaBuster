
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ManageContentPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengelolaan Konten</CardTitle>
        <CardDescription>
          Kelola konten halaman seperti "Tentang Kami", "Program", dll.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Fitur ini sedang dalam pengembangan.</p>
      </CardContent>
    </Card>
  );
}
