
'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Cpu, Target, Layers } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const caseStudyData = {
  title: 'Smart City IoT Dashboard',
  category: 'IoT',
  institutions: ['Telkom University', 'Universitas Mercu Buana'],
  challenge: 'Pemerintah kota menghadapi kesulitan dalam memantau kualitas udara, tingkat kebisingan, dan manajemen limbah secara real-time di berbagai titik strategis. Data yang terfragmentasi menghambat pengambilan keputusan yang cepat dan efektif untuk meningkatkan kualitas hidup warga.',
  solution: 'Tim mengembangkan platform dashboard terpusat yang mengintegrasikan data dari berbagai sensor IoT. Platform ini menyajikan visualisasi data yang intuitif, sistem peringatan dini untuk level polusi yang melebihi ambang batas, dan analisis prediktif sederhana untuk tren kualitas lingkungan perkotaan.',
  techStack: ['React', 'Next.js', 'Firebase Realtime Database', 'Chart.js', 'Raspberry Pi', 'Python'],
  impact: 'Memungkinkan pemantauan lebih dari 50 sensor secara bersamaan dan mengurangi waktu respons terhadap insiden lingkungan hingga 60%.',
  team: [
    { name: 'Rizky Pratama', university: 'Telkom University' },
    { name: 'Diana Sari', university: 'Universitas Mercu Buana' },
    { name: 'Budi Hartono', university: 'Telkom University' },
  ],
};

const techStackIcons: { [key: string]: React.ReactNode } = {
  'React': <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#61DAFB]"><title>React</title><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1.875-8.54a.5.5 0 00-.479.227l-2.023 3.504a.5.5 0 00.434.75h4.044a.5.5 0 00.433-.75L12.505 8.687a.5.5 0 00-.48-.227h-.01z" fill="currentColor"/></svg>,
  'Next.js': <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"><title>Next.js</title><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/><path d="M14.688 15.2h-1.4V8.8h1.4v6.4zm-4.062 0H9.25V8.8h1.376v5.588L14.75 8.8h1.375l-4.125 5.587V15.2z" fill="currentColor"/></svg>,
  'Firebase': <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FFCA28]"><title>Firebase</title><path d="M3.935 18.638l3.493-9.528L3 6.362l1.636-1.636L9 9.12l3.493-9.528L18 6.362l-4.394 4.394 3.493 9.528-1.636 1.636-9.12-4.394-4.408 4.408z" fill="currentColor"/></svg>,
  'Chart.js': <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FF6384]"><title>Chart.js</title><path d="M8.293 3.293a1 1 0 000 1.414L10.586 7H4a1 1 0 100 2h6.586l-2.293 2.293a1 1 0 101.414 1.414l4-4a1 1 0 000-1.414l-4-4a1 1 0 00-1.414 0z" fill="currentColor"/><path d="M19 19a1 1 0 001-1V5a1 1 0 10-2 0v12a1 1 0 001 1z" fill="currentColor"/></svg>,
};


export default function CaseStudyPage() {
    const heroImage = PlaceHolderImages.find(p => p.id === 'case-study-hero');
    const telkomLogo = PlaceHolderImages.find(p => p.id === 'telkom-university-logo-potrait');
    const mercuBuanaLogo = PlaceHolderImages.find(p => p.id === 'mercu-buana-logo-square');


  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        {heroImage && (
             <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover brightness-[.2]"
                priority
                data-ai-hint={heroImage.imageHint}
            />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
            <Badge variant="secondary" className="mb-4">{caseStudyData.category}</Badge>
            <h1 className="font-headline text-4xl font-bold md:text-6xl lg:text-7xl">
                {caseStudyData.title}
            </h1>
            <div className="mt-4 flex items-center gap-4">
                {telkomLogo && <Image src={telkomLogo.imageUrl} alt="Telkom University" width={32} height={32} className="h-8 object-contain" />}
                <span className="text-xl font-bold">+</span>
                {mercuBuanaLogo && <Image src={mercuBuanaLogo.imageUrl} alt="Universitas Mercu Buana" width={32} height={32} className="h-8 object-contain" />}
            </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-16 md:py-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-12">
            <div>
              <h2 className="flex items-center gap-3 font-headline text-2xl font-bold text-primary">
                <Target className="h-6 w-6" />
                The Challenge
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {caseStudyData.challenge}
              </p>
            </div>
            <div>
              <h2 className="flex items-center gap-3 font-headline text-2xl font-bold text-primary">
                <Cpu className="h-6 w-6" />
                The Codebusters Solution
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {caseStudyData.solution}
              </p>
            </div>
             <div className="bg-card p-6 rounded-lg border">
                <h3 className="flex items-center gap-3 font-headline text-xl font-bold">
                    <Layers className="h-6 w-6 text-accent" />
                    Technology Stack
                </h3>
                <div className="mt-4 flex flex-wrap gap-4">
                    {caseStudyData.techStack.map(tech => (
                        <div key={tech} className="flex items-center gap-2 p-2 bg-background rounded-md border">
                            {techStackIcons[tech] || <Cpu className="h-6 w-6" />}
                            <span className="font-mono text-sm">{tech}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-headline text-xl">
                  <Users className="h-6 w-6" />
                  The Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {caseStudyData.team.map(member => (
                  <div key={member.name} className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${member.university === 'Telkom University' ? 'bg-primary' : 'bg-accent'}`}></div>
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.university}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-primary/10 border-primary">
              <CardHeader>
                <CardTitle className="font-headline text-xl">
                    Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-primary">{caseStudyData.impact}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

