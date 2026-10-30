'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  ArrowLeft,
  FileCode,
  ShieldCheck,
  Server,
  Lock,
  ExternalLink,
  FolderTree,
  Terminal,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function WebsiteFilesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const websiteId = resolvedParams.id;
  const { currentUser, clientWebsites } = useApp();

  const website = clientWebsites.find((w) => w.id === websiteId) || clientWebsites[0];

  if (!website) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 shadow-xl my-12">
        <Lock className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          Website Not Found
        </h2>
        <p className="text-xs text-neutral-500 mt-2 mb-6">
          The requested website is not registered under your client workspace.
        </p>
        <Link
          href="/websites"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Websites</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href={`/websites/${website.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {website.name}</span>
        </Link>
      </div>

      {/* Website Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#D39E36] tracking-wider uppercase">
              Hostinger Cloud Filesystem Policy
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <span className="text-xs text-neutral-500">Security Architecture</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Deployment Files & Storage: {website.name}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Production runtime filesystem for domain <strong>{website.domain}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sandboxed & Encrypted</span>
          </div>
        </div>
      </div>

      {/* Real Architecture Guidance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-neutral-500" />
              <span>Production Filesystem Isolation</span>
            </h2>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 space-y-2">
              <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero-Downtime Atomic Symlink Architecture</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Hostinger Node.js application containers enforce strict POSIX user privilege separation. Arbitrary in-browser HTTP file modification is disabled to protect against remote code execution and web root corruption.
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#141822]">
                <Terminal className="w-4 h-4 text-[#D39E36] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-900 dark:text-white block">
                    1. Automated Git CI/CD (Recommended)
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Push changes directly to your connected repository branch. The deployment pipeline builds the Next.js bundle and updates the Hostinger live symlink automatically.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#141822]">
                <Server className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-900 dark:text-white block">
                    2. Secure SFTP / SSH Keyed Access
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    For direct static asset uploading or staging file inspection, connect via authorized SFTP using credentials provisioned in your Hostinger hPanel.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Runtime Configuration Details */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-3 text-xs">
            <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-[#D39E36]" />
              <span>Runtime Specifications</span>
            </h3>

            <div className="space-y-2 border-t border-neutral-100 dark:border-neutral-800 pt-3">
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-mono">Domain</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{website.domain}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-mono">Server IP</span>
                <span className="font-mono text-neutral-900 dark:text-white">{website.ipAddress}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-mono">Hosting Platform</span>
                <span className="text-neutral-900 dark:text-white">Hostinger Cloud (Node.js 20.x)</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-mono">Root Directory</span>
                <span className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400 break-all">
                  /home/u115205138/domains/{website.domain}/public_html
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
