import { motion } from 'framer-motion';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Copy, Layers, BrainCircuit, Smartphone, Globe, Lock, Cpu } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export interface ProjectIdea {
    title: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    type: 'Web App' | 'Mobile App' | 'AI/ML' | 'IoT' | 'Blockchain';
    techStack: string[];
    features: string[];
}

interface ProjectCardProps {
    idea: ProjectIdea;
    index: number;
}

const typeIcons = {
    'Web App': Globe,
    'Mobile App': Smartphone,
    'AI/ML': BrainCircuit,
    'IoT': Cpu,
    'Blockchain': Lock,
};

const difficultyColors = {
    'Beginner': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'Intermediate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Advanced': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

import { useRouter } from 'next/navigation';

export default function ProjectCard({ idea, index }: ProjectCardProps) {
    const [copied, setCopied] = useState(false);
    const TypeIcon = typeIcons[idea.type] || Layers;
    const router = useRouter();

    const handleCopy = () => {
        const text = `Title: ${idea.title}\nDescription: ${idea.description}\nTech Stack: ${idea.techStack.join(', ')}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast({
            title: "Ide Disalin!",
            description: "Detail proyek telah disalin ke clipboard.",
        });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleConsult = () => {
        sessionStorage.setItem('consultation-project', JSON.stringify(idea));
        router.push('/idea-generator/consult');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Card className="h-full flex flex-col hover:border-primary/50 transition-all duration-300">
                <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2">
                            <div className="flex gap-2 flex-wrap">
                                <Badge variant="outline" className={difficultyColors[idea.difficulty]}>
                                    {idea.difficulty}
                                </Badge>
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    <TypeIcon className="w-3 h-3" />
                                    {idea.type}
                                </Badge>
                            </div>
                            <CardTitle className="font-headline text-xl leading-tight">
                                {idea.title}
                            </CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {idea.description}
                    </p>

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-foreground">Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                            {(idea.techStack || []).map((tech) => (
                                <Badge key={tech} variant="outline" className="text-xs">
                                    {tech}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-foreground">Key Features</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            {(idea.features || []).map((feature, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
                <CardFooter className="pt-4 border-t flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-muted-foreground hover:text-primary"
                        onClick={handleCopy}
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Details
                            </>
                        )}
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={handleConsult}
                    >
                        <BrainCircuit className="w-4 h-4 mr-2" />
                        Konsultasi AI
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
