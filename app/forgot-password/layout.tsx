import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password',
  description:
    'Recover access to your BizChefs Studio client account.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://studio.bizchefs.com/forgot-password',
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
