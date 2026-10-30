import type { Metadata } from 'next';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks';
import { LandingCta } from '@/components/landing/LandingCta';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata: Metadata = {
  title: 'BizChefs Studio — Your Business. One Powerful Studio.',
  description:
    'Welcome to BizChefs Studio — your central workspace for managing your digital business. Access your projects, domains, hosting, deployments, and connected services through one secure platform.',
  alternates: {
    canonical: 'https://studio.bizchefs.com',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'BizChefs Studio — Your Business. One Powerful Studio.',
    description:
      'Welcome to BizChefs Studio — your central workspace for managing your digital business. Access your projects, domains, hosting, deployments, and connected services through one secure platform.',
    url: 'https://studio.bizchefs.com',
    siteName: 'BizChefs Studio',
    type: 'website',
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
    title: 'BizChefs Studio — Your Business. One Powerful Studio.',
    description:
      'Welcome to BizChefs Studio — your central workspace for managing your digital business. Access your projects, domains, hosting, deployments, and connected services through one secure platform.',
    images: ['/BizChefs-logo.png'],
  },
};

export default function LandingPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'BizChefs Studio',
    url: 'https://studio.bizchefs.com',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    description:
      'Central digital workspace for BizChefs clients to manage websites, domains, Hostinger hosting, deployments, analytics, and connected services.',
    provider: {
      '@type': 'Organization',
      name: 'BizChefs',
      url: 'https://bizchefs.com',
      logo: 'https://studio.bizchefs.com/BizChefs-logo.png',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Support',
        url: 'https://bizchefs.com/contact',
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#0c0e12] text-[#171717] dark:text-[#f3f4f6] selection:bg-[#171717] selection:text-white dark:selection:bg-white dark:selection:text-[#0c0e12]">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Header */}
      <LandingHeader />

      {/* Main Content */}
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingCta />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
