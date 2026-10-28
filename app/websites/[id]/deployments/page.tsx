'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { canAccessWebsite } from '@/lib/auth/session';
import { DEMO_WEBSITES } from '@/lib/data/mock-db';
import {
  ArrowLeft,
  Rocket,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  GitBranch,
  Terminal,
  Lock,
  Plus,
  Server,
} from 'lucide-react';
import { Deployment } from '@/types';

export default function WebsiteDeploymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const websiteId = resolvedParams.id;
  const { currentUser, clientDeployments, triggerDeployment } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [activeLogDeployment, setActiveLogDeployment] = useState<Deployment | null>(null);
  const [rollbackSuccess, setRollbackSuccess] = useState<string | null>(null);

  const website = DEMO_WEBSITES.find((w) => w.id === websiteId);
  const hasAccess = canAccessWebsite(currentUser, websiteId);

  if (!website || !hasAccess) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 shadow-xl my-12">
        <Lock className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          Access Denied
        </h2>
        <p className="text-xs text-neutral-500 mt-2 mb-6">
          You are not authorized to view or manage deployments for this website.
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
    if (!commitMessage.trim()) return;

    await triggerDeployment(website.id, commitMessage.trim());
    setCommitMessage('');
    setModalOpen(false);
  };

  const handleRollback = (dep: Deployment) => {
    setRollbackSuccess(
      `Rollback command initiated for commit ${dep.commitHash}. Hostinger web root atomic symlink reverted.`
    );
    setTimeout(() => setRollbackSuccess(null), 4000);
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

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Trigger New Deployment</span>
        </button>
      </div>

      {rollbackSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{rollbackSuccess}</span>
        </div>
      )}

      {/* Deployments List */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <Rocket className="w-4 h-4 text-purple-500" />
            Deployment Pipeline & Rollbacks
          </h2>
          <span className="text-xs text-neutral-400">Hostinger Edge Production</span>
        </div>

        <div className="space-y-3">
          {websiteDeployments.length === 0 ? (
            <p className="text-xs text-neutral-500 py-4 text-center">
              No deployments recorded yet for this website.
            </p>
          ) : (
            websiteDeployments.map((dep) => (
              <div
                key={dep.id}
                className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#181d27]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-neutral-900 dark:text-neutral-100 bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded">
                      {dep.commitHash}
                    </span>
                    <span className="font-semibold text-neutral-900 dark:text-white truncate">
                      {dep.commitMessage}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                    <span>Author: {dep.authorName}</span>
                    <span>·</span>
                    <span>{new Date(dep.deployedAt).toLocaleString()}</span>
                    <span>·</span>
                    <span>{dep.durationSeconds > 0 ? `${dep.durationSeconds}s duration` : 'Running...'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                      dep.status === 'success'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : dep.status === 'building'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 animate-pulse'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {dep.status}
                  </span>

                  {dep.buildLogs && (
                    <button
                      type="button"
                      onClick={() => setActiveLogDeployment(dep)}
                      className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                      title="View build logs"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {dep.rollbackAvailable && (
                    <button
                      type="button"
                      onClick={() => handleRollback(dep)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors"
                      title="Rollback to this verified release"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-500" />
                      <span>Rollback</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Build Logs Drawer Modal */}
      {activeLogDeployment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-2xl w-full p-6 text-neutral-100 shadow-2xl space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Build Output — Commit {activeLogDeployment.commitHash}
              </span>
              <button
                type="button"
                onClick={() => setActiveLogDeployment(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-neutral-900 p-4 rounded-xl space-y-1.5 max-h-72 overflow-y-auto text-neutral-300 leading-relaxed">
              {activeLogDeployment.buildLogs?.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-neutral-600 select-none">{index + 1}</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveLogDeployment(null)}
                className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-sans text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trigger Deployment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Trigger Production Deployment
            </h3>
            <p className="text-xs text-neutral-500">
              This triggers the Next.js 15 build pipeline and automatically synchronizes artifacts to the Hostinger edge cluster.
            </p>

            <form onSubmit={handleTrigger} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Target Branch
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-neutral-900 dark:text-neutral-100"
                >
                  <option value="main">main (production release)</option>
                  <option value="winter-release">winter-release (staging test)</option>
                  <option value="staging">staging</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Commit Summary / Release Notes
                </label>
                <input
                  type="text"
                  required
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="e.g. feat: update Nile itinerary packages and contact form"
                  className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 flex items-center gap-1.5"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Start Deployment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
