import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AppLayoutClient } from '@/components/layout/AppLayoutClient';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0e12' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://studio.bizchefs.com'),
  title: {
    default: 'BizChefs Studio — Client Portal',
    template: '%s | BizChefs Studio',
  },
  robots: {
    index: false,
    follow: false,
  },
  description:
    'Production-grade client portal for BizChefs digital and technology clients. Manage custom websites, domains, Hostinger hosting, deployments, Google Analytics 4, Search Console, files, and support.',
  openGraph: {
    title: 'BizChefs Studio — Client Portal',
    description:
      'Production-grade client portal for BizChefs digital and technology clients. Manage custom websites, domains, Hostinger hosting, deployments, Google Analytics 4, Search Console, files, and support.',
    url: 'https://studio.bizchefs.com',
    type: 'website',
    siteName: 'BizChefs Studio',
    images: [
      {
        url: '/BizChefs-logo.png',
        width: 1254,
        height: 1254,
        alt: 'BizChefs Studio — Client Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BizChefs Studio — Client Portal',
    description:
      'Production-grade client portal for BizChefs digital and technology clients. Manage custom websites, domains, Hostinger hosting, deployments, Google Analytics 4, Search Console, files, and support.',
    images: ['/BizChefs-logo.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '48x48', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen font-sans selection:bg-neutral-950 selection:text-white dark:selection:bg-white dark:selection:text-neutral-950 bg-[#fafafa] dark:bg-[#0c0e12] text-[#171717] dark:text-[#f3f4f6]"
      >
        <ThemeProvider>
          <AppLayoutClient>{children}</AppLayoutClient>
        </ThemeProvider>
      </body>
    </html>
  );
}
