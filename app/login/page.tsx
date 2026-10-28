'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { DEMO_USERS } from '@/lib/data/mock-db';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Look up user or default to Sarah
    const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const targetUser = matched || DEMO_USERS[0];

    setTimeout(() => {
      setCurrentUser(targetUser);
      router.push('/dashboard');
    }, 600);
  };

  const handleQuickDemoLogin = (userId: string) => {
    const user = DEMO_USERS.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 bg-[#fafafa] dark:bg-[#0c0e12]">
      <div className="max-w-md w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white dark:bg-[#151921] border border-neutral-200 dark:border-neutral-800 shadow-sm p-1.5 mb-3">
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

          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            <span>Biz</span>
            <span className="text-[#D39E36]">Chefs</span> Studio
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Official client portal for custom websites, hosting telemetry & digital care.
          </p>
        </div>

        {/* Login Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6">
          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Client Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
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
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
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
              <span>{loading ? 'Authenticating session...' : 'Sign In to Client Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Personas */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block mb-2 text-center">
              One-Click Demo Sandbox Sign-In
            </span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('user_sarah')}
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                    Sarah Mitchell
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    Client Owner · Kemet Tourism & Luxury Expeditions
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  Client View
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('user_omar')}
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                    Omar Mansour
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    Head of Ops · Genuine Egypte Luxury Travel
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                  Client View
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('user_tariq')}
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                    Tariq Al-Chef
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    BizChefs Staff · Principal Systems Architect
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                  Admin View
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Notice */}
        <p className="text-center text-[11px] text-neutral-400">
          Protected by BizChefs Tenant Isolation & TLS 1.3 Encryption.
        </p>
      </div>
    </div>
  );
}
