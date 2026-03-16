'use server';

import { generateProjectIdeas, type GenerateProjectIdeasInput, type GenerateProjectIdeasOutput } from '@/ai/flows/generate-project-ideas';

export async function getProjectIdeas(input: GenerateProjectIdeasInput) {
  try {
    const result = await generateProjectIdeas(input);
    return { success: true, data: result.projectIdeas };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Gagal menghasilkan ide proyek. Coba lagi nanti.' };
  }
}
