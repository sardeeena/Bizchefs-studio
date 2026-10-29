'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Network,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  Globe,
  Settings,
  X,
} from 'lucide-react';
import { DomainRecord } from '@/types';
import { formatDate } from '@/lib/utils';

export default function DomainsPage() {
  const { clientDomains, currentClient } = useApp();
  const [selectedDomain, setSelectedDomain] = useState<DomainRecord | null>(null);
  const [dnsModalOpen, setDnsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = clientDomains.filter((d) =>
    d.domain.toLowerCase().includes(search.toLowerCase())
  );

  const handleInspectDns = (domain: DomainRecord) => {
    setSelectedDomain(domain);
    setDnsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Domain Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Registered domain names, DNS zone records, and SSL certificates for{' '}
            <span className="font-semibold text-neutral-900 dark:text-neutral-200">
              {currentClient?.name}
            </span>
            .
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('New domain registrations are processed via your BizChefs concierge.')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Domain</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 max-w-sm">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search domains..."
            className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg pl-8 pr-3 py-1.5 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Domains Table */}
      <div className="rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-[#151921] border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Domain Name</th>
                <th className="py-3 px-4">Registrar</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Auto-Renew</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">DNS Records</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-purple-500 shrink-0" />
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {d.domain}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400">
                    {d.registrar}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                        d.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {d.status === 'active' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                      )}
                      <span className="capitalize">{d.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[11px] font-medium ${
                        d.autoRenew ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'
                      }`}
                    >
                      {d.autoRenew ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td suppressHydrationWarning className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">
                    {formatDate(d.expiresAt)}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400">
                    {d.dnsRecordsCount} Zone Records
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleInspectDns(d)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors"
                    >
                      <Settings className="w-3 h-3" />
                      <span>DNS Records</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DNS Inspection Modal */}
      {dnsModalOpen && selectedDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  DNS Zone Records — {selectedDomain.domain}
                </h3>
                <p className="text-xs text-neutral-500">
                  Hostinger Nameservers: {selectedDomain.nameservers.join(', ')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDnsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-600 dark:text-blue-400">A</span> @
                  <span className="text-neutral-400 block text-[11px]">185.199.110.153 (Hostinger Cloud IP)</span>
                </div>
                <span className="text-neutral-500 text-[10px]">TTL 300</span>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-600 dark:text-purple-400">CNAME</span> www
                  <span className="text-neutral-400 block text-[11px]">{selectedDomain.domain}</span>
                </div>
                <span className="text-neutral-500 text-[10px]">TTL 300</span>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">TXT</span> @
                  <span className="text-neutral-400 block text-[11px]">v=spf1 include:_spf.hostinger.com ~all</span>
                </div>
                <span className="text-neutral-500 text-[10px]">TTL 3600</span>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-600 dark:text-amber-400">MX</span> @
                  <span className="text-neutral-400 block text-[11px]">mx1.hostinger.com (Priority 5)</span>
                </div>
                <span className="text-neutral-500 text-[10px]">TTL 3600</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDnsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
