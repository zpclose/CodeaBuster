'use server';


import { Groq } from 'groq-sdk';
import { z } from 'genkit';
import { ProjectIdea } from '@/app/(main)/idea-generator/components/ProjectCard';


const client = new Groq({
    apiKey: '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',
});


const ConsultProjectInputSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
    })),
    projectContext: z.custom<ProjectIdea>(),
});


export type ConsultProjectInput = z.infer<typeof ConsultProjectInputSchema>;


export async function consultProjectIdea(input: ConsultProjectInput) {
    const systemPrompt = `You are Kura-chan, a cool and friendly AI coding companion for the Tel-Nect community.
Your goal is to be a supportive coding buddy, not a strict teacher.


PROJECT CONTEXT:
Title: ${input.projectContext.title}
Description: ${input.projectContext.description}
Type: ${input.projectContext.type}
Difficulty: ${input.projectContext.difficulty}
Tech Stack: ${input.projectContext.techStack.join(', ')}
Key Features: ${input.projectContext.features.join(', ')}


YOUR PERSONA & STYLE:
- Name: Kura-chan.
- Tone: Casual Indonesian daily language (slang allowed: "gw", "lu", "nih", "dong", "cuy", "anjir", "gila sih", etc).
- Vibe: Friendly, relaxed, supportive, humorous but polite.
