'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
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
  UserCheck,
  KeyRound,
  History,
  Loader2,
} from 'lucide-react';
import { UserRole } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function AdminPage() {
  const {
    currentUser,
    accessibleClients,
    allClients,
    clientWebsites,
    updateUserRole,
    refreshData,
  } = useApp();

  const [syncingAll, setSyncingAll] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [roleChangeFeedback, setRoleChangeFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Real audit logs
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const isSuperadmin = currentUser.role === 'superadmin';
  const isAdmin = currentUser.role === 'admin';
  const isAuthorized = isSuperadmin || isAdmin;

  useEffect(() => {
    async function loadAdminLogs() {
      if (!isAuthorized) return;
      setLogsLoading(true);
      try {
        const res = await fetch('/api/audit-logs');
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setAuditLogs(json.data);
          }
        }
      } catch {
        // Ignore
      } finally {
        setLogsLoading(false);
      }
    }
    loadAdminLogs();
  }, [isAuthorized]);

  // Strict 403 Forbidden Gate for Tech and Owner roles
  if (!isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 shadow-xl my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
          403 — BizChefs Staff Access Restricted
        </h1>
        <p className="text-xs text-neutral-500 mt-2 mb-4 leading-relaxed">
          The BizChefs Admin Center is restricted to authorized operational staff. Your current identity is{' '}
          <strong className="text-neutral-900 dark:text-white">{currentUser.email}</strong> with role{' '}
          <span className="font-mono uppercase text-rose-600 dark:text-rose-400 font-semibold">
            {currentUser.role}
          </span>
          .
        </p>

        <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 mb-6 text-left space-y-1.5">
          <div className="font-semibold text-neutral-900 dark:text-neutral-200 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>RBAC Security Barrier Active</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Tech and Owner accounts do not hold <code className="font-mono text-neutral-800 dark:text-neutral-200">clients:read</code> or <code className="font-mono text-neutral-800 dark:text-neutral-200">roles:manage</code> permissions.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200"
        >
          <span>Return to Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  // Admin / Superadmin View
  const handleGlobalSync = async () => {
    setSyncingAll(true);
    setSyncResult(null);

    try {
      const res = await fetch('/api/hostinger/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_all' }),
      });
      const json = await res.json();
      await refreshData();

      if (json.success) {
        setSyncResult(
          `Hostinger live sync complete: verified ${json.websites?.length || 0} active virtual hosts across infrastructure.`
        );
      } else {
        setSyncResult(`Hostinger sync note: ${json.error || 'Sync failed'}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sync request failed';
      setSyncResult(`Hostinger sync error: ${msg}`);
    } finally {
      setSyncingAll(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setRoleChangeFeedback(null);
    const result = await updateUserRole(userId, newRole);
    if (result.success) {
      setRoleChangeFeedback({
        type: 'success',
        message: `Successfully updated user role to ${newRole}. Privilege audit event registered.`,
      });
    } else {
      setRoleChangeFeedback({
        type: 'error',
        message: result.error || 'Failed to update user role.',
      });
    }
  };

  const displayedClients = isSuperadmin ? allClients : accessibleClients;

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-[#D39E36] tracking-wider uppercase">
              BIZCHEFS STAFF COMMAND CENTER · {currentUser.role.toUpperCase()}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Platform Administration & RBAC
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Cross-tenant workspace oversight, role delegation, Hostinger edge synchronization, and platform audit logging.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGlobalSync}
          disabled={syncingAll}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shrink-0 disabled:opacity-50 shadow-xs"
        >
          {syncingAll ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 text-[#D39E36]" />
          )}
          <span>{syncingAll ? 'Synchronizing Hostinger...' : 'Sync All Edge Nodes'}</span>
        </button>
      </div>

      {syncResult && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{syncResult}</span>
        </div>
      )}

      {roleChangeFeedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            roleChangeFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50'
          }`}
        >
          {roleChangeFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          )}
          <span>{roleChangeFeedback.message}</span>
        </div>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <span className="text-xs text-neutral-500 block mb-1">Managed Workspaces</span>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {displayedClients.length}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Active tenant isolation</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <span className="text-xs text-neutral-500 block mb-1">Total Web Virtual Hosts</span>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {clientWebsites.length}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">
            Synchronized with Hostinger
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <span className="text-xs text-neutral-500 block mb-1">Security Model</span>
          <div className="text-base font-bold text-neutral-900 dark:text-white mt-1">
            Four-Role RBAC
          </div>
          <span className="text-[11px] text-amber-600 dark:text-[#D39E36] mt-1 block font-mono">
            Superadmin Guard Active
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <span className="text-xs text-neutral-500 block mb-1">Audit Records</span>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {auditLogs.length}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Persisted events</span>
        </div>
      </div>

      {/* Client Workspaces Directory */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#D39E36]" />
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
              Client Organizations & Workspaces
            </h2>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            {displayedClients.length} workspaces
          </span>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
          {displayedClients.map((client) => (
            <div key={client.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-neutral-900 dark:text-white block">
                  {client.name}
                </span>
                <span className="text-neutral-500 text-[11px]">
                  {client.contactEmail} · {client.activeCarePlan}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {client.tier}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-purple-500" />
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
              System Administrative Audit Log
            </h2>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            {auditLogs.length} events
          </span>
        </div>

        {logsLoading ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#D39E36] mx-auto mb-1" />
            <span>Loading audit log events...</span>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            <p className="font-semibold text-neutral-800 dark:text-neutral-200">No administrative audit events recorded yet</p>
            <p className="text-[11px] text-neutral-400 mt-1">
              Events are registered whenever role alterations, node syncs, or credential updates occur.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                <div>
                  <span className="font-semibold text-neutral-900 dark:text-white font-mono">
                    {log.action}
                  </span>
                  <span className="text-neutral-500 text-[11px] block mt-0.5">
                    By {log.actorName} ({log.actorRole}) · {log.resourceType}
                  </span>
                </div>
                <span className="text-neutral-400 font-mono text-[10px]">
                  {formatDateTime(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
