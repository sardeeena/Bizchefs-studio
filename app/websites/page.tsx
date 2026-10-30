'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Globe,
  Plus,
  ExternalLink,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Server,
  ArrowUpRight,
  Filter,
  BarChart3,
  FileCode,
  Rocket,
} from 'lucide-react';
import { FrameworkType } from '@/types';

export default function WebsitesPage() {
  const { clientWebsites, currentClient, currentUser } = useApp();
  const [filterFramework, setFilterFramework] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New website registration form state
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteDomain, setNewSiteDomain] = useState('');
  const [newSiteFramework, setNewSiteFramework] = useState<FrameworkType>('Next.js 15');
  const [newSiteRepo, setNewSiteRepo] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const { refreshData } = useApp();

  const filteredWebsites = clientWebsites.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(search.toLowerCase()) ||
      site.domain.toLowerCase().includes(search.toLowerCase());
    const matchesFramework =
      filterFramework === 'all' || site.framework === filterFramework;
    return matchesSearch && matchesFramework;
  });

  const handleRegisterWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim() || !newSiteDomain.trim()) return;

    setRegistering(true);
    setRegisterError(null);

    try {
      const res = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSiteName.trim(),
          domain: newSiteDomain.trim(),
          framework: newSiteFramework,
          repositoryUrl: newSiteRepo.trim() || undefined,
          clientId: currentClient?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data.message || 'Failed to register website.');
        setRegistering(false);
        return;
      }

      setFormSuccess(true);
      await refreshData();

      setTimeout(() => {
        setModalOpen(false);
        setFormSuccess(false);
        setNewSiteName('');
        setNewSiteDomain('');
        setNewSiteRepo('');
      }, 1200);
    } catch {
      setRegisterError('Network error while connecting website.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Client Websites
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Production, staging, and custom-coded applications configured for{' '}
            <span className="font-semibold text-neutral-900 dark:text-neutral-200">
              {currentClient?.name}
            </span>
            .
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Website</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or domain..."
            className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg pl-8 pr-3 py-1.5 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Framework Segmented Filter */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          {['all', 'Next.js 15', 'React 19', 'PHP 8.3'].map((fw) => (
            <button
              key={fw}
              type="button"
              onClick={() => setFilterFramework(fw)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                filterFramework === fw
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {fw === 'all' ? 'All Stacks' : fw}
            </button>
          ))}
        </div>
      </div>

      {/* Websites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWebsites.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#13171f]">
            <Globe className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              No matching websites found
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
              Try adjusting your search criteria or register a new client website using the button above.
            </p>
          </div>
        ) : (
          filteredWebsites.map((site) => (
            <div
              key={site.id}
              className="p-5 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <Link
                      href={`/websites/${site.id}`}
                      className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {site.name}
                    </Link>
                    <a
                      href={`https://${site.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 flex items-center gap-1 mt-0.5"
                    >
                      <span>{site.domain}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Healthy ({site.uptimePercentage}%)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 my-4 py-3 border-y border-neutral-100 dark:border-neutral-800/80 text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                      Tech Stack
                    </span>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {site.framework}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                      Hosting Plan
                    </span>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {site.hostingerPlanName || site.hostingProvider}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                      Git Branch
                    </span>
                    <span className="font-mono text-neutral-800 dark:text-neutral-200">
                      {site.branch}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                      SSL Certificate
                    </span>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      Active (Let&apos;s Encrypt)
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-page quick navigation links */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/websites/${site.id}/analytics`}
                    className="text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1 transition-colors"
                    title="View Analytics"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Analytics</span>
                  </Link>
                  <Link
                    href={`/websites/${site.id}/files`}
                    className="text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1 transition-colors"
                    title="Safe File Manager"
                  >
                    <FileCode className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Files</span>
                  </Link>
                  <Link
                    href={`/websites/${site.id}/deployments`}
                    className="text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1 transition-colors"
                    title="Deployments & Rollback"
                  >
                    <Rocket className="w-3.5 h-3.5 text-purple-500" />
                    <span>Deploy</span>
                  </Link>
                </div>

                <Link
                  href={`/websites/${site.id}`}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Connect Website Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
              Connect Website to Studio
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Link an existing custom website to the BizChefs client portal for automated monitoring, Hostinger sync, and deployment telemetry.
            </p>

            {formSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                  Website record configured!
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  BizChefs staff will verify Hostinger virtual host DNS settings.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegisterWebsite} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Website Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newSiteName}
                    onChange={(e) => setNewSiteName(e.target.value)}
                    placeholder="e.g. Kemet Tours Booking Engine"
                    className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Domain
                    </label>
                    <input
                      type="text"
                      required
                      value={newSiteDomain}
                      onChange={(e) => setNewSiteDomain(e.target.value)}
                      placeholder="e.g. book.kemettours.com"
                      className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Framework
                    </label>
                    <select
                      value={newSiteFramework}
                      onChange={(e) => setNewSiteFramework(e.target.value as any)}
                      className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-neutral-900 dark:text-neutral-100"
                    >
                      <option value="Next.js 15">Next.js 15</option>
                      <option value="React 19">React 19</option>
                      <option value="PHP 8.3">PHP 8.3</option>
                      <option value="Static HTML">Static HTML</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Repository URL (GitHub)
                  </label>
                  <input
                    type="url"
                    value={newSiteRepo}
                    onChange={(e) => setNewSiteRepo(e.target.value)}
                    placeholder="https://github.com/organization/repo"
                    className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-neutral-900 dark:text-neutral-100"
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
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200"
                  >
                    Register Website
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
