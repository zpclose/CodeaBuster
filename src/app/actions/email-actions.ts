'use server';

import { Resend } from 'resend';
import { EmailTemplate } from '@/components/email-template';

const resend = new Resend('re_DAruRrXN_DW338bm2YLCKAcjUUBB5DQzP');

/**
 * Server Action untuk mengirim konfirmasi proposal
 */
export async function sendProposalConfirmation(to: string, projectName: string, userName: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Tel-Nect Forge <onboarding@resend.dev>',
      to: [to],
      subject: `[PROPOSAL RECEIVED] ${projectName}`,
      react: EmailTemplate({ 
        firstName: userName, 
        message: `Kami telah menerima proposal proyek Anda: "${projectName}". Tim kurasi kami akan segera meninjau detail teknis dan potensi dampak inovasi dari proposal ini. Mohon tunggu kabar selanjutnya dalam 2-3 minggu.`,
        type: 'proposal'
      }),
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('Email Server Error:', err);
    return { success: false, error: 'Terjadi kesalahan sistem saat mengirim email.' };
  }
}
