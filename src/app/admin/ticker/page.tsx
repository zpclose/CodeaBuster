'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus, Pencil, Trash2, Eye, Radio, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface TickerItem {
  id: string;
  text: string;
  icon: string;
  isActive: boolean;
  order: number;
}

const iconOptions = [
  { value: 'LinkIcon', label: 'Link', icon: '🔗' },
  { value: 'GraduationCap', label: 'Education', icon: '🎓' },
  { value: 'Wrench', label: 'Tool', icon: '🔧' },
  { value: 'Lightbulb', label: 'Idea', icon: '💡' },
  { value: 'Star', label: 'Star', icon: '⭐' },
  { value: 'Trophy', label: 'Award', icon: '🏆' },
  { value: 'Users', label: 'Users', icon: '👥' },
  { value: 'Rocket', label: 'Launch', icon: ' ' },
  { value: 'Heart', label: 'Heart', icon: '❤️' },
  { value: 'Fire', label: 'Fire', icon: '🔥' },
];

export function useTickerItems() {
  const firestore = useFirestore();

  const query_ = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'ticker-settings'),
      orderBy('order', 'asc'),
      limit(20)
    );
  }, [firestore]);

  const { data, isLoading, error } = useCollection<TickerItem>(query_);

  const activeItems = useMemo(() => {
    if (!data) return [];
    return data.filter(item => item.isActive).sort((a, b) => a.order - b.order);
  }, [data]);

  return { items: data, activeItems, isLoading, error };
}

export default function TickerSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { items, isLoading, error } = useTickerItems();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<TickerItem | null>(null);

  // Form states
  const [formText, setFormText] = useState('');
  const [formIcon, setFormIcon] = useState('LinkIcon');
  const [formActive, setFormActive] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const handleAdd = async () => {
    if (!formText.trim()) {
      toast({ title: 'Error', description: 'Text tidak boleh kosong', variant: 'destructive' });
      return;
    }

    setFormLoading(true);
    try {
      await addDoc(collection(firestore!, 'ticker-settings'), {
        text: formText,
        icon: formIcon,
        isActive: formActive,
        order: items?.length || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({ title: 'Berhasil', description: 'Item berhasil ditambahkan' });
      setIsAddOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menambahkan item', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!formText.trim() || !selectedItem) {
      toast({ title: 'Error', description: 'Text tidak boleh kosong', variant: 'destructive' });
      return;
    }

    setFormLoading(true);
    try {
      await updateDoc(doc(firestore!, 'ticker-settings', selectedItem.id), {
        text: formText,
        icon: formIcon,
        isActive: formActive,
        updatedAt: serverTimestamp(),
      });

      toast({ title: 'Berhasil', description: 'Item berhasil diupdate' });
      setIsEditOpen(false);
      setSelectedItem(null);
      resetForm();
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal mengupdate item', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    setFormLoading(true);
    try {
      await deleteDoc(doc(firestore!, 'ticker-settings', selectedItem.id));

      toast({ title: 'Berhasil', description: 'Item berhasil dihapus' });
      setIsDeleteOpen(false);
      setSelectedItem(null);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menghapus item', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (item: TickerItem) => {
    try {
      await updateDoc(doc(firestore!, 'ticker-settings', item.id), {
        isActive: !item.isActive,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal mengubah status', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormText('');
    setFormIcon('LinkIcon');
    setFormActive(true);
  };

  const openEdit = (item: TickerItem) => {
    setSelectedItem(item);
    setFormText(item.text);
    setFormIcon(item.icon);
    setFormActive(item.isActive);
    setIsEditOpen(true);
  };

  const openDelete = (item: TickerItem) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const getIconEmoji = (iconName: string) => {
    return iconOptions.find(i => i.value === iconName)?.icon || '📌';
  };

  if (error) {
    return (
      <div className="space-y-8 pb-12 pt-1 pr-2">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
              <Radio className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-amber-600 mb-2">Gagal Memuat Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {error.message || 'Terjadi kesalahan saat memuat data dari Firestore.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 pt-1 pr-2">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1 text-card-foreground">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-1.5 py-0 h-4">
              <Radio className="h-2.5 w-2.5 mr-1" />
              Live Feed
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Pengaturan Live Feed</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Kelola aktivitas yang ditampilkan di marquee beranda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" onClick={() => { resetForm(); setIsAddOpen(true); }}>
            <Plus className="h-3.5 w-3.5 mr-2" />
            Tambah Item
          </Button>
        </div>
      </header>

      {/* Preview */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Preview
        </h3>
        <div className="bg-muted/50 rounded-lg p-3 overflow-hidden">
          <div className="flex whitespace-nowrap items-center">
            <div className="flex items-center mx-4">
              <span className="text-lg mr-2">🔄</span>
              <span className="text-sm text-muted-foreground">Preview animasi...</span>
            </div>
            {isLoading ? (
              <span className="text-sm text-muted-foreground">Memuat...</span>
            ) : items && items.length > 0 ? (
              items.filter(i => i.isActive).slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center mx-4">
                  <span className="text-lg mr-2">{getIconEmoji(item.icon)}</span>
                  <span className="text-sm">{item.text.slice(0, 50)}...</span>
                  <span className="text-primary mx-2">⭐</span>
                </div>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Belum ada item. Tambahkan item di bawah.</span>
            )}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Daftar Item ({items?.length || 0})
        </h3>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl border bg-card border-border hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                    {getIconEmoji(item.icon)}
                  </div>
                  <div>
                    <p className={`font-medium ${!item.isActive && 'line-through text-muted-foreground'}`}>
                      {item.text}
                    </p>
                    <p className="text-xs text-muted-foreground">Icon: {item.icon} • Order: {item.order}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.isActive}
                    onCheckedChange={() => handleToggleActive(item)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDelete(item)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
            <Radio className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Belum ada item. Klik "Tambah Item" untuk mulai.</p>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tambah Item Live Feed</DialogTitle>
            <DialogDescription>
              Tambah aktivitas baru yang akan ditampilkan di marquee beranda.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Text</Label>
              <Input
                placeholder="Contoh: Codebuster A. Mengirim Pull Request..."
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-5 gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon.value}
                    type="button"
                    onClick={() => setFormIcon(icon.value)}
                    className={`p-3 rounded-lg border transition-all ${formIcon === icon.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                      }`}
                    title={icon.label}
                  >
                    {icon.icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formActive} onCheckedChange={setFormActive} />
              <Label>Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
            <Button onClick={handleAdd} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Item Live Feed</DialogTitle>
            <DialogDescription>
              Ubah aktivitas yang ditampilkan di marquee beranda.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Text</Label>
              <Input
                placeholder="Contoh: Codebuster A. Mengirim Pull Request..."
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-5 gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon.value}
                    type="button"
                    onClick={() => setFormIcon(icon.value)}
                    className={`p-3 rounded-lg border transition-all ${formIcon === icon.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                      }`}
                    title={icon.label}
                  >
                    {icon.icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formActive} onCheckedChange={setFormActive} />
              <Label>Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
            <Button onClick={handleEdit} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Hapus Item?</DialogTitle>
            <DialogDescription>
              Item "{selectedItem?.text.slice(0, 30)}..." akan dihapus secara permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
