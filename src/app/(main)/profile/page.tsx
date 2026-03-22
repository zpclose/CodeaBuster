'use client';

import ImageWithSkeleton from '@/components/ui/image-with-skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Github, Linkedin, Mail, Trophy, Zap, Code, Star, Briefcase, Users, Loader2, Camera } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useEffect, ReactNode, useRef, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';

const institutionLogo: { [key: string]: string } = {
  'Telkom University': 'https://upload.wikimedia.org/wikipedia/commons/0/03/Logo_Telkom_University_potrait.png',
  'Universitas Mercu Buana': 'https://firebasestorage.googleapis.com/v0/b/studio-8681629558-68f05.firebasestorage.app/o/LOGO_UNIVERSITAS_MERCU_BUANA.png?alt=media&token=f7d3fdf6-26a4-46cb-9dce-f3bb83d131dd',
};

const badgeIcons: { [key: string]: ReactNode } = {
  "Hackathon Winner 2023": <Trophy className="h-5 w-5 text-yellow-500" />,
  "Top Contributor Q2 2024": <Star className="h-5 w-5 text-yellow-500" />,
  "Masterclass Speaker": <Zap className="h-5 w-5 text-blue-500" />,
};

const MOCK_USER_DATA = {
  fullName: "Member",
  avatarUrl: "",
  institution: "Telkom University",
  major: "Teknik Informatika",
  communityEngagement: {
    status: "Codebusters Elite Member",
    mentorship: "Mentor",
    workshopsAttended: 12,
    hackathonsJoined: 4,
    badges: [
      { name: "Hackathon Winner 2023" },
      { name: "Top Contributor Q2 2024" },
      { name: "Masterclass Speaker" }
    ]
  },
  quickStats: {
    projects: 3,
    contributions: 152,
    rank: 12
  },
  bio: "Full-stack developer dengan fokus pada pembangunan aplikasi web modern dan scalable. Tertarik pada perpotongan antara AI dan rekayasa perangkat lunak untuk menciptakan solusi yang cerdas dan efisien.",
  links: {
    github: "",
    linkedin: "",
    email: ""
  },
  technicalSkills: {
    languages: [
      { name: "TypeScript", proficiency: 90 },
      { name: "Python", proficiency: 85 },
      { name: "Go", proficiency: 70 },
      { name: "Rust", proficiency: 60 }
    ],
    specializations: ["AI/ML", "Back-End Development", "Cyber Security", "FinTech"],
    certifications: [
      "Certified Kubernetes Application Developer (CKAD)",
      "Google Cloud Certified - Professional Cloud Architect"
    ]
  },
  projectContributions: [
    {
      name: "Smart City IoT Dashboard",
      role: "Project Leader",
      status: "Completed",
      isCollaborative: true
    },
    {
      name: "AI-Powered FinTech Advisor",
      role: "Core Contributor",
      status: "Active",
      isCollaborative: false
    },
    {
      name: "Cybersec Threat Intelligence Platform",
      role: "Contributor",
      status: "Active",
      isCollaborative: true
    }
  ]
};

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() =>
    user && firestore ? doc(firestore, 'users', user.uid) : null,
    [user, firestore]);

  const { data: userProfileFromHook, loading: profileLoading } = useDoc(userDocRef);

  const [localUserProfile, setLocalUserProfile] = useState<any>({
    ...MOCK_USER_DATA,
    fullName: user?.displayName || MOCK_USER_DATA.fullName,
    avatarUrl: user?.photoURL || MOCK_USER_DATA.avatarUrl,
  });

  useEffect(() => {
    if (userProfileFromHook) {
      setLocalUserProfile((prev: any) => ({
        ...prev,
        fullName: userProfileFromHook.fullName || user?.displayName || prev.fullName,
        avatarUrl: userProfileFromHook.avatarUrl || user?.photoURL || prev.avatarUrl,
        bio: userProfileFromHook.bio || prev.bio,
        links: {
          ...prev.links,
          github: userProfileFromHook.links?.github || prev.links.github,
          linkedin: userProfileFromHook.links?.linkedin || prev.links.linkedin,
        }
      }));
    }
  }, [userProfileFromHook, user]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !firestore) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Format tidak didukung", description: "Harap unggah file gambar.", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File terlalu besar", description: "Ukuran maksimal adalah 5MB.", variant: "destructive" });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("fileToUpload", file);

      const response = await fetch("/api/upload/proxy", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal mengunggah gambar ke server.');
      }

      const { url: downloadURL } = await response.json();

      if (!downloadURL) throw new Error('URL unduhan tidak valid.');

      setLocalUserProfile((prev: any) => ({ ...prev, avatarUrl: downloadURL }));

      const userDocRefForWrite = doc(firestore, 'users', user.uid);
      await Promise.all([
        updateDoc(userDocRefForWrite, { avatarUrl: downloadURL }),
        updateProfile(user, { photoURL: downloadURL })
      ]);

      toast({
        title: "Sukses!",
        description: "Gambar profil Anda telah diperbarui.",
      });

    } catch (error: any) {
      console.error("Error during profile picture update:", error);
      toast({
        title: "Gagal Memperbarui Profil",
        description: error.message || "Terjadi kesalahan saat mengunggah gambar.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isLoading = userLoading || profileLoading;

  if (isLoading && !userProfileFromHook) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const profileImage = localUserProfile.avatarUrl || user?.photoURL || `https://avatar.vercel.sh/${user?.uid || 'default'}.png`;

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <Card className="overflow-hidden bg-card/50">
            <div className="relative h-32 bg-primary/10">
              <div
                className="absolute inset-0 bg-repeat bg-center opacity-20"
                style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/circuit-board.png')" }}
              ></div>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-end -mt-20">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="relative cursor-pointer group">
                      <Avatar className="h-28 w-28 border-4 border-background">
                        <AvatarImage src={profileImage} alt={localUserProfile.fullName} />
                        <AvatarFallback>{localUserProfile.fullName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                          <Loader2 className="h-8 w-8 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                      Ganti Gambar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif"
                />

                <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <h1 className="font-headline text-3xl font-bold">{localUserProfile.fullName}</h1>
                    {localUserProfile.institution && institutionLogo[localUserProfile.institution] && (
                      <Image
                        src={institutionLogo[localUserProfile.institution]}
                        alt={`${localUserProfile.institution} Logo`}
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-primary">{localUserProfile.communityEngagement?.status}</p>
                  <p className="text-sm text-muted-foreground">{localUserProfile.major}, {localUserProfile.institution}</p>
                </div>
                <div className="mt-4 md:mt-0 md:ml-auto flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-bold text-xl">{localUserProfile.quickStats.projects}</p>
                    <p className="text-xs text-muted-foreground">Proyek</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xl">{localUserProfile.quickStats.contributions}</p>
                    <p className="text-xs text-muted-foreground">Kontribusi</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xl">#{localUserProfile.quickStats.rank}</p>
                    <p className="text-xs text-muted-foreground">Peringkat</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-xl">Professional Identity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 break-words whitespace-pre-wrap leading-relaxed">{localUserProfile.bio}</p>
                  <div className="flex flex-wrap gap-4">
                    {localUserProfile.links.github && <a href={localUserProfile.links.github} target="_blank" rel="noreferrer"><Github className="h-6 w-6 text-muted-foreground hover:text-primary" /></a>}
                    {localUserProfile.links.linkedin && <a href={localUserProfile.links.linkedin} target="_blank" rel="noreferrer"><Linkedin className="h-6 w-6 text-muted-foreground hover:text-primary" /></a>}
                    {localUserProfile.links.email && <a href={`mailto:${localUserProfile.links.email}`} className="break-all"><Mail className="h-6 w-6 text-muted-foreground hover:text-primary inline mr-1" /> {localUserProfile.links.email}</a>}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-xl">Community Engagement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" />Mentorship</span>
                    <span className="font-semibold">{localUserProfile.communityEngagement.mentorship}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2"><Briefcase className="h-4 w-4" />Workshop</span>
                    <span className="font-semibold">{localUserProfile.communityEngagement.workshopsAttended} Sesi</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2"><Trophy className="h-4 w-4" />Hackathon</span>
                    <span className="font-semibold">{localUserProfile.communityEngagement.hackathonsJoined} Partisipasi</span>
                  </div>
                  {localUserProfile.communityEngagement.badges.length > 0 && (
                    <>
                      <Separator />
                      <h4 className="font-semibold text-sm pt-2">Badges</h4>
                      <div className="space-y-3">
                        {localUserProfile.communityEngagement.badges.map((badge: any) => (
                          <div key={badge.name} className="flex items-center gap-3 text-sm p-2 rounded-md bg-muted/50">
                            {badgeIcons[badge.name] || <Star className="h-5 w-5 text-yellow-500" />}
                            <span className="font-medium">{badge.name}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-xl">Technical Spectrum</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {localUserProfile.technicalSkills.languages.map((lang: any) => (
                      <div key={lang.name}>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium flex items-center gap-2"><Code className="h-4 w-4 text-primary" />{lang.name}</p>
                          <p className="text-xs text-muted-foreground">{lang.proficiency}%</p>
                        </div>
                        <Progress value={lang.proficiency} className="h-2" />
                      </div>
                    ))}
                  </div>
                  <Separator className="my-6" />
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Spesialisasi</h4>
                    <div className="flex flex-wrap gap-2">
                      {localUserProfile.technicalSkills.specializations.map((spec: string) => (
                        <Badge key={spec} variant="secondary">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                  <Separator className="my-6" />
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Sertifikasi</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {localUserProfile.technicalSkills.certifications.map((cert: string) => (
                        <li key={cert}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-xl">Innovation Track Record</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {localUserProfile.projectContributions.map((project: any) => (
                    <div key={project.name} className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-semibold">{project.name}</p>
                          {project.isCollaborative && (
                            <div className="flex items-center gap-1">
                              <ImageWithSkeleton src={institutionLogo['Telkom University']} alt="Telkom University" width={16} height={16} />
                              <ImageWithSkeleton src={institutionLogo['Universitas Mercu Buana']} alt="Universitas Mercu Buana" width={16} height={16} />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{project.role}</p>
                      </div>
                      <Badge variant={project.status === 'Completed' ? 'default' : 'outline'}>
                        {project.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
