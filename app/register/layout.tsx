import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register Client Workspace',
  description:
    'Create a new BizChefs Studio client workspace for your organization.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://studio.bizchefs.com/register',
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
