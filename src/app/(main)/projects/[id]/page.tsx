
import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Cpu, Target, Layers, Link as LinkIcon, Github, MessageSquare } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock data, in a real app this would be fetched based on params.id
const projectData = {
  'smart-city-iot': {
    id: 'smart-city-iot',
    title: 'Smart City IoT Dashboard',
    category: 'Software Development',
    heroImageId: 'project-iot-dashboard',
    challenge: 'Pemerintah kota menghadapi kesulitan dalam memantau kualitas udara, tingkat kebisingan, dan manajemen limbah secara real-time. Data yang terfragmentasi menghambat pengambilan keputusan yang cepat dan efektif.',
    solution: 'Tim mengembangkan platform dashboard terpusat yang mengintegrasikan data dari berbagai sensor IoT. Platform ini menyajikan visualisasi data yang intuitif, sistem peringatan dini, dan analisis prediktif sederhana.',
    techStack: ['React', 'Next.js', 'Firebase', 'Chart.js', 'Python'],
    team: [
      { name: 'Rizky Pratama', role: 'Project Leader', avatarId: 'member-tu' },
      { name: 'Diana Sari', role: 'Back-End Developer', avatarId: 'member-umb' },
      { name: 'Budi Hartono', role: 'Front-End Developer', avatarId: 'sifonix-baskara' },
    ],
    relatedProgram: "Proyek Kolaborasi",
    liveDemoUrl: '#',
    repoUrl: '#',
  },
  'sifonix-elearning': {
    id: 'sifonix-elearning',
    title: 'Sifonix E-Learning Platform',
    category: 'UI/UX Design Challenge',
    heroImageId: 'achievement-elearning-winner',
    challenge: 'Platform e-learning konvensional seringkali gagal mempertahankan minat belajar siswa karena antarmuka yang kaku, kurangnya interaksi, dan pengalaman yang monoton.',
    solution: 'Memperkenalkan platform e-learning yang intuitif, menarik, dan aksesibel, yang dirancang dengan gamifikasi untuk mengubah cara siswa belajar dan meningkatkan keterlibatan.',
    techStack: ['Figma', 'Miro', 'Maze'],
    team: [
      { name: 'Citra Dewi Lestari', role: 'Project Manager & UX Researcher', avatarId: 'sifonix-citra' },
      { name: 'Baskara Wijaya', role: 'Lead UI/UX Designer', avatarId: 'sifonix-baskara' },
      { name: 'Ahmad Riyadi', role: 'UI Designer & Prototyper', avatarId: 'sifonix-ahmad' },
    ],
    relatedProgram: "UI/UX Challenge 2024",
    liveDemoUrl: '/sifonix-portfolio',
    repoUrl: null,
  }
};

// Fallback data
const defaultProject = projectData['smart-city-iot'];

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
    const project = (projectData as any)[params.id] || defaultProject;
    
    const heroImage = PlaceHolderImages.find(p => p.id === project.heroImageId);

    return (
        <div className="bg-background text-foreground">
            {/* Hero Section */}
            <section className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden bg-gray-800">
                {heroImage && (
                    <ImageWithSkeleton
                        src={heroImage.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover opacity-20"
                        priority
                    />
                )}
                <div className="container relative z-10 flex h-full flex-col items-start justify-end pb-12 text-white">
                    <Badge variant="secondary" className="mb-4 text-base">{project.category}</Badge>
                    <h1 className="font-headline text-4xl font-bold md:text-6xl max-w-4xl">
                        {project.title}
                    </h1>
                </div>
            </section>

            {/* Main Content */}
            <div className="container py-16 md:py-24 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="flex items-center gap-3 font-headline text-3xl font-bold text-primary mb-4">
                                <Target className="h-8 w-8" />
                                Ringkasan Proyek
                            </h2>
                            <div className="space-y-6 text-lg text-muted-foreground">
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Tantangan</h3>
                                    <p>{project.challenge}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Solusi</h3>
                                    <p>{project.solution}</p>
                                </div>
                            </div>
                        </section>
                         {/* Placeholder for Feedback/Rating Section */}
                        <section>
                             <h2 className="flex items-center gap-3 font-headline text-3xl font-bold text-primary mb-4">
                                <MessageSquare className="h-8 w-8" />
                                Ulasan Komunitas
                            </h2>
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    Fitur ulasan akan segera hadir.
                                </CardContent>
                            </Card>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-8 lg:mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 font-headline text-xl">
                                    <Users className="h-6 w-6" />
                                    Tim Proyek
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {project.team.map((member: any) => {
                                    const avatar = PlaceHolderImages.find(p => p.id === member.avatarId);
                                    return (
                                        <div key={member.name} className="flex items-center gap-3">
                                            {avatar && <ImageWithSkeleton src={avatar.imageUrl} alt={member.name} width={40} height={40} className="rounded-full h-10 w-10 object-cover" />}
                                            <div>
                                                <p className="font-semibold">{member.name}</p>
                                                <p className="text-sm text-muted-foreground">{member.role}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 font-headline text-xl">
                                    <Layers className="h-6 w-6" />
                                    Tumpukan Teknologi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                {project.techStack.map((tech: string) => (
                                    <Badge key={tech} variant="outline">{tech}</Badge>
                                ))}
                            </CardContent>
                        </Card>
                        
                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-3 font-headline text-xl">
                                    <Cpu className="h-6 w-6" />
                                    Informasi Tambahan
                                </CardTitle>
                            </CardHeader>
                             <CardContent className="space-y-2 text-sm">
                                <p><span className="font-semibold">Program Terkait:</span> {project.relatedProgram}</p>
                                <div className="flex flex-col space-y-2 pt-4">
                                    {project.liveDemoUrl && (
                                        <Button asChild>
                                            <Link href={project.liveDemoUrl} target="_blank">
                                                <LinkIcon className="mr-2 h-4 w-4" />
                                                Lihat Live Demo
                                            </Link>
                                        </Button>
                                    )}
                                    {project.repoUrl && (
                                        <Button variant="secondary" asChild>
                                            <Link href={project.repoUrl} target="_blank">
                                                <Github className="mr-2 h-4 w-4" />
                                                Lihat Repositori
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    );
}

// Generate static paths for known projects
export async function generateStaticParams() {
  const projectIds = ['smart-city-iot', 'sifonix-elearning'];
  return projectIds.map(id => ({ id }));
}
