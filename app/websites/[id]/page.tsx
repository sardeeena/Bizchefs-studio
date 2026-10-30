'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { canAccessWebsite } from '@/lib/auth/session';
import { getHostingerCapabilities } from '@/lib/integrations/hostinger/capabilities';
import {
  Globe,
  Server,
  ShieldCheck,
  RefreshCw,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  FileCode,
  Rocket,
  Lock,
  GitBranch,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function WebsiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const websiteId = resolvedParams.id;
  const { currentUser, currentClient, clientWebsites } = useApp();

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [purgingCache, setPurgingCache] = useState(false);
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);

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
          <span>Back to Authorized Websites</span>
        </Link>
      </div>
    );
  }

  const capabilities = getHostingerCapabilities('cloud');

  const handleSyncHostinger = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/hostinger/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: website.domain }),
      });
      const json = await res.json();
      setSyncMessage(json.message || 'Synced successfully');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sync request failed';
      setSyncMessage(`Sync error: ${msg}`);
    } finally {
      setSyncing(false);
    }
  };

  const handlePurgeCache = async () => {
    setPurgingCache(true);
    setCacheMessage(null);
    try {
      const res = await fetch('/api/hostinger/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'purge_cache', domain: website.domain }),
      });
      const json = await res.json();
      setCacheMessage(json.message || 'Purge completed');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Purge request failed';
      setCacheMessage(`Cache purge error: ${msg}`);
    } finally {
      setPurgingCache(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          href="/websites"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Websites</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/websites/${website.id}/analytics`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#13171f] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
            <span>Analytics</span>
          </Link>
          <Link
            href={`/websites/${website.id}/files`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#13171f] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-500" />
            <span>Safe Files</span>
          </Link>
          <Link
            href={`/websites/${website.id}/deployments`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            <Rocket className="w-3.5 h-3.5 text-purple-400 dark:text-purple-600" />
            <span>Deployments</span>
          </Link>
        </div>
      </div>

      {/* Main Website Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Operational · {website.uptimePercentage}% 30-Day Uptime
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <span className="text-xs text-neutral-500">{website.framework}</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {website.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-500">
            <a
              href={`https://${website.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 font-medium"
            >
              <span>{website.domain}</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {website.stagingDomain && (
              <>
                <span className="text-neutral-300 dark:text-neutral-700">·</span>
                <a
                  href={`https://${website.stagingDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1"
                >
                  <span className="font-mono text-[11px]">staging: {website.stagingDomain}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </>
            )}

            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <span className="flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              <span className="font-mono">{website.branch}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-1 text-xs">
          <span className="text-neutral-400 text-[11px]">Hosting Provider</span>
          <span className="font-semibold text-neutral-900 dark:text-white">
            {website.hostingerPlanName || 'Hostinger Cloud'}
          </span>
          <span className="font-mono text-[11px] text-neutral-500">IP: {website.ipAddress}</span>
        </div>
      </div>

      {/* Grid: Technical Specifications & Hostinger Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Specifications */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-4">
          <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" />
            Technical Specifications
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-[#181d27] border border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                Framework Runtime
              </span>
              <span className="font-semibold text-neutral-900 dark:text-white mt-1 block">
                {website.framework}
              </span>
              <span className="text-neutral-500 text-[11px] mt-0.5 block">
                Node {website.nodeVersion || 'v20.x LTS'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-[#181d27] border border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                SSL / TLS Security
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </span>
              <span className="text-neutral-500 text-[11px] mt-0.5 block truncate">
                {website.sslIssuer || "Let's Encrypt"}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-[#181d27] border border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                Repository Link
              </span>
              <span className="font-semibold text-neutral-900 dark:text-white mt-1 block truncate">
                GitHub Repository
              </span>
              <a
                href={website.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 text-[11px] hover:underline flex items-center gap-1 mt-0.5"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-[#181d27] border border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                Edge Cache
              </span>
              <span className="font-semibold text-neutral-900 dark:text-white mt-1 block">
                Hostinger CDN Active
              </span>
              <span className="text-neutral-500 text-[11px] mt-0.5 block">
                HTTP/2 & HTTP/3 Enabled
              </span>
            </div>
          </div>
        </div>

        {/* Hostinger Official API Integration Card */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-[#D39E36]" />
              Hostinger API Integration
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              ID: {website.hostingerDomainId}
            </span>
          </div>

          <p className="text-xs text-neutral-500 leading-relaxed">
            Integrated via Hostinger REST API standards (
            <a
              href="https://developers.hostinger.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              developers.hostinger.com
            </a>
            ). Hostinger tokens are securely isolated in the server layer.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              disabled={syncing}
              onClick={handleSyncHostinger}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Hostinger Status'}</span>
            </button>

            <button
              type="button"
              disabled={purgingCache}
              onClick={handlePurgeCache}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-500" />
              <span>{purgingCache ? 'Purging...' : 'Purge Edge CDN Cache'}</span>
            </button>
          </div>

          {syncMessage && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-500" />
              <span>{syncMessage}</span>
            </div>
          )}

          {cacheMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{cacheMessage}</span>
            </div>
          )}

          {/* Capability Matrix */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-2">
              Provider Endpoint Capabilities
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Site Telemetry Sync</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Edge Cache Invalidation</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>DNS Record Telemetry</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-400">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Arbitrary HTTP Filesystem (Blocked)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
