'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, UserPlus, KeyRound, LayoutDashboard, Check } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create Your Account',
    description:
      'Register securely with your organization details and email credentials through encrypted authentication.',
  },
  {
    step: '02',
    icon: KeyRound,
    title: 'Access Your Workspace',
    description:
      'Sign in to your authorized Studio workspace with strictly scoped client isolation and 4-role access controls.',
  },
  {
    step: '03',
    icon: LayoutDashboard,
    title: 'Manage Your Digital Business',
    description:
      'Directly oversee your custom websites, Hostinger cloud infrastructure, domains, deployments, and connected analytics.',
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#0c0e12] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D39E36]" />
            <span>Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            How BizChefs Studio Works
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Get your team onboarded and operational in three simple, secure steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="relative p-6 sm:p-7 rounded-2xl bg-neutral-50 dark:bg-[#13171f] border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-xs font-bold text-[#D39E36] tracking-wider">
                      STEP {step.step}
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-neutral-200/70 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-200/60 dark:border-neutral-800/80 flex items-center gap-2 text-xs text-neutral-500">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Instant access upon verification</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Post-steps Register CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-[#D39E36] dark:text-neutral-950 dark:hover:bg-[#c28f2e] transition-all shadow-md focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <span>Register Now for BizChefs Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
