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
  Loader2,
  LifeBuoy,
} from 'lucide-react';
import { DomainRecord } from '@/types';
import { formatDate } from '@/lib/utils';

export default function DomainsPage() {
  const { clientDomains, currentClient, addTicket } = useApp();
  const [selectedDomain, setSelectedDomain] = useState<DomainRecord | null>(null);
  const [dnsModalOpen, setDnsModalOpen] = useState(false);
  const [dnsLoading, setDnsLoading] = useState(false);
  const [liveDnsData, setLiveDnsData] = useState<any>(null);
  const [search, setSearch] = useState('');

  // Register domain modal
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [requestedDomain, setRequestedDomain] = useState('');
  const [requestedNotes, setRequestedNotes] = useState('');
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  const filtered = clientDomains.filter((d) =>
    d.domain.toLowerCase().includes(search.toLowerCase())
  );

  const handleInspectDns = async (domain: DomainRecord) => {
    setSelectedDomain(domain);
    setDnsModalOpen(true);
    setDnsLoading(true);
    setLiveDnsData(null);

    try {
      const res = await fetch(`/api/domains?inspect=${encodeURIComponent(domain.domain)}`);
      if (res.ok) {
        const json = await res.json();
        setLiveDnsData(json);
      }
    } catch {
      // Ignore
    } finally {
      setDnsLoading(false);
    }
  };

  const handleRequestDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedDomain.trim()) return;

    setRegisterSubmitting(true);
    setRegisterSuccess(null);

    await addTicket({
      clientId: currentClient?.id || 'client_bizchefs',
      subject: `Domain Registration Request: ${requestedDomain.trim()}`,
      category: 'hosting',
      priority: 'medium',
      status: 'open',
      assignedStaff: 'BizChefs Concierge',
    });

    setRegisterSubmitting(false);
    setRegisterSuccess(`Concierge request opened for ${requestedDomain.trim()}. Ticket added to Support.`);
    setTimeout(() => {
      setRegisterModalOpen(false);
      setRegisterSuccess(null);
      setRequestedDomain('');
      setRequestedNotes('');
    }, 2000);
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
          onClick={() => setRegisterModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs"
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
            <thead className="bg-neutral-50 dark:bg-[#181d27] border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-medium">
              <tr>
                <th className="py-3 px-4">Domain Name</th>
                <th className="py-3 px-4">Registrar</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">SSL TLS</th>
                <th className="py-3 px-4">Expiration</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500">
                    No domains found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {d.domain}
                        </span>
                        <a
                          href={`https://${d.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {d.nameservers.join(', ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">
                      {d.registrar}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Valid
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300 font-mono">
                      {formatDate(d.expiresAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleInspectDns(d)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#151921] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <Settings className="w-3 h-3 text-[#D39E36]" />
                        <span>Inspect DNS</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real Live DNS Inspection Modal */}
      {dnsModalOpen && selectedDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Live DNS Zone Records: {selectedDomain.domain}
                </h3>
                <p className="text-xs text-neutral-500">
                  Resolved via Node.js system resolver from authoritative nameservers
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

            {dnsLoading ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                <Loader2 className="w-5 h-5 animate-spin text-[#D39E36] mx-auto mb-2" />
                <span>Querying authoritative DNS records for {selectedDomain.domain}...</span>
              </div>
            ) : liveDnsData?.records ? (
              <div className="space-y-2 max-h-72 overflow-y-auto text-xs font-mono">
                {liveDnsData.records.map((r: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">{r.type}</span>
                      <span className="text-neutral-400 mr-2">{r.name}</span>
                      <span className="text-neutral-800 dark:text-neutral-200">{r.value}</span>
                    </div>
                    <span className="text-neutral-500 text-[10px]">TTL {r.ttl}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 py-4 text-center">No public DNS records found.</p>
            )}

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

      {/* Real Concierge Domain Registration Modal */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-[#D39E36]" />
                <span>Register New Domain via Concierge</span>
              </h3>
              <button
                type="button"
                onClick={() => setRegisterModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs"
              >
                ✕
              </button>
            </div>

            {registerSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300">
                {registerSuccess}
              </div>
            ) : (
              <form onSubmit={handleRequestDomain} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Desired Domain Name
                  </label>
                  <input
                    type="text"
                    required
                    value={requestedDomain}
                    onChange={(e) => setRequestedDomain(e.target.value)}
                    placeholder="e.g. mycompany.com"
                    className="w-full bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Notes / Preferred TLD
                  </label>
                  <textarea
                    rows={3}
                    value={requestedNotes}
                    onChange={(e) => setRequestedNotes(e.target.value)}
                    placeholder="Provide desired TLD (.com, .org, .net), DNS requirements, or registrar transfer details."
                    className="w-full bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRegisterModalOpen(false)}
                    className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={registerSubmitting}
                    className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {registerSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Submit Registration Request</span>
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
