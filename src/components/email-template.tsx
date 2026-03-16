import * as React from 'react';

interface EmailTemplateProps {
  firstName: string;
  message?: string;
  type?: 'proposal' | 'security';
}

export function EmailTemplate({ firstName, message, type }: EmailTemplateProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333', border: '1px solid #eee', borderRadius: '8px' }}>
      <h1 style={{ color: type === 'security' ? '#ef4444' : '#9b111e', borderBottom: '2px solid' }}>
        {type === 'security' ? 'Security Protocol Alert' : 'Tel-Nect Notification'}
      </h1>
      <p style={{ fontSize: '16px' }}>Hello <strong>{firstName}</strong>,</p>
      <p style={{ lineHeight: '1.6', fontSize: '14px' }}>
        {message || 'Kami memiliki pembaruan penting untuk akun Anda di platform Tel-Nect.'}
      </p>
      <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee', fontSize: '12px', color: '#888' }}>
        <p>Ini adalah pesan otomatis dari sistem Tel-Nect.</p>
        <p>&copy; {new Date().getFullYear()} Codebusters Community</p>
      </div>
    </div>
  );
}
