import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { DynamicFirebaseProvider } from '@/firebase/dynamic-provider';
import { DynamicThemeProvider } from '@/components/DynamicThemeProvider';


export const metadata: Metadata = {
  metadataBase: new URL('https://codebusters.dev'),

  title: {
    default: 'CodeBusters | Komunitas Teknologi Mahasiswa & Belajar Coding Gratis',
    template: '%s | CodeBusters',
  },

  description:
    'CodeBusters adalah komunitas teknologi mahasiswa untuk belajar coding gratis, kolaborasi project, dan networking talenta digital dari Telkom University & Universitas Mercu Buana.',

  keywords: [
    'codebusters',
    'komunitas teknologi mahasiswa',
    'komunitas programmer',
    'belajar coding gratis',
    'komunitas mahasiswa teknologi',
    'komunitas coding indonesia',
    'telkom university',
    'universitas mercu buana'
  ],

  authors: [{ name: 'CodeBusters Community' }],
  creator: 'CodeBusters',

  alternates: {
    canonical: '/',
  },

  robots: {
    index: true,
    follow: true,
  },

  verification: {
    google: 'yMC8fm8ExW5XEoG5rbPdRzpC1LXgvYx9WJvG_teEmyQ',
  },

  openGraph: {
    title: 'CodeBusters | Komunitas Teknologi Mahasiswa & Belajar Coding Gratis',
    description:
      'Komunitas teknologi mahasiswa untuk belajar coding gratis, membangun project nyata, dan networking talenta digital.',
    url: 'https://codebusters.dev',
    siteName: 'CodeBusters',
    type: 'website',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'CodeBusters - Komunitas Teknologi Mahasiswa',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'CodeBusters | Komunitas Teknologi Mahasiswa & Belajar Coding Gratis',
    description: 'Komunitas teknologi mahasiswa untuk belajar coding gratis dan kolaborasi project nyata.',
    site: '@codebusters',
    creator: '@codebusters',
    images: ['/api/og'],
  },

  icons: {
    icon: '/favicon.ico',
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
            <Toaster />
          </DynamicThemeProvider>
        </DynamicFirebaseProvider>
      </body>
    </html>
  );
}
