'use server';

import { Resend } from 'resend';
import { EmailTemplate } from '@/components/email-template';

// Menggunakan API Key yang disediakan user
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

/**
 * Server Action untuk notifikasi keamanan (perubahan email)
 */
export async function sendSecurityNotification(oldEmail: string, newEmail: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Tel-Nect Security <onboarding@resend.dev>',
      to: [oldEmail],
      subject: `[SECURITY] Permintaan Perubahan Email Akun`,
      react: EmailTemplate({ 
        firstName: 'User', 
        message: `Kami mendeteksi permintaan untuk mengubah alamat email akun Tel-Nect Anda dari ${oldEmail} menjadi ${newEmail}. Jika Anda merasa tidak melakukan permintaan ini, segera amankan akun Anda melalui dashboard pengaturan keamanan.`,
        type: 'security'
      }),
    });

    if (error) {
      console.error('Resend Security Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('Security Email Error:', err);
    return { success: false };
  }
}
