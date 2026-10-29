'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { canAccessWebsite } from '@/lib/auth/session';
import { DEMO_WEBSITES, DEMO_ANALYTICS } from '@/lib/data/mock-db';
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
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function WebsiteAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const websiteId = resolvedParams.id;
  const { currentUser } = useApp();
  const [timeRange, setTimeRange] = useState<'7d' | '28d' | '90d'>('28d');

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
          You are not authorized to view analytics properties for this client website.
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

  const analytics = DEMO_ANALYTICS[website.id] || DEMO_ANALYTICS['web_kemet_main'];

  // Calculate SVG line chart coordinates for daily traffic
  const maxVisitors = Math.max(...analytics.dailyTraffic.map((d) => d.visitors), 1);
  const chartPoints = analytics.dailyTraffic
    .map((d, index) => {
      const x = 30 + index * 105;
      const y = 160 - (d.visitors / maxVisitors) * 120;
      return `${x},${y}`;
    })
    .join(' ');

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

      {/* Integration Notice Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-[#D39E36] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 shrink-0 text-[#D39E36]" />
          <span>
            <strong>Connected Property Telemetry</strong>: GA4 Property ({analytics.gaPropertyId}) & Google Search Console ({analytics.gscSiteUrl}). Demo data enabled.
          </span>
        </div>
        <span className="text-[11px] text-neutral-500 shrink-0 font-mono">
          Last Synced: Today 19:25 UTC
        </span>
      </div>

      {/* GA4 Core Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium">Active Users</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div suppressHydrationWarning className="text-2xl font-bold text-neutral-900 dark:text-white">
            {formatNumber(analytics.monthlyUsers)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+{analytics.usersGrowthPct}% vs previous period</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium">Page Views</span>
            <Eye className="w-4 h-4 text-purple-500" />
          </div>
          <div suppressHydrationWarning className="text-2xl font-bold text-neutral-900 dark:text-white">
            {formatNumber(analytics.monthlyPageviews)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {(analytics.monthlyPageviews / analytics.monthlySessions).toFixed(1)} views / session
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium">Bounce Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {analytics.bounceRatePct}%
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            Top 10% benchmark
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium">Avg Duration</span>
            <Clock className="w-4 h-4 text-[#D39E36]" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {Math.floor(analytics.avgSessionDurationSeconds / 60)}m{' '}
            {analytics.avgSessionDurationSeconds % 60}s
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">High user engagement</div>
        </div>
      </div>

      {/* Traffic Trend Chart (SVG) */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
              Daily Traffic Trajectory
            </h2>
            <p className="text-xs text-neutral-500">Unique visitors per day</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              Visitors
            </span>
          </div>
        </div>

        <div className="w-full h-48 relative overflow-x-auto">
          <svg className="w-full h-full min-w-[500px]" viewBox="0 0 700 180">
            {/* Grid lines */}
            <line x1="30" y1="40" x2="680" y2="40" stroke="currentColor" className="text-neutral-100 dark:text-neutral-800" strokeDasharray="3 3" />
            <line x1="30" y1="100" x2="680" y2="100" stroke="currentColor" className="text-neutral-100 dark:text-neutral-800" strokeDasharray="3 3" />
            <line x1="30" y1="160" x2="680" y2="160" stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" />

            {/* Polyline */}
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={chartPoints}
            />

            {/* Data points */}
            {analytics.dailyTraffic.map((d, idx) => {
              const x = 30 + idx * 105;
              const y = 160 - (d.visitors / maxVisitors) * 120;
              return (
                <g key={d.date}>
                  <circle cx={x} cy={y} r="4" fill="#2563eb" />
                  <text
                    x={x}
                    y="176"
                    fontSize="11"
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-neutral-400"
                  >
                    {d.date}
                  </text>
                  <text
                    x={x}
                    y={y - 8}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    fill="currentColor"
                    className="text-neutral-800 dark:text-neutral-200"
                  >
                    {d.visitors}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Google Search Console & Acquisition Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google Search Console Metrics */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-500" />
              Google Search Console Performance
            </h2>
            <span className="text-[10px] font-mono text-neutral-500">Organic Clicks</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-[#181d27]">
              <span className="text-neutral-400 block text-[10px]">Total Clicks</span>
              <span suppressHydrationWarning className="font-bold text-sm text-neutral-900 dark:text-white mt-0.5 block">
                {formatNumber(analytics.searchClicks)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-[#181d27]">
              <span className="text-neutral-400 block text-[10px]">Impressions</span>
              <span suppressHydrationWarning className="font-bold text-sm text-neutral-900 dark:text-white mt-0.5 block">
                {formatNumber(analytics.searchImpressions)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-[#181d27]">
              <span className="text-neutral-400 block text-[10px]">Average CTR</span>
              <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {analytics.ctrPct}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-[#181d27]">
              <span className="text-neutral-400 block text-[10px]">Avg Position</span>
              <span className="font-bold text-sm text-[#D39E36] mt-0.5 block">
                #{analytics.avgSearchPosition}
              </span>
            </div>
          </div>

          {/* Top Search Queries */}
          <div>
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-2">
              Top Search Queries
            </span>
            <div className="space-y-1.5">
              {analytics.searchQueries.map((q) => (
                <div
                  key={q.query}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-neutral-50 dark:bg-[#181d27]"
                >
                  <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[200px]">
                    {q.query}
                  </span>
                  <div className="flex items-center gap-3 text-neutral-500 text-[11px] shrink-0">
                    <span>{q.clicks} clicks</span>
                    <span>·</span>
                    <span>pos #{q.position}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic Acquisition & Top Pages */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-4">
          <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-500" />
            Acquisition Channels & Top Pages
          </h2>

          <div className="space-y-2.5">
            {analytics.acquisitionSources.map((source) => (
              <div key={source.source} className="text-xs">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    {source.source}
                  </span>
                  <span suppressHydrationWarning className="text-neutral-500 font-mono">
                    {formatNumber(source.users)} ({source.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-2">
              Top Visited Content
            </span>
            <div className="space-y-1.5">
              {analytics.topPages.slice(0, 3).map((page) => (
                <div
                  key={page.path}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-neutral-50 dark:bg-[#181d27]"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {page.title}
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400 truncate">
                      {page.path}
                    </div>
                  </div>
                  <span suppressHydrationWarning className="font-semibold text-neutral-700 dark:text-neutral-300 shrink-0">
                    {formatNumber(page.views)} views
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
