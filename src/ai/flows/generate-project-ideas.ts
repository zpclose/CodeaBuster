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

export type GenerateProjectIdeasOutput = z.infer<typeof GenerateProjectIdeasOutputSchema>;

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
No markdown code blocks, no explanatory text. Just raw JSON.

Example format:
[
  {
    "title": "Project Name",
    "description": "Description in Indonesian",
    "difficulty": "Intermediate",
    "type": "Web App",
    "techStack": ["React", "Firebase"],
    "features": ["Feature 1", "Feature 2", "Feature 3"]
  }
]`;

  const completion = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Generate my project ideas now.' },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" }
  });

  try {
    const rawContent = completion.choices[0]?.message?.content || '[]';
    let parsed = JSON.parse(rawContent);

    if (!Array.isArray(parsed)) {
      parsed = parsed.projectIdeas || parsed.ideas || parsed.projects || [];
    }

    // Ensure each item is an object with required fields
    const validIdeas = parsed.filter((item: unknown) => {
      if (typeof item !== 'object' || item === null) return false;
      const obj = item as Record<string, unknown>;
      return (
        typeof obj.title === 'string' &&
        typeof obj.description === 'string' &&
        Array.isArray(obj.techStack) &&
        Array.isArray(obj.features)
      );
    });

    return { projectIdeas: validIdeas };
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return { projectIdeas: [] };
  }
}
