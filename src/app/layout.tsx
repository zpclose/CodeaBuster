import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { DynamicFirebaseProvider } from '@/firebase/dynamic-provider';
import { DynamicThemeProvider } from '@/components/DynamicThemeProvider';


export const metadata: Metadata = {
  metadataBase: new URL('https://codebusters.dev'),

  title: {
    default: 'Komunitas Coding Indonesia - Codebusters',
    template: '%s | Codebusters',
  },

  description:
    'Komunitas developer Indonesia untuk belajar coding, membangun project, dan networking teknologi.',

  keywords: [
    'komunitas coding indonesia',
    'komunitas programmer',
    'belajar coding gratis',
    'developer community indonesia',
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
    title: 'Komunitas Coding Indonesia - Codebusters',
    description:
      'Komunitas developer Indonesia untuk belajar coding dan teknologi.',
    url: 'https://codebusters.dev',
    siteName: 'Codebusters',
    type: 'website',
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
