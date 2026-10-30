'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
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
  Loader2,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function AccountPage() {
  const { currentUser, currentClient } = useApp();

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setLogsLoading(true);
      try {
        const res = await fetch(`/api/audit-logs?clientId=${currentClient?.id || 'client_bizchefs'}`);
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
    loadLogs();
  }, [currentClient?.id]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword.length < 8) {
      setPasswordFeedback({
        type: 'error',
        message: 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        message: 'Passwords do not match.',
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordFeedback({
          type: 'error',
          message: data.message || 'Failed to update password.',
        });
      } else {
        setPasswordFeedback({
          type: 'success',
          message: 'Password successfully updated.',
        });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordFeedback({
        type: 'error',
        message: 'Network error while updating password.',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Account & Organization Security
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Identity, client organization profile, and security controls for{' '}
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
              Organization & Identity Profile
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
                Service Retainer Tier
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold uppercase mt-1 block">
                {currentClient?.tier}
              </span>
            </div>

            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                Authenticated User
              </span>
              <span className="font-medium text-neutral-900 dark:text-white mt-1 block">
                {currentUser.name}
              </span>
            </div>

            <div>
              <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                Assigned Role
              </span>
              <span className="font-mono uppercase font-semibold text-[#D39E36] mt-1 block">
                {currentUser.role}
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-neutral-400 block text-[10px] uppercase font-mono">
                Account Email
              </span>
              <span className="font-mono text-neutral-800 dark:text-neutral-200 mt-1 block">
                {currentUser.email}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <Key className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
              Change Account Password
            </h2>
          </div>

          {passwordFeedback && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                passwordFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50'
                  : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50'
              }`}
            >
              {passwordFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              )}
              <span>{passwordFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2 px-4 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {passwordLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Update Password</span>
            </button>
          </form>
        </div>
      </div>

      {/* Audit Trail Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-purple-500" />
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
              Workspace Audit Trail
            </h2>
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">
            {auditLogs.length} events logged
          </span>
        </div>

        {logsLoading ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#D39E36] mx-auto mb-1" />
            <span>Loading audit log events...</span>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            <p className="font-semibold text-neutral-800 dark:text-neutral-200">No audit events recorded yet</p>
            <p className="text-[11px] text-neutral-400 mt-1">
              Actions such as role modifications, credential updates, and support submissions are tracked in the database.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                <div>
                  <span className="font-semibold text-neutral-900 dark:text-white block font-mono">
                    {log.action}
                  </span>
                  <span className="text-neutral-500 text-[11px]">
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
