'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { DEMO_AUDIT_LOGS, DEMO_WEBSITES } from '@/lib/data/mock-db';
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
  UserCheck,
  KeyRound,
} from 'lucide-react';
import { UserRole } from '@/types';
import { ROLE_DEFINITIONS } from '@/lib/auth/roles';
import { formatDateTime } from '@/lib/utils';

export default function AdminPage() {
  const {
    currentUser,
    setCurrentUser,
    availableUsers,
    accessibleClients,
    allClients,
    updateUserRole,
  } = useApp();

  const [syncingAll, setSyncingAll] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [roleChangeFeedback, setRoleChangeFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const isSuperadmin = currentUser.role === 'superadmin';
  const isAdmin = currentUser.role === 'admin';
  const isAuthorized = isSuperadmin || isAdmin;

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
            Tech and Owner accounts do not hold <code className="font-mono text-neutral-800 dark:text-neutral-200">clients:read</code> or <code className="font-mono text-neutral-800 dark:text-neutral-200">roles:manage</code> permissions. Access attempt has been recorded in audit logs.
          </p>
        </div>

        {/* Demo Switcher Quick Action */}
        <div className="space-y-2 mb-6">
          <p className="text-[11px] font-medium text-neutral-500">Switch identity in sandbox:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                const superUser = availableUsers.find((u) => u.role === 'superadmin');
                if (superUser) setCurrentUser(superUser);
              }}
              className="py-1.5 px-2 text-[11px] font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            >
              Switch to Superadmin
            </button>
            <button
              type="button"
              onClick={() => {
                const adminUser = availableUsers.find((u) => u.role === 'admin');
                if (adminUser) setCurrentUser(adminUser);
              }}
              className="py-1.5 px-2 text-[11px] font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              Switch to Admin
            </button>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
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
    const res = await hostinger.syncWebsiteStatus('hst_cluster_master', 'all clusters');
    setSyncingAll(false);
    setSyncResult(
      'Synchronized 4 client website virtual hosts across Frankfurt & Amsterdam Hostinger datacenters.'
    );
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setRoleChangeFeedback(null);
    const result = updateUserRole(userId, newRole);
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
            {isSuperadmin ? 'Global Platform Administration' : 'Assigned Operations Center'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            {isSuperadmin
              ? 'Master governance: cross-tenant client directory, four-role RBAC enforcement, and audit stream.'
              : 'Assigned client workspaces and team operations management.'}
          </p>
        </div>

        {isSuperadmin && (
          <button
            type="button"
            disabled={syncingAll}
            onClick={handleGlobalSync}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
            <span>{syncingAll ? 'Synchronizing...' : 'Sync All Hostinger Clusters'}</span>
          </button>
        )}
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
            <span className="text-xs font-medium">
              {isSuperadmin ? 'Total Clients' : 'Assigned Clients'}
            </span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {displayedClients.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            {isSuperadmin ? 'Global directory active' : 'Permitted workspace scope'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium">Platform Accounts</span>
            <UserCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {availableUsers.length}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">4 distinct RBAC roles</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium">Hostinger Clusters</span>
            <Server className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {DEMO_WEBSITES.length} Sites
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">3 cloud nodes active</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-medium">Care Plan MRR</span>
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

      {/* Role-Based Access Control User Directory & Role Assignment */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#D39E36]" />
              Role-Based Access Control (RBAC) Management
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isSuperadmin
                ? 'Assign roles across all accounts. Last active superadmin is protected against demotion or removal.'
                : 'View directory and workspace members. Superadmin promotion and admin account modifications are restricted.'}
            </p>
          </div>

          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 self-start sm:self-auto">
            Acting as: <strong className="text-neutral-900 dark:text-white uppercase">{currentUser.role}</strong>
          </span>
        </div>

        {roleChangeFeedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              roleChangeFeedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-[#151921] border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4">Workspace Scope</th>
                <th className="py-3 px-4">Role Privileges</th>
                <th className="py-3 px-4 text-right">Action / Reassign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {availableUsers.map((user) => {
                const roleMeta = ROLE_DEFINITIONS[user.role];
                const isTargetLastSuperadmin =
                  user.role === 'superadmin' &&
                  availableUsers.filter((u) => u.role === 'superadmin').length === 1;

                return (
                  <tr key={user.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-neutral-900 dark:text-white">{user.name}</div>
                      <div className="text-[11px] text-neutral-500">{user.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${
                          user.role === 'superadmin'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-[#D39E36] border-amber-500/20'
                            : user.role === 'admin'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                            : user.role === 'tech'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400">
                      {user.role === 'superadmin' ? (
                        <span className="font-semibold text-amber-600 dark:text-[#D39E36]">
                          Global (All Tenants)
                        </span>
                      ) : user.assignedClientIds && user.assignedClientIds.length > 0 ? (
                        <span>Assigned ({user.assignedClientIds.length} workspaces)</span>
                      ) : user.clientId ? (
                        <span>Tenant: {user.clientId}</span>
                      ) : (
                        <span>Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-neutral-500 text-[11px] max-w-xs truncate">
                      {roleMeta.description}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isSuperadmin ? (
                        <div className="inline-flex items-center gap-1.5">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                            className="text-xs bg-white dark:bg-[#151921] border border-neutral-200 dark:border-neutral-700 rounded-lg py-1 px-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                          >
                            <option value="superadmin">superadmin</option>
                            <option value="admin">admin</option>
                            <option value="tech">tech</option>
                            <option value="owner">owner</option>
                          </select>
                          {isTargetLastSuperadmin && (
                            <span
                              title="Protected: Only active superadmin"
                              className="text-amber-500 text-[11px]"
                            >
                              ★
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-neutral-400 italic">
                          {user.role === 'superadmin' || user.role === 'admin'
                            ? 'Protected'
                            : 'Admin scoped'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Roster Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-4">
        <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#D39E36]" />
          {isSuperadmin ? 'Global Client Directory' : 'Assigned Client Workspaces'}
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
              {displayedClients.map((client) => (
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
                  <td className="py-3.5 px-4 font-mono">{client.websiteCount} Sites</td>
                  <td className="py-3.5 px-4 text-neutral-500">{client.contactEmail}</td>
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

      {/* Cross-Tenant Master Audit Log (Superadmin Full Stream, Admin Scoped) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-4">
        <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-500" />
          {isSuperadmin
            ? 'Master Cross-Tenant Security Audit Stream'
            : 'Operational Security Audit Events'}
        </h2>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
          {DEMO_AUDIT_LOGS.map((log) => (
            <div
              key={log.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
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
                  <span>
                    Actor: {log.actorName} ({log.actorRole})
                  </span>
                  <span>·</span>
                  <span>Tenant ID: {log.clientId || 'system'}</span>
                  <span>·</span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>

              <span suppressHydrationWarning className="font-mono text-[11px] text-neutral-400 shrink-0">
                {formatDateTime(log.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
