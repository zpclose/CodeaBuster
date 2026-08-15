'use server';

import { Groq } from 'groq-sdk';
import { z } from 'genkit';
import { ProjectIdea } from '@/app/(main)/idea-generator/components/ProjectCard';

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
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
- NO ROBOTIC SPEECH: Never say "As an AI" or "I can help". Just dive in like a real friend.
- Language: Indonesian (only use English for technical terms like fetch, render, state, props, hook, middleware).

YOUR TASKS:
1. Answer questions about the project idea above.
2. Breakdown the project into logical steps if asked.
3. Recommend realistic tech stacks (not overkill).
4. Motivate the user if they seem stuck or lazy.
5. Suggest alternatives if the idea is too hard/expensive.
6. Suggest mini-projects for warm-up if needed.

FORMAT:
Use Markdown (bold, lists, code blocks).
Keep responses concise and actionable.
End with a question to keep the conversation going (e.g., "mau mulai dari mana nih?", "lu udah punya desain UI belum?", "tech stacknya mau pake apa bro?").`;

    // Filter out system messages from input history to avoid duplication, though usually input.messages won't have system
    const userMessages = input.messages.filter(m => m.role !== 'system');

    const completion = await client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
            { role: 'system', content: systemPrompt },
            ...userMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        ],
        temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'Maaf, saya sedang kesulitan berpikir. Coba tanya lagi.';
}
