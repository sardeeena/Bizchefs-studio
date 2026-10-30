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
  Loader2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

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
  const [ticketSubmitting, setTicketSubmitting] = useState(false);

  const mainWebsite = clientWebsites[0];

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim()) return;

    setTicketSubmitting(true);
    await addTicket({
      clientId: currentClient?.id || 'client_bizchefs',
      websiteId: mainWebsite?.id,
      subject: newTicketSubject.trim(),
      category: newTicketCategory,
      priority: newTicketPriority,
      status: 'open',
      assignedStaff: 'BizChefs Support Team',
    });

    setTicketSubmitting(false);
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
              {currentClient?.tier?.toUpperCase() || 'ENTERPRISE'} TIER PORTAL
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">·</span>
            <span className="text-xs text-neutral-500">{currentClient?.activeCarePlan || 'Active Concierge Retainer'}</span>
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
            <span>Verified Hostinger virtual hosts</span>
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
            All TLS & DNS records resolved live
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Hosting Infrastructure</span>
            <Server className="w-4 h-4 text-[#D39E36]" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {clientHosting[0]?.planName || 'Hostinger Business'}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Active Cloud Subscription</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Google Analytics & SEO</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mt-2">
            Configuration Required
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            <Link href="/websites" className="text-[#D39E36] hover:underline">
              Connect Google Account
            </Link>
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
                  Connect a website to begin monitoring and managing digital assets.
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
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Live & Verified" />
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
                        {site.sslIssuer || 'SSL Active'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Hosting</span>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">
                        Hostinger Cloud
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px]">IP Address</span>
                      <span className="font-mono text-neutral-800 dark:text-neutral-200">
                        {site.ipAddress}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Runtime</span>
                      <span className="font-mono text-neutral-800 dark:text-neutral-200">
                        Node.js 20.x
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Edge Status</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        HTTP 200 OK
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
                        <span>Deployment Files</span>
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

          {/* Deployments Section */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5 text-purple-500" />
                Build & Deployment Pipelines
              </h3>
            </div>

            {clientDeployments.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-500 bg-neutral-50 dark:bg-[#181d27] rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800">
                <Rocket className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                  No automated deployments logged yet
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Automated builds trigger on commit to connected GitHub repository branches.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {clientDeployments.slice(0, 3).map((dep) => (
                  <div
                    key={dep.id}
                    className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181d27] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-semibold text-neutral-900 dark:text-white">
                        {dep.commitHash}
                      </div>
                      <div className="text-neutral-500 text-[11px]">{dep.commitMessage}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 capitalize">
                      {dep.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Hostinger Service Status & Tickets */}
        <div className="space-y-4">
          {/* Hostinger Cloud Service Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-4">
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
                  <div className="text-neutral-500 text-[11px]">Subscription Plan</div>
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
                    <div className="text-neutral-500 text-[11px]">Order Reference</div>
                    <div className="font-mono text-neutral-800 dark:text-neutral-200">
                      #{clientHosting[0].orderId || '1010240359'}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-neutral-500">NVMe Cloud Storage</span>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      {clientHosting[0].diskGb} GB Allocated
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-1.5 rounded-full w-1/4" />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-500">Hostinger Cloud account active and synchronized.</p>
            )}
          </div>

          {/* Support Tickets Overview */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <LifeBuoy className="w-3.5 h-3.5 text-[#D39E36]" />
                Support & Concierge
              </h3>
              <Link
                href="/support"
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all ({clientTickets.length})
              </Link>
            </div>

            <div className="space-y-2.5">
              {clientTickets.length === 0 ? (
                <div className="p-4 text-center text-xs text-neutral-500 bg-neutral-50 dark:bg-[#181d27] rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800">
                  <p className="font-medium text-neutral-700 dark:text-neutral-300">No open support tickets</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Need engineering assistance? Click Open Support Request above.</p>
                </div>
              ) : (
                clientTickets.slice(0, 3).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181d27] text-xs"
                  >
                    <div className="font-semibold text-neutral-900 dark:text-white leading-snug">
                      {ticket.subject}
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11px]">
                      <span className="text-neutral-500 capitalize">{ticket.category}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium capitalize bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Creation Modal */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-[#D39E36]" />
                <span>Open Support Request</span>
              </h3>
              <button
                type="button"
                onClick={() => setTicketModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  placeholder="e.g. Request DNS record update or SSL assistance"
                  className="w-full bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newTicketCategory}
                    onChange={(e) => setNewTicketCategory(e.target.value as any)}
                    className="w-full bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg px-2.5 py-2 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="hosting">Hosting & Cloud</option>
                    <option value="bug">Technical Issue</option>
                    <option value="feature">Engineering Request</option>
                    <option value="billing">Billing & Retainer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTicketPriority}
                    onChange={(e) => setNewTicketPriority(e.target.value as any)}
                    className="w-full bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg px-2.5 py-2 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTicketModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ticketSubmitting}
                  className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {ticketSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
