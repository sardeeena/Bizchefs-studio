'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Lock } from 'lucide-react';

export function LandingCta() {
  return (
    <section className="py-20 sm:py-24 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-900 text-white relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#D39E36]/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-neutral-400">
          <Lock className="w-3.5 h-3.5 text-[#D39E36]" />
          <span>Enterprise-Grade Client Security</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
          Ready to Bring Your Digital Business Together?
        </h2>

        <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          Create your BizChefs Studio account and access your digital workspace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold bg-[#D39E36] text-neutral-950 hover:bg-[#c28f2e] transition-all shadow-lg focus-visible:outline-2 focus-visible:outline-white"
          >
            <span>Create Your Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold bg-neutral-800/80 text-white hover:bg-neutral-700/80 border border-neutral-700 transition-colors focus-visible:outline-2 focus-visible:outline-white"
          >
            <span>Already Have an Account? Login</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
