
'use client';

import { useState, useMemo, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useProjects } from '@/hooks/useProjects';
import { ArrowRight, User, Code, BrainCircuit, Layers, GitCommit, Search, ListFilter, Calendar, BookOpen, FileText, Info, Users as UsersIcon, Clock, Copy, Share2, Lightbulb, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import type { Project, ProjectCategory, ProjectStatus } from '@/types/content';


const categoryConfig: { [key: string]: { icon: ReactNode } } = {
  'UI/UX Design': { icon: <Layers className="h-4 w-4" /> },
  'Software Development': { icon: <Code className="h-4 w-4" /> },
  'Research': { icon: <BrainCircuit className="h-4 w-4" /> },
  'Mobile App': { icon: <Layers className="h-4 w-4" /> },
  'Web Development': { icon: <Code className="h-4 w-4" /> },
  'Machine Learning': { icon: <BrainCircuit className="h-4 w-4" /> },
  'Other': { icon: <Lightbulb className="h-4 w-4" /> },
  'Data & AI': { icon: <BrainCircuit className="h-4 w-4" /> },
  'Inovasi & Teknologi': { icon: <Lightbulb className="h-4 w-4" /> },
  'IT Enthusiast': { icon: <Users className="h-4 w-4" /> },
};

const statusConfig: { [key: string]: { label: string, color: string } } = {
    'Planning': { label: 'Planning', color: 'text-yellow-500' },
    'In Progress': { label: 'In Progress', color: 'text-blue-500' },
    'Completed': { label: 'Completed', color: 'text-green-500' },
    'On Hold': { label: 'On Hold', color: 'text-muted-foreground' },
    'ACTIVE': { label: 'Aktif', color: 'text-green-500' },
    'COMPLETED': { label: 'Selesai', color: 'text-blue-500' },
    'ARCHIVED': { label: 'Diarsipkan', color: 'text-muted-foreground' },
};


export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [sortOrder, setSortOrder] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { toast } = useToast();
  const { projects, isLoading, error } = useProjects({ activeOnly: false });

  const filteredProjects = useMemo(() => {
    let items = projects.filter((p: Project) => {
      const categoryMatch = categoryFilter === 'Semua' || p.category === categoryFilter;
      const searchMatch = !searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase()) || (p.summary && p.summary.toLowerCase().includes(searchTerm.toLowerCase()));
      return categoryMatch && searchMatch;
    });

    items.sort((a: Project, b: Project) => {
        if (sortOrder === 'all') {
            return (a.order || 0) - (b.order || 0);
        }
        if (sortOrder === 'newest') {
            const dateA = a.lastActivity ? new Date(a.lastActivity).getTime() : -Infinity;
            const dateB = b.lastActivity ? new Date(b.lastActivity).getTime() : -Infinity;
            return dateB - dateA;
        }
        if (sortOrder === 'oldest') {
            const dateA = a.lastActivity ? new Date(a.lastActivity).getTime() : Infinity;
            const dateB = b.lastActivity ? new Date(b.lastActivity).getTime() : Infinity;
            return dateA - dateB;
        }
        if (sortOrder === 'contributors') {
            return b.contributors - a.contributors;
        }
        return 0;
    });

    return items;
  }, [projects, searchTerm, categoryFilter, sortOrder]);
  
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Tautan Disalin!",
        description: "Tautan ke proyek ini telah disalin ke clipboard Anda.",
    });
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      
      <motion.section 
        className="py-16 md:py-20 bg-card border-b"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <div className="container max-w-5xl mx-auto">
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4 text-primary">
                <BookOpen className="h-6 w-6" />
                <span className="font-semibold">Compendium of Works</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="font-headline text-4xl md:text-5xl font-bold">Project Repository</motion.h1>
            <motion.p variants={itemVariants} className="mt-4 text-lg text-muted-foreground max-w-3xl">
              Arsip dari proyek-proyek penelitian dan pengembangan yang dilakukan oleh anggota komunitas Codebusters. Setiap entri mewakili kontribusi intelektual dan teknis yang telah melewati validasi internal.
            </motion.p>
        </div>
      </motion.section>

      <div className="container max-w-5xl mx-auto py-12 md:py-16">
        {/* Control Panel */}
        <Card className="mb-12 shadow-sm">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Cari berdasarkan judul atau abstrak..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by Field of Study" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Semua">Semua Bidang Studi</SelectItem>
                        <SelectItem value="Software Development">Software Development</SelectItem>
                        <SelectItem value="Data & AI">Data & AI</SelectItem>
                        <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                        <SelectItem value="Inovasi & Teknologi">Inovasi & Teknologi</SelectItem>
                        <SelectItem value="IT Enthusiast">IT Enthusiast</SelectItem>
                    </SelectContent>
                </Select>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger>
                        <SelectValue placeholder="Urutkan berdasarkan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Waktu</SelectItem>
                        <SelectItem value="newest">Aktivitas Terbaru</SelectItem>
                        <SelectItem value="oldest">Aktivitas Terlama</SelectItem>
                        <SelectItem value="contributors">Kontributor Terbanyak</SelectItem>
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>

        {/* Project List */}
        <Dialog open={!!selectedProject} onOpenChange={(isOpen) => !isOpen && setSelectedProject(null)}>
          <motion.div 
              className="space-y-8"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
          >
              <AnimatePresence>
              {filteredProjects.map(project => {
                  const CategoryIcon = categoryConfig[project.category]?.icon || <FileText className="h-4 w-4" />;
                  const status = statusConfig[project.status];
                  const lastActivityDate = new Date(project.lastActivity);

                  return (
                      <motion.div key={project.id} layout variants={itemVariants} initial="hidden" animate="visible" exit="hidden">
                          <Card className="hover:border-primary/50 transition-all duration-300 shadow-sm">
                              <CardContent className="p-6">
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                                      {CategoryIcon}
                                      <span>{project.category}</span>
                                      <Separator orientation="vertical" className="h-4"/>
                                      <span className={status.color}>{status.label}</span>
                                  </div>
                                  
                                  <button onClick={() => setSelectedProject(project)} className="text-left w-full group">
                                      <h2 className="font-headline text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">{project.title}</h2>
                                  </button>
                                  
                                  <div className="flex items-center gap-2 text-sm mt-3">
                                      <span className="font-semibold text-foreground">{project.leader}</span>
                                      <span className="text-muted-foreground">& C.C. (+{project.contributors - 1})</span>
                                  </div>

                                  <p className="mt-4 text-muted-foreground leading-relaxed line-clamp-2">
                                      <span className="font-semibold text-foreground">Abstract: </span>{project.summary}
                                  </p>
                                  
                                  <div className="mt-4 space-y-3">
                                       <div>
                                          <h4 className="text-sm font-semibold mb-2">Keywords</h4>
                                          <div className="flex flex-wrap gap-2">
                                              {project.tech.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                                          </div>
                                      </div>
                                      <div className="text-sm text-muted-foreground flex items-center justify-between pt-3 border-t">
                                           <p>
                                              <span className="font-semibold">Last Activity:</span> {lastActivityDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                          </p>
                                          <Button variant="ghost" asChild size="sm" onClick={() => setSelectedProject(project)}>
                                            <button>
                                                Lihat Detail <ArrowRight className="ml-2 h-4 w-4" />
                                            </button>
                                          </Button>
                                      </div>
                                  </div>
                               </CardContent>
                          </Card>
                      </motion.div>
                  )
              })}
              </AnimatePresence>

              {isLoading ? (
                  <div className="text-center py-16 text-muted-foreground">
                      <p>Memuat proyek...</p>
                  </div>
              ) : filteredProjects.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                      <p>Tidak ada proyek yang cocok dengan kriteria pencarian Anda.</p>
                  </div>
              ) : null}
          </motion.div>

          {selectedProject && (
            <DialogContent className="max-w-4xl p-0">
                <div className="grid md:grid-cols-3">
                    <div className="md:col-span-2 p-8 space-y-6">
                        <DialogHeader>
                            <div className="flex items-center gap-4">
                                <Badge variant="outline">{selectedProject.category}</Badge>
                                <span className={`${statusConfig[selectedProject.status].color} text-sm font-semibold`}>
                                    {statusConfig[selectedProject.status].label}
                                </span>
                            </div>
                            <DialogTitle className="font-headline text-3xl leading-tight !text-left">{selectedProject.title}</DialogTitle>
                        </DialogHeader>
                        <div>
                            <h4 className="font-semibold text-lg mb-2">Abstrak</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{selectedProject.summary}</p>
                        </div>
                        {selectedProject.heroImageId && PlaceHolderImages.find(p => p.id === selectedProject.heroImageId) && (
                            <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                                <Image
                                    src={PlaceHolderImages.find(p => p.id === selectedProject.heroImageId)!.imageUrl}
                                    alt={selectedProject.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-1 bg-muted/50 p-8 border-l space-y-6 flex flex-col">
                        <div className="space-y-6 flex-grow">
                            <div>
                                <h4 className="font-semibold text-sm flex items-center gap-2 mb-3"><User className="h-4 w-4"/> Pemimpin Proyek</h4>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-foreground">{selectedProject.leader}</span>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-sm flex items-center gap-2 mb-3"><UsersIcon className="h-4 w-4"/> Kontributor</h4>
                                <p className="font-medium text-foreground">{selectedProject.contributors} Anggota</p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-sm flex items-center gap-2 mb-3"><Code className="h-4 w-4"/> Kata Kunci</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProject.tech.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-sm flex items-center gap-2 mb-3"><Clock className="h-4 w-4"/> Aktivitas Terakhir</h4>
                                <p className="font-medium text-foreground">{new Date(selectedProject.lastActivity).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Button className="w-full" variant="outline" onClick={() => copyToClipboard(`${window.location.origin}/projects/${selectedProject.id}`)}>
                                <Copy className="mr-2 h-4 w-4" /> Salin Tautan
                            </Button>
                            <Button className="w-full" variant="outline">
                                <Share2 className="mr-2 h-4 w-4" /> Bagikan
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-8 pb-8 sm:justify-start">
                    <div className="w-full">
                         <Alert variant="default" className="bg-primary/10 border-primary/20 text-primary">
                            <Info className="h-4 w-4 !text-primary" />
                            <AlertTitle>Halaman Studi Kasus dalam Pengembangan</AlertTitle>
                            <AlertDescription className="text-primary/90">
                               Halaman detail lengkap untuk proyek ini sedang kami persiapkan. Terima kasih atas kesabaran Anda.
                            </AlertDescription>
                        </Alert>
                        <div className="mt-4 flex justify-end gap-2">
                           <DialogClose asChild>
                               <Button variant="ghost">Tutup</Button>
                           </DialogClose>
                           <Button disabled>Buka Halaman Studi Kasus</Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </div>
  );
}
