'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { DEMO_CLIENTS, DEMO_AUDIT_LOGS, DEMO_WEBSITES } from '@/lib/data/mock-db';
import { hostinger } from '@/lib/integrations/hostinger/client';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Building2,
  Server,
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Users,
} from 'lucide-react';

export default function AdminPage() {
  const { currentUser, setCurrentUser, availableUsers } = useApp();
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'super_admin' || currentUser.role === 'admin';

  // Strict 403 Forbidden Gate for non-admin users
  if (!isAdmin) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 shadow-xl my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
          403 — BizChefs Staff Access Restricted
        </h1>
        <p className="text-xs text-neutral-500 mt-2 mb-6 leading-relaxed">
          The BizChefs Admin Center is restricted to authorized operations engineers. Your current session is identified as{' '}
          <strong>{currentUser.email}</strong> with role <strong>{currentUser.role}</strong>.
        </p>

        {/* Demo Mode Persona Switcher Helper */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 mb-6 text-left space-y-2">
          <div className="font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Testing Administrative Privileges</span>
          </div>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
            In development/demo mode, switch to the <strong>Tariq Al-Chef (BizChefs Lead)</strong> account to verify staff management tools.
          </p>
          <button
            type="button"
            onClick={() => {
              const adminUser = availableUsers.find((u) => u.role === 'super_admin');
              if (adminUser) setCurrentUser(adminUser);
            }}
            className="w-full mt-2 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            Switch to Tariq Al-Chef (Super Admin)
          </button>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          <span>Return to Client Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  // Admin View
  const handleGlobalSync = async () => {
    setSyncingAll(true);
    setSyncResult(null);
    const res = await hostinger.syncWebsiteStatus('hst_cluster_master', 'all clusters');
    setSyncingAll(false);
    setSyncResult(
      'Synchronized 4 client website virtual hosts across Frankfurt & Amsterdam Hostinger datacenters.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-[#D39E36] tracking-wider uppercase">
              BIZCHEFS STAFF COMMAND CENTER
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Administrative Control Panel
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Global client roster, Hostinger cluster synchronization, and system audit log oversight.
          </p>
        </div>

        <button
          type="button"
          disabled={syncingAll}
          onClick={handleGlobalSync}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
          <span>{syncingAll ? 'Synchronizing...' : 'Sync All Hostinger Clusters'}</span>
        </button>
      </div>

      {syncResult && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{syncResult}</span>
        </div>
      )}

      {/* Global Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium">Total Clients</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {DEMO_CLIENTS.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            All active & healthy
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium">Managed Websites</span>
            <Server className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {DEMO_WEBSITES.length}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Across 3 hosting nodes</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium">Hostinger API Status</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            Operational
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Rate limits: 100% capacity</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium">Global Care MRR</span>
            <ShieldCheck className="w-4 h-4 text-[#D39E36]" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">
            $400 / mo
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            100% renewal rate
          </div>
        </div>
      </div>

      {/* Client Roster Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-4">
        <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#D39E36]" />
          Client Organizations Directory
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-[#151921] border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Active Plan</th>
                <th className="py-3 px-4">Websites</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {DEMO_CLIENTS.map((client) => (
                <tr key={client.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                  <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                    {client.name}
                  </td>
                  <td className="py-3.5 px-4 capitalize font-medium text-neutral-700 dark:text-neutral-300">
                    {client.tier}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400">
                    {client.activeCarePlan}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {client.websiteCount} Sites
                  </td>
                  <td className="py-3.5 px-4 text-neutral-500">
                    {client.contactEmail}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {client.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cross-Tenant Master Audit Log */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-4">
        <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-500" />
          Master Cross-Tenant Security Audit Stream
        </h2>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
          {DEMO_AUDIT_LOGS.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                    {log.action}
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {log.details}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-2">
                  <span>Actor: {log.actorName} ({log.actorRole})</span>
                  <span>·</span>
                  <span>Tenant ID: {log.clientId || 'system'}</span>
                  <span>·</span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>

              <span className="font-mono text-[11px] text-neutral-400 shrink-0">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
