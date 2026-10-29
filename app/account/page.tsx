'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { DEMO_AUDIT_LOGS, DEMO_USERS } from '@/lib/data/mock-db';
import {
  UserCircle,
  Building2,
  ShieldCheck,
  Key,
  Users,
  History,
  Lock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function AccountPage() {
  const { currentUser, currentClient } = useApp();

  const clientLogs = DEMO_AUDIT_LOGS.filter(
    (log) => !log.clientId || log.clientId === (currentClient?.id || 'client_kemet')
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Account & Organization Security
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Identity, client team memberships, and audit trail for{' '}
          <span className="font-semibold text-neutral-900 dark:text-neutral-200">
            {currentClient?.name}
          </span>
          .
        </p>
      </div>

      {/* Grid: Profile & Security Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization & Profile Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <Building2 className="w-4 h-4 text-[#D39E36]" />
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
              Organization Profile
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                Organization Name
              </span>
              <span className="font-bold text-neutral-900 dark:text-white mt-1 block">
                {currentClient?.name}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                Care Subscription Tier
              </span>
              <span className="font-semibold text-[#D39E36] mt-1 block capitalize">
                {currentClient?.tier} Tier
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                Billing & Contact Email
              </span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200 mt-1 block">
                {currentClient?.contactEmail}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                Concierge Hotline
              </span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200 mt-1 block font-mono">
                {currentClient?.contactPhone}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-2">
              Authorized Team Members
            </span>
            <div className="space-y-2">
              {DEMO_USERS.filter((u) => u.clientId === currentClient?.id).map((member) => (
                <div
                  key={member.id}
                  className="p-3 rounded-xl bg-neutral-50 dark:bg-[#181d27] border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white">
                      {member.name}
                    </div>
                    <div className="text-[11px] text-neutral-400">{member.email}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    {member.role.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security & Access Controls */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
              Security & Environment Isolation
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#181d27] border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-neutral-900 dark:text-white block">
                  Two-Factor Authentication (2FA)
                </span>
                <span className="text-[11px] text-neutral-400">
                  Enforced for all client account owners
                </span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#181d27] border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-neutral-900 dark:text-white block">
                  Hostinger API Credentials
                </span>
                <span className="text-[11px] text-neutral-400">
                  Server-side encrypted token; never sent to browser
                </span>
              </div>
              <span className="text-blue-600 dark:text-blue-400 font-semibold text-[11px] flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                Protected
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#181d27] border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-neutral-900 dark:text-white block">
                  Session Timeout Policy
                </span>
                <span className="text-[11px] text-neutral-400">
                  Automatic logout after 24 hours of inactivity
                </span>
              </div>
              <span className="font-mono text-neutral-700 dark:text-neutral-300 text-[11px]">
                24 Hours
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-neutral-500" />
            Security Audit Trail
          </h2>
          <span className="text-xs text-neutral-400">Immutable Compliance Logs</span>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
          {clientLogs.map((log) => (
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
                  <span>Actor: {log.actorName}</span>
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
