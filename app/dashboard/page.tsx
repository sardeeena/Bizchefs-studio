'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Globe,
  Network,
  Cpu,
  TrendingUp,
  ShieldCheck,
  Rocket,
  LifeBuoy,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
  Server,
  FileCode,
  BarChart3,
} from 'lucide-react';
import { DEMO_ANALYTICS } from '@/lib/data/mock-db';
import { formatDate, formatTime, formatNumber } from '@/lib/utils';

export default function DashboardPage() {
  const {
    currentUser,
    currentClient,
    clientWebsites,
    clientDomains,
    clientHosting,
    clientDeployments,
    clientTickets,
    addTicket,
  } = useApp();

  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState<'hosting' | 'bug' | 'feature' | 'billing'>('hosting');
  const [newTicketPriority, setNewTicketPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  const mainWebsite = clientWebsites[0];
  const mainAnalytics = mainWebsite ? DEMO_ANALYTICS[mainWebsite.id] : null;

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim()) return;

    addTicket({
      clientId: currentClient?.id || 'client_kemet',
      websiteId: mainWebsite?.id,
      subject: newTicketSubject.trim(),
      category: newTicketCategory,
      priority: newTicketPriority,
      status: 'open',
      assignedStaff: 'BizChefs Support Team',
    });

    setNewTicketSubject('');
    setTicketModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#D39E36] tracking-wider uppercase">
              {currentClient?.tier?.toUpperCase()} TIER PORTAL
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <span className="text-xs text-neutral-500">{currentClient?.activeCarePlan}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Managing digital infrastructure, hosting, and performance for{' '}
            <strong className="font-semibold text-neutral-900 dark:text-neutral-200">
              {currentClient?.name}
            </strong>
            .
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setTicketModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-[#D39E36]" />
            <span>Open Support Request</span>
          </button>
          <Link
            href="/websites"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            <span>Manage Websites</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Connected Websites</span>
            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {clientWebsites.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>All healthy & SSL protected</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Domain Portfolio</span>
            <Network className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {clientDomains.length}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {clientDomains.filter((d) => d.autoRenew).length} auto-renew enabled
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Hosting Platform</span>
            <Server className="w-4 h-4 text-[#D39E36]" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {clientHosting[0]?.provider === 'hostinger' ? 'Hostinger Cloud' : 'Active VPS'}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>99.98% 30-day uptime</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">30-Day Visitors</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div suppressHydrationWarning className="text-2xl font-bold text-neutral-900 dark:text-white">
            {mainAnalytics ? formatNumber(mainAnalytics.monthlyUsers) : '—'}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <span>+{mainAnalytics?.usersGrowthPct || 14}% vs last month</span>
          </div>
        </div>
      </div>

      {/* Main Section: Website Overview & Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Websites & Hostinger Health */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-neutral-500" />
              Client Websites
            </h2>
            <Link
              href="/websites"
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              View all ({clientWebsites.length})
            </Link>
          </div>

          <div className="space-y-3">
            {clientWebsites.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#13171f]">
                <Globe className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  No websites registered for this client
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Contact your BizChefs account manager to link an existing project.
                </p>
              </div>
            ) : (
              clientWebsites.map((site) => (
                <div
                  key={site.id}
                  className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/websites/${site.id}`}
                          className="font-semibold text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                        >
                          {site.name}
                        </Link>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Operational" />
                      </div>
                      <a
                        href={`https://${site.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 mt-0.5"
                      >
                        <span>{site.domain}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {site.framework}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                        SSL Active
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Hosting</span>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">
                        {site.hostingerPlanName || site.hostingProvider}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px]">IP Address</span>
                      <span className="font-mono text-neutral-800 dark:text-neutral-200">
                        {site.ipAddress}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Git Branch</span>
                      <span className="font-mono text-neutral-800 dark:text-neutral-200">
                        {site.branch}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Uptime</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {site.uptimePercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="mt-3.5 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/websites/${site.id}/analytics`}
                        className="text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                        <span>Analytics</span>
                      </Link>
                      <Link
                        href={`/websites/${site.id}/files`}
                        className="text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <FileCode className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Files</span>
                      </Link>
                      <Link
                        href={`/websites/${site.id}/deployments`}
                        className="text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <Rocket className="w-3.5 h-3.5 text-purple-500" />
                        <span>Deployments</span>
                      </Link>
                    </div>

                    <Link
                      href={`/websites/${site.id}`}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>Overview</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recent Deployments Activity */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-purple-500" />
                Recent Code Deployments
              </h2>
              <span className="text-xs text-neutral-400">Hostinger Edge Synced</span>
            </div>

            <div className="space-y-2.5">
              {clientDeployments.slice(0, 3).map((dep) => (
                <div
                  key={dep.id}
                  className="p-3 rounded-lg bg-neutral-50 dark:bg-[#181d27] border border-neutral-100 dark:border-neutral-800 text-xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                        {dep.commitHash}
                      </span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {dep.commitMessage}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-2">
                      <span>by {dep.authorName}</span>
                      <span>·</span>
                      <span suppressHydrationWarning>{formatTime(dep.deployedAt)}</span>
                      <span>·</span>
                      <span>{dep.durationSeconds}s duration</span>
                    </div>
                  </div>

                  <span className="shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {dep.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Hostinger Service Status & Tickets */}
        <div className="space-y-4">
          {/* Hostinger Cloud Infrastructure Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#D39E36]" />
                Hostinger Infrastructure
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                Connected
              </span>
            </div>

            {clientHosting[0] ? (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-neutral-500 text-[11px]">Plan</div>
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    {clientHosting[0].planName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-neutral-500 text-[11px]">Datacenter</div>
                    <div className="font-medium text-neutral-800 dark:text-neutral-200">
                      {clientHosting[0].datacenterLocation}
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-[11px]">Renewal Date</div>
                    <div suppressHydrationWarning className="font-medium text-neutral-800 dark:text-neutral-200">
                      {formatDate(clientHosting[0].renewalDate)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-neutral-500">Storage Usage</span>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      {clientHosting[0].diskUsedGb} GB / {clientHosting[0].diskGb} GB
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{
                        width: `${(clientHosting[0].diskUsedGb / clientHosting[0].diskGb) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-neutral-500">Bandwidth Usage</span>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      {clientHosting[0].bandwidthUsedGb} GB / {clientHosting[0].bandwidthGb} GB
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#D39E36] h-1.5 rounded-full"
                      style={{
                        width: `${(clientHosting[0].bandwidthUsedGb / clientHosting[0].bandwidthGb) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-500">No active hosting service assigned.</p>
            )}
          </div>

          {/* Support Tickets Overview */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <LifeBuoy className="w-3.5 h-3.5 text-[#D39E36]" />
                Support & Requests
              </h3>
              <Link
                href="/support"
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-2.5">
              {clientTickets.slice(0, 3).map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181d27] text-xs"
                >
                  <div className="font-semibold text-neutral-900 dark:text-white leading-snug">
                    {ticket.subject}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px]">
                    <span className="text-neutral-500 capitalize">{ticket.category}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${
                        ticket.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : ticket.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setTicketModalOpen(true)}
              className="w-full mt-3 py-2 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* Support Ticket Modal */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
              Submit Support Request
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Your request will be routed directly to the BizChefs engineering & infrastructure team.
            </p>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  required
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  placeholder="e.g., Update SSL certificate for subdomain"
                  className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newTicketCategory}
                    onChange={(e) => setNewTicketCategory(e.target.value as any)}
                    className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="hosting">Hosting & DNS</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="billing">Billing & Renewal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTicketPriority}
                    onChange={(e) => setNewTicketPriority(e.target.value as any)}
                    className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setTicketModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
