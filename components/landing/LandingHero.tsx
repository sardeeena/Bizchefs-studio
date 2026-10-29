'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { LandingDashboardPreview } from '@/components/landing/LandingDashboardPreview';

export function LandingHero() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.authenticated && data.user) {
            setIsAuthenticated(true);
          }
        }
      } catch {
        // Unauthenticated
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
      {/* Subtle background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#D39E36]/5 dark:bg-[#D39E36]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Section Kicker */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D39E36]" />
            <span>BizChefs Studio Platform</span>
          </div>

          {/* Primary H1 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
            Your Business. <br />
            <span className="text-[#D39E36]">One Powerful Studio.</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Welcome to BizChefs Studio — your central workspace for managing your digital business. Access your projects, domains, hosting, deployments, and connected services through one secure platform.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-[#D39E36] dark:text-neutral-950 dark:hover:bg-[#c28f2e] transition-all shadow-md focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                <span>Open My Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-[#D39E36] dark:text-neutral-950 dark:hover:bg-[#c28f2e] transition-all shadow-md focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50 dark:bg-[#151922] dark:text-neutral-200 dark:border-neutral-700 dark:hover:bg-[#1b202c] transition-colors focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <span>Login to Your Studio</span>
                </Link>
              </>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Hostinger Cloud Infrastructure
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Encrypted Token Vault
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              4-Role Access Control
            </span>
          </div>
        </div>

        {/* Dashboard Preview Graphic */}
        <div className="mt-12 sm:mt-16">
          <LandingDashboardPreview />
        </div>
      </div>
    </section>
  );
}
