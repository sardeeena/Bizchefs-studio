'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Eye,
  Clock,
  Search,
  MousePointerClick,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Lock,
  BarChart3,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function WebsiteAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const websiteId = resolvedParams.id;
  const { currentUser, clientWebsites } = useApp();
  const [timeRange, setTimeRange] = useState<'7d' | '28d' | '90d'>('28d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const website = clientWebsites.find((w) => w.id === websiteId) || clientWebsites[0];

  useEffect(() => {
    async function loadReport() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/report?websiteId=${website?.id || websiteId}&range=${timeRange}`);
        if (res.ok) {
          const json = await res.json();
          setAnalyticsData(json);
        }
      } catch {
        // Handle fetch failure
      } finally {
        setLoading(false);
      }
    }
    if (website) {
      loadReport();
    }
  }, [website, websiteId, timeRange]);

  if (!website) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 shadow-xl my-12">
        <Lock className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Website Not Found</h2>
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

  const isConnected = analyticsData?.connected === true;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href={`/websites/${website.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {website.name}</span>
        </Link>

        {/* Time range switcher */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#13171f] p-1 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-neutral-400 ml-2 mr-1" />
          <button
            type="button"
            onClick={() => setTimeRange('7d')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              timeRange === '7d'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('28d')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              timeRange === '28d'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            }`}
          >
            Last 28 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('90d')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              timeRange === '90d'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            }`}
          >
            Last 90 Days
          </button>
        </div>
      </div>

      {/* Website Header Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#D39E36] tracking-wider uppercase">
              Google Verified Telemetry
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <span className="text-xs text-neutral-500">GA4 & Search Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Performance Analytics: {website.name}
          </h1>
          <a
            href={`https://${website.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-1 mt-1"
          >
            <span>{website.domain}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Google Connected ({analyticsData.googleEmail})</span>
            </div>
          ) : (
            <a
              href="/api/integrations/google/auth"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D39E36]" />
              <span>Connect Google Account</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <Loader2 className="w-6 h-6 animate-spin text-[#D39E36] mx-auto mb-2" />
          <p className="text-xs text-neutral-500">Querying verified Google Analytics & Search Console telemetry...</p>
        </div>
      ) : !isConnected ? (
        /* Honest Disconnected State — Zero Fake Data */
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 max-w-2xl mx-auto shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center mx-auto text-[#D39E36]">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Google Analytics 4 & Search Console Not Connected
            </h2>
            <p className="text-xs text-neutral-500 mt-2 max-w-md mx-auto leading-relaxed">
              BizChefs Studio strictly displays real, verified performance metrics. To inspect active 30-day visitors, organic impressions, search clicks, and top queries for{' '}
              <strong className="text-neutral-700 dark:text-neutral-300">{website.domain}</strong>, connect your authorized Google account.
            </p>
          </div>

          <div className="pt-2">
            <a
              href="/api/integrations/google/auth"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#D39E36]" />
              <span>Connect Google Account via OAuth</span>
            </a>
          </div>

          <div className="text-[11px] text-neutral-400 pt-2 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tokens are encrypted with AES-256-GCM. Read-only permissions requested.</span>
          </div>
        </div>
      ) : (
        /* Real Connected Data Display */
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
              <span className="text-xs text-neutral-500 block mb-1">Active Users</span>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {formatNumber(analyticsData.metrics?.monthlyUsers || 0)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
              <span className="text-xs text-neutral-500 block mb-1">Pageviews</span>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {formatNumber(analyticsData.metrics?.monthlyPageviews || 0)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
              <span className="text-xs text-neutral-500 block mb-1">Search Clicks</span>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {formatNumber(analyticsData.searchConsole?.clicks || 0)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
              <span className="text-xs text-neutral-500 block mb-1">Search Impressions</span>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {formatNumber(analyticsData.searchConsole?.impressions || 0)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
