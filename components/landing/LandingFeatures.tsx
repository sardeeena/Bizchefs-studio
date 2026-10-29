'use client';

import React from 'react';
import {
  FolderKanban,
  Network,
  Rocket,
  BarChart3,
  ShieldCheck,
  Cpu,
  ArrowRight,
} from 'lucide-react';

const FEATURES = [
  {
    icon: FolderKanban,
    title: 'Project Management',
    description:
      'Keep your digital projects, milestones, deliverables, and team tasks organized in one unified workspace with real-time status tracking.',
    tag: 'Workflow',
  },
  {
    icon: Network,
    title: 'Domains & Hosting',
    description:
      'Access your domain records, auto-renewal schedules, DNS zones, and Hostinger cloud hosting infrastructure in one centralized control panel.',
    tag: 'Infrastructure',
  },
  {
    icon: Rocket,
    title: 'Deployments & Pipelines',
    description:
      'Manage supported deployment workflows, trigger production builds, and monitor deployment logs and server runtime health.',
    tag: 'DevOps',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Integrations',
    description:
      'Connect supported services including Google Analytics 4 and Google Search Console to monitor verified organic traffic and performance.',
    tag: 'Insights',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Client Workspace',
    description:
      'Access resources authorized for your account with strict multi-role RBAC (Superadmin, Admin, Tech, and Owner) and tenant isolation.',
    tag: 'Security',
  },
  {
    icon: Cpu,
    title: 'Centralized Management & Care',
    description:
      'Direct access to BizChefs maintenance plans, prioritized support tickets, and service requests without juggling disconnected tools.',
    tag: 'Operations',
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-20 sm:py-28 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-[#0e1117]/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D39E36]" />
            <span>Capabilities & Tools</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Built for Modern Digital Operations
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Every feature in BizChefs Studio is designed to consolidate your technology operations into a single, high-reliability command center.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-[#D39E36] flex items-center justify-center transition-colors group-hover:scale-105">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400 tracking-wider uppercase">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
