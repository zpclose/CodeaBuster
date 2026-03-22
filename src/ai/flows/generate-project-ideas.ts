'use server';


import { Groq } from 'groq-sdk';
import { z } from 'genkit';


const client = new Groq({
  apiKey: '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',
});


const GenerateProjectIdeasInputSchema = z.object({
  skills: z
    .string()
    .min(2, "Skills minimal 2 karakter")
    .max(200, "Skills maksimal 200 karakter")
    .regex(/^[\w\s,.-]+$/, "Skills hanya boleh huruf, angka, dan tanda baca umum")
    .describe('A comma-separated list of the user skills (e.g., React, Python, Firebase).'),
  interests: z
    .string()
    .min(2, "Interests minimal 2 karakter")
    .max(200, "Interests maksimal 200 karakter")
    .regex(/^[\w\s,.-]+$/, "Interests hanya boleh huruf, angka, dan tanda baca umum")
    .describe('A comma-separated list of the user interests (e.g., web development, AI, mobile apps).'),
});


export type GenerateProjectIdeasInput = z.infer<typeof GenerateProjectIdeasInputSchema>;


const GenerateProjectIdeasOutputSchema = z.object({
  projectIdeas: z.array(z.object({
    title: z.string(),
    description: z.string(),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    type: z.enum(['Web App', 'Mobile App', 'AI/ML', 'IoT', 'Blockchain']),
    techStack: z.array(z.string()),
    features: z.array(z.string())
  })).describe('A list of structured project ideas.'),
});
