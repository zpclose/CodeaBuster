import { Resend } from 'resend';

// Initialize Resend lazily to prevent crash if key is missing
const resendApiKey = process.env.RESEND_API_KEY;

export async function sendLoginAlert({
  email,
  ip,
  country,
  userAgent,
}: {
  email: string;
  ip: string;
  country?: string;
  userAgent: string;
}) {
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY is missing. Email alert skipped.');
    return { success: false, error: 'Missing API Key' };
  }

  const resend = new Resend(resendApiKey);
  try {
    await resend.emails.send({
      from: 'security@your-domain.com', // Change this to verified domain later
      to: email,
      subject: '🚨 Suspicious Login Detected',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #d32f2f;">Suspicious Login Detected</h2>
          <p>We detected access to your Admin Panel from a new or unusual location.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p><strong>IP Address:</strong> ${ip}</p>
            <p><strong>Location:</strong> ${country ?? 'Unknown'}</p>
            <p><strong>Device:</strong> ${userAgent}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <p>If this wasn't you, please change your password immediately and contact support.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send alert email:', error);
    return { success: false, error };
  }
}
