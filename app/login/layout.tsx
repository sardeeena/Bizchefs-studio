import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Login',
  description:
    'Sign in to your BizChefs Studio workspace to manage websites, domains, hosting, deployments, and connected services.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://studio.bizchefs.com/login',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
