'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Authentication failed. Please verify your credentials.');
        setLoading(false);
        return;
      }

      if (data.user) {
        setCurrentUser({
          id: data.user.id,
          name: data.user.name || email.split('@')[0],
          email: data.user.email,
          role: data.user.role || 'owner',
          avatarUrl: data.user.avatarUrl,
          createdAt: data.user.createdAt || new Date().toISOString(),
        });
        router.push('/dashboard');
      }
    } catch {
      setErrorMessage('Network connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 bg-[#fafafa] dark:bg-[#0c0e12]">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-block group focus-visible:outline-2 focus-visible:outline-blue-600 rounded-xl" aria-label="Return to BizChefs Studio home">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white dark:bg-[#151921] border border-neutral-200 dark:border-neutral-800 shadow-sm p-1.5 mb-3 group-hover:border-neutral-300 dark:group-hover:border-neutral-700 transition-colors">
              <Image
                src="/BizChefs-emblem-transparent.png"
                alt="BizChefs"
                width={36}
                height={36}
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src="/BizChefs-emblem-dark.png"
                alt="BizChefs"
                width={36}
                height={36}
                className="object-contain hidden dark:block"
                priority
              />
            </div>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            <span>Biz</span>
            <span className="text-[#D39E36]">Chefs</span> Studio
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Production Client Portal & Digital Infrastructure Management
          </p>
        </div>

        {/* Login Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-[#D39E36] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 text-center">
            <p className="text-xs text-neutral-500">
              New client organization?{' '}
              <Link
                href="/register"
                className="text-[#D39E36] font-semibold hover:underline"
              >
                Register client workspace
              </Link>
            </p>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Protected by BizChefs Tenant Isolation, Supabase Auth & TLS 1.3</span>
        </div>
      </div>
    </div>
  );
}
