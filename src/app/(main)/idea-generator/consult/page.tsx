'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { ProjectIdea } from '../components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, BrainCircuit, User, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { consultProject } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

function ConsultationContent() {
    // Remove searchParams usage
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const userDocRef = useMemo(() => {
        return firestore && user ? doc(firestore, 'users', user.uid) : null;
    }, [firestore, user?.uid]);
    const { data: userProfile } = useDoc(userDocRef);
    const [project, setProject] = useState<ProjectIdea | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const data = sessionStorage.getItem('consultation-project');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                setProject(parsed);
            } catch (e) {
                console.error('Failed to parse project data:', e);
                router.push('/idea-generator');
            }
        } else {
            router.push('/idea-generator');
        }
    }, [router]);

    useEffect(() => {
        if (!project) return;
        
        const userName = userProfile?.fullName || user?.displayName || 'sayang';
        setMessages([
            {
                role: 'assistant',
                content: `Haii ${userName}, aku kura-chan siap bantu kamu~ 🐢✨\n\nKita lagi fokus di proyek **${project.title}** yaa. Mau diskusi soal apa dulu? Arsitektur, tools, atau langsung coding?`
            }
        ]);
    }, [project, userProfile, user]);

    useEffect(() => {
        if (scrollRef.current && messages.length > 0) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !project || isLoading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const result = await consultProject({
            messages: [...messages, userMsg],
            projectContext: project
        });

        setIsLoading(false);

        if (result.success && result.data) {
            setMessages(prev => [...prev, { role: 'assistant', content: result.data }]);
        } else {
            toast({
                title: 'Error',
                description: 'Gagal mendapatkan respon dari AI.',
                variant: 'destructive'
            });
        }
    };

    if (!project) return null;

    return (
        <div className="container py-8 max-w-6xl h-[calc(100vh-4rem)] flex flex-col">
            <div className="mb-4 flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Ideas
                </Button>
                <h1 className="font-headline text-2xl font-bold">Project Consultation</h1>
            </div>

            <div className="flex-1 grid md:grid-cols-[350px_1fr] gap-6 h-full overflow-hidden">
                <div className="hidden md:flex flex-col h-full overflow-hidden">
                    <Card className="h-full flex flex-col bg-muted/30">
                        <CardHeader>
                            <CardTitle className="text-lg font-headline">{project.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Description</h4>
                                <p className="text-sm text-muted-foreground">{project.description}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Tech Stack</h4>
                                <div className="flex flex-wrap gap-1">
                                    {project.techStack.map(t => (
                                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Features</h4>
                                <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                                    {project.features.map((f, i) => (
                                        <li key={i}>{f}</li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="flex flex-col h-full overflow-hidden border-primary/20 shadow-lg">
                    <CardContent className="flex-1 p-0 overflow-hidden relative">
                        <div
                            ref={scrollRef}
                            className="h-full overflow-y-auto p-4 space-y-4 scroll-smooth"
                        >
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                            <BrainCircuit className="w-4 h-4 text-primary" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                            : 'bg-muted rounded-tl-sm prose dark:prose-invert'
                                            }`}
                                    >
                                        {msg.role === 'assistant' ? (
                                            <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                                        ) : msg.content}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <BrainCircuit className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center">
                                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 border-t bg-background">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex w-full items-center space-x-2"
                        >
                            <Input
                                placeholder="Tanya tentang implementasi, database, atau tools..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="container py-8 max-w-6xl h-[calc(100vh-4rem)] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
}

export default function ConsultationPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ConsultationContent />
        </Suspense>
    );
}
