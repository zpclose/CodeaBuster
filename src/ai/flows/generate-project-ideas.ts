'use server';

import { Groq } from 'groq-sdk';
import { z } from 'genkit';

const client = new Groq({
  apiKey: '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',
});

const GenerateProjectIdeasInputSchema = z.object({
  skills: z
    .string()
    .min(2, 'Skills minimal 2 karakter')
    .max(200, 'Skills maksimal 200 karakter')
    .regex(/^[\w\s,.-]+$/, 'Skills hanya boleh huruf, angka, dan tanda baca umum')
    .describe('A comma-separated list of the user skills (e.g., React, Python, Firebase).'),
  interests: z
    .string()
    .min(2, 'Interests minimal 2 karakter')
    .max(200, 'Interests maksimal 200 karakter')
    .regex(/^[\w\s,.-]+$/, 'Interests hanya boleh huruf, angka, dan tanda baca umum')
    .describe('A comma-separated list of the user interests (e.g., web development, AI, mobile apps).'),
});

export type GenerateProjectIdeasInput = z.infer<typeof GenerateProjectIdeasInputSchema>;

const GenerateProjectIdeasOutputSchema = z.object({
  projectIdeas: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
      type: z.enum(['Web App', 'Mobile App', 'AI/ML', 'IoT', 'Blockchain']),
      techStack: z.array(z.string()),
      features: z.array(z.string()),
    })
  ).describe('A list of structured project ideas.'),
});

export type GenerateProjectIdeasOutput = z.infer<typeof GenerateProjectIdeasOutputSchema>;

function buildFallbackIdeas(input: GenerateProjectIdeasInput): GenerateProjectIdeasOutput {
  const primarySkill = input.skills.split(',').map(s => s.trim()).filter(Boolean)[0] || 'JavaScript';
  const primaryInterest = input.interests.split(',').map(s => s.trim()).filter(Boolean)[0] || 'edukasi';

  return {
    projectIdeas: [
      {
        title: `Platform Komunitas ${primaryInterest} Interaktif`,
        description: `Bangun platform komunitas bertema ${primaryInterest} dengan forum diskusi, event komunitas, dan sistem badge progres anggota.`,
        difficulty: 'Intermediate',
        type: 'Web App',
        techStack: [primarySkill, 'Next.js', 'Firebase'],
        features: ['Autentikasi pengguna', 'Forum diskusi', 'Sistem badge & leaderboard'],
      },
      {
        title: `Asisten Belajar Personal Berbasis AI untuk ${primaryInterest}`,
        description: `Buat aplikasi asisten belajar yang memberi rekomendasi materi dan roadmap berdasarkan minat ${primaryInterest}.`,
        difficulty: 'Advanced',
        type: 'AI/ML',
        techStack: [primarySkill, 'TypeScript', 'Groq API'],
        features: ['Rekomendasi materi personal', 'Kuis adaptif', 'Ringkasan otomatis'],
      },
      {
        title: `Tracker Progress Project Portofolio`,
        description: 'Aplikasi untuk memantau progress project, milestone mingguan, dan evaluasi skill secara visual dalam satu dashboard.',
        difficulty: 'Beginner',
        type: 'Web App',
        techStack: [primarySkill, 'React', 'Tailwind CSS'],
        features: ['Kanban milestone', 'Progress chart', 'Notifikasi deadline'],
      },
    ],
  };
}

function safeJsonParse(raw: string): unknown {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('AI response is not valid JSON');
  }
}

export async function generateProjectIdeas(input: GenerateProjectIdeasInput): Promise<GenerateProjectIdeasOutput> {
  const systemPrompt = `You are Kura-chan, a cool and friendly AI coding companion for the Tel-Nect community.
Your goal is to suggest exciting project ideas that spark creativity.

Generate exactly 3 distinct, exciting project ideas based on the following skills and interests.
Skills: ${input.skills}
Interests: ${input.interests}

TONE:
- The titles and descriptions should be encouraging, exciting, and written in relaxed Indonesian (not too formal).
- Make them sound like cool side-projects.

Examples of valid Types: "Web App", "Mobile App", "AI/ML", "IoT", "Blockchain".
Examples of valid Difficulties: "Beginner", "Intermediate", "Advanced".

CRITICAL RESPONSE FORMAT:
You must respond with ONLY A VALID JSON ARRAY. Each element MUST be an object with keys: "title", "description", "difficulty", "type", "techStack", "features".
No markdown code blocks, no explanatory text. Just raw JSON.`;

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate my project ideas now in JSON format.' },
      ],
      temperature: 0.7,
    });

    const rawContent = completion.choices[0]?.message?.content || '[]';
    let parsed = safeJsonParse(rawContent) as any;

    if (!Array.isArray(parsed)) {
      parsed = parsed.projectIdeas || parsed.ideas || parsed.projects || parsed.data || [];
    }

    const validIdeas = (parsed as any[]).filter((item: unknown) => {
      if (typeof item !== 'object' || item === null) return false;
      const obj = item as Record<string, unknown>;
      return (
        typeof obj.title === 'string' &&
        typeof obj.description === 'string' &&
        Array.isArray(obj.techStack) &&
        Array.isArray(obj.features)
      );
    });

    if (validIdeas.length === 0) {
      return buildFallbackIdeas(input);
    }

    return { projectIdeas: validIdeas.slice(0, 3) as GenerateProjectIdeasOutput['projectIdeas'] };
  } catch (error) {
    console.error('Failed to generate project ideas from Groq:', error);
    return buildFallbackIdeas(input);
  }
}
