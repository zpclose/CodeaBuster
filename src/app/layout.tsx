import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { DynamicFirebaseProvider } from '@/firebase/dynamic-provider';
import { DynamicThemeProvider } from '@/components/DynamicThemeProvider';
import { CookieConsentBanner } from '@/components/ui/cookie-consent';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.codebustersconnect.com'),

  title: {
    default: 'Codebusters | Komunitas Teknologi Mahasiswa',
    template: '%s | Codebusters',
  },

  description:
    'Komunitas teknologi mahasiswa untuk belajar coding, membangun project, dan networking di bidang teknologi.',

  keywords: [
    'komunitas teknologi mahasiswa',
    'komunitas programmer',
    'belajar coding gratis',
    'komunitas mahasiswa teknologi',
    'codebusters'
  ],

  authors: [{ name: 'Codebusters Community' }],
  creator: 'Codebusters',

  robots: {
    index: true,
    follow: true,
  },

  verification: {
    google: 'yMC8fm8ExW5XEoG5rbPdRzpC1LXgvYx9WJvG_teEmyQ',
  },

  openGraph: {
    title: 'Codebusters | Komunitas Teknologi Mahasiswa',
    description:
      'Komunitas teknologi mahasiswa untuk belajar coding dan teknologi.',
    url: 'https://www.codebustersconnect.com',
    siteName: 'Codebusters',
    type: 'website',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Codebusters - Komunitas Teknologi Mahasiswa',
      },
    ],
  },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Poppins:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <DynamicFirebaseProvider>
          <DynamicThemeProvider>
            {children}
            <CookieConsentBanner />
            <Toaster />
          </DynamicThemeProvider>
        </DynamicFirebaseProvider>
      </body>
    </html>
  );
  }
