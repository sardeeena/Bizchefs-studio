'use client';

import React from 'react';
import {
  Globe,
  Network,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  Server,
  ArrowUpRight,
  BarChart3,
  GitBranch,
} from 'lucide-react';

export function LandingDashboardPreview() {
  return (
    <div className="relative mx-auto max-w-5xl rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#11151e] shadow-2xl overflow-hidden transition-all">
      {/* Studio Header Mock Bar */}
      <div className="h-11 px-4 bg-neutral-100/90 dark:bg-[#151922] border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          </div>
          <span className="text-neutral-400 mx-1">·</span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            BizChefs Studio Workspace
          </span>
          <span className="text-neutral-400">/</span>
          <span className="text-neutral-500">Live Client Dashboard</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Systems Operational
          </span>
        </div>
      </div>

      {/* Preview Content Grid */}
      <div className="p-5 sm:p-6 lg:p-7 space-y-6">
        {/* Top Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#161b26] border border-neutral-200/70 dark:border-neutral-800/80">
            <div className="flex items-center justify-between text-neutral-500 text-[11px] mb-1">
              <span>Managed Websites</span>
              <Globe className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-white">Active</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Custom Next.js & Node.js</div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#161b26] border border-neutral-200/70 dark:border-neutral-800/80">
            <div className="flex items-center justify-between text-neutral-500 text-[11px] mb-1">
              <span>Hostinger Cloud</span>
              <Server className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-white">99.98%</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">High Availability</div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#161b26] border border-neutral-200/70 dark:border-neutral-800/80">
            <div className="flex items-center justify-between text-neutral-500 text-[11px] mb-1">
              <span>Domains & SSL</span>
              <Network className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-white">Protected</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Auto-Renewal & DNS</div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#161b26] border border-neutral-200/70 dark:border-neutral-800/80">
            <div className="flex items-center justify-between text-neutral-500 text-[11px] mb-1">
              <span>Access Clearance</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-white">4 Roles</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Strict Tenant Isolation</div>
          </div>
        </div>

        {/* 2-Column Split: Website & Pipeline on Left, Integrations & DNS on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left 2 Cols: Production Website & Deployment */}
          <div className="lg:col-span-2 space-y-4">
            {/* Website Card */}
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#151922]/50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900 dark:text-white text-sm">
                        Client Production Website
                      </span>
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Live
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 font-mono mt-0.5">
                      Production Cluster · Hostinger Cloud
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-neutral-500 block">Care Plan</span>
                  <span className="text-xs font-semibold text-[#D39E36]">Active Care</span>
                </div>
              </div>

              {/* Deployment Details */}
              <div className="mt-4 pt-3.5 border-t border-neutral-200/60 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-neutral-500">
                  <GitBranch className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="font-mono text-neutral-700 dark:text-neutral-300">main</span>
                  <span>·</span>
                  <span className="truncate max-w-[200px]">Production release build verified</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Built in 42s
                  </span>
                </div>
              </div>
            </div>

            {/* Pipeline Status */}
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#151922]/50">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Rocket className="w-3.5 h-3.5 text-[#D39E36]" />
                  Automated Deployment Pipeline
                </span>
                <span className="text-[11px] text-neutral-400">Git Integration Ready</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-white dark:bg-[#181d27] border border-neutral-200/60 dark:border-neutral-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400">v2.4.1</span>
                    <span className="text-neutral-800 dark:text-neutral-200 truncate">Core system dependencies update & security audit</span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 shrink-0">Success</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Integrations & Services */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#151922]/50">
              <span className="text-xs font-semibold text-neutral-900 dark:text-white block mb-3">
                Google Integrations
              </span>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#181d27] border border-neutral-200/60 dark:border-neutral-800">
                  <span className="text-neutral-700 dark:text-neutral-300">Google Analytics 4</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Data API
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#181d27] border border-neutral-200/60 dark:border-neutral-800">
                  <span className="text-neutral-700 dark:text-neutral-300">Search Console</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Organic Insights
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#151922]/50">
              <span className="text-xs font-semibold text-neutral-900 dark:text-white block mb-2">
                Domain & DNS Status
              </span>
              <div className="text-xs text-neutral-500 space-y-1">
                <div className="flex justify-between">
                  <span>Nameservers</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300">Hostinger Premium</span>
                </div>
                <div className="flex justify-between">
                  <span>SSL Certificate</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Active (Let&apos;s Encrypt)</span>
                </div>
                <div className="flex justify-between">
                  <span>DNS Zone</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300">Configured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
