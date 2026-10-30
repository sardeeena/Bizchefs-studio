'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  ArrowLeft,
  Rocket,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Terminal,
  ExternalLink,
  Lock,
  RefreshCw,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { Deployment } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function WebsiteDeploymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const websiteId = resolvedParams.id;
  const { currentUser, clientWebsites, clientDeployments, triggerDeployment } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [activeLogDeployment, setActiveLogDeployment] = useState<Deployment | null>(null);
  const [triggerFeedback, setTriggerFeedback] = useState<string | null>(null);

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

  const websiteDeployments = clientDeployments.filter((d) => d.websiteId === website.id);

  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await triggerDeployment(website.id, commitMessage.trim());
      setTriggerFeedback('Deployment webhook dispatched successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deployment failed';
      setTriggerFeedback(msg);
    }
  };

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

      {/* Deployments Header Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#D39E36] tracking-wider uppercase">
              Production Build Pipeline
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <span className="text-xs text-neutral-500">Automated CI/CD</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Deployment History: {website.name}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Target Domain: <strong className="text-neutral-800 dark:text-neutral-200">{website.domain}</strong> · Active Branch: <code className="font-mono text-[11px]">{website.branch || 'main'}</code>
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setTriggerFeedback(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs"
        >
          <Rocket className="w-4 h-4 text-[#D39E36]" />
          <span>Trigger Build Workflow</span>
        </button>
      </div>

      {/* Main Deployments List */}
      <div className="rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Recorded Build Events</span>
          </h2>
          <span className="text-xs text-neutral-500 font-mono">
            {websiteDeployments.length} logged
          </span>
        </div>

        {websiteDeployments.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500 space-y-3">
            <Rocket className="w-8 h-8 text-neutral-400 mx-auto" />
            <div>
              <p className="font-bold text-neutral-800 dark:text-neutral-200 text-sm">
                No Automated Deployments Logged Yet
              </p>
              <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 leading-relaxed">
                Production builds are triggered automatically when commits are pushed to the connected repository branch.
                {website.repositoryUrl && (
                  <span className="block mt-2 font-mono text-[11px] text-blue-600 dark:text-blue-400">
                    Repository: {website.repositoryUrl}
                  </span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            {websiteDeployments.map((dep) => (
              <div key={dep.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-mono font-bold text-neutral-900 dark:text-white">
                    {dep.commitHash}
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-400 mt-0.5">
                    {dep.commitMessage}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 capitalize">
                  {dep.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trigger Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-[#D39E36]" />
                <span>Deploy to Production</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs"
              >
                ✕
              </button>
            </div>

            {triggerFeedback ? (
              <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 space-y-3">
                <p>{triggerFeedback}</p>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-full py-1.5 px-3 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleTrigger} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Target Branch
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedBranch}
                    className="w-full bg-neutral-100 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Commit / Deployment Notes
                  </label>
                  <input
                    type="text"
                    required
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="e.g. Production release for SEO & GEO optimizations"
                    className="w-full bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold"
                  >
                    Confirm Trigger
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
