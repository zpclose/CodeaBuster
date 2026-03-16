'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getProjectIdeas } from '../actions';
import ProjectCard, { type ProjectIdea } from './ProjectCard';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  skills: z.string().min(1, 'Keahlian tidak boleh kosong.'),
  interests: z.string().min(1, 'Minat tidak boleh kosong.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function IdeaGeneratorForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<ProjectIdea[] | null>(null);
  const { toast } = useToast();

  const [isLoaded, setIsLoaded] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skills: '',
      interests: '',
    },
  });

  const skills = form.watch('skills');
  const interests = form.watch('interests');

  // Load from session storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('idea-generator-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.ideas) setIdeas(parsed.ideas);
        if (parsed.skills) form.setValue('skills', parsed.skills);
        if (parsed.interests) form.setValue('interests', parsed.interests);
      } catch (e) {
        console.error('Failed to parse saved ideas', e);
      }
    }
    setIsLoaded(true);
  }, [form]);

  // Save to session storage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;

    const data = {
      ideas,
      skills,
      interests
    };
    sessionStorage.setItem('idea-generator-data', JSON.stringify(data));
  }, [ideas, skills, interests, isLoaded]);

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setIdeas(null);

    try {
      const result = await getProjectIdeas(values);
      if (result.success && result.data) {
        // Validate and normalize data
        const validIdeas = (result.data as ProjectIdea[]).filter(
          idea => idea && idea.title && idea.description && Array.isArray(idea.techStack) && Array.isArray(idea.features)
        );
        if (validIdeas.length > 0) {
          setIdeas(validIdeas);
        } else {
          toast({
            title: 'Error',
            description: 'AI response invalid. Please try again.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to generate ideas.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to communicate with AI.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-12">
      <Card className="border-t-4 border-t-primary shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">Mulai Generasi Ide</CardTitle>
          <CardDescription className="text-base max-w-lg mx-auto">
            Masukkan skill teknis dan bidang minat Anda di bawah ini, dan biarkan AI merancang konsep proyek yang sempurna untuk portofolio Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Skill Teknis</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. React, Python, TensorFlow..." {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Minat Area</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. HealthTech, Finance, Education..." {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="w-full md:w-auto min-w-[200px] text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sedang Meracik Ide...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Project Ideas
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="grid md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64 bg-muted/50 border-dashed" />
          ))}
        </div>
      )}

      {ideas && (
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-px bg-border flex-1" />
            <h2 className="text-2xl font-headline font-bold text-center">Hasil untuk Anda</h2>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {ideas.map((idea, index) => (
              <ProjectCard key={index} idea={idea} index={index} />
            ))}
          </div>

          <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
            <AlertCircle className="h-4 w-4 stroke-current" />
            <AlertTitle>Tips Proyek</AlertTitle>
            <AlertDescription>
              Pilih satu ide yang paling menantang namun realistis untuk skill Anda saat ini. Jangan ragu untuk memodifikasi fitur sesuai kebutuhan.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
