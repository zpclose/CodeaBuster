
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ManageImagesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengelolaan Gambar</CardTitle>
        <CardDescription>
          Unggah, hapus, dan kelola semua gambar yang digunakan di situs web.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Fitur ini sedang dalam pengembangan.</p>
      </CardContent>
    </Card>
  );
}
