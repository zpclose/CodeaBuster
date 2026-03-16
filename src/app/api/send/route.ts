import { EmailTemplate } from '@/components/email-template';
import { Resend } from 'resend';

const resend = new Resend('re_DAruRrXN_DW338bm2YLCKAcjUUBB5DQzP');

export async function POST() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Tel-Nect <onboarding@resend.dev>',
      to: ['zpclose77@gmail.com'], // Ganti dengan email tujuan Anda
      subject: 'Tel-Nect System Check',
      react: EmailTemplate({ firstName: 'User', message: 'Ini adalah tes pengiriman email via Route Handler.' }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
