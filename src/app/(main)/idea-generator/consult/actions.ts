'use server';

import { consultProjectIdea, type ConsultProjectInput } from '@/ai/flows/consult-project';

export async function consultProject(input: ConsultProjectInput) {
    try {
        const response = await consultProjectIdea(input);
        return { success: true, data: response };
    } catch (error) {
        console.error('Consultation Error:', error);
        return { success: false, error: 'Gagal terhubung dengan konsultan AI.' };
    }
}
