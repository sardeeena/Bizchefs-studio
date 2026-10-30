'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Server,
  Zap,
  ArrowUpRight,
  Clock,
  Sparkles,
  LifeBuoy,
  CreditCard,
  AlertCircle,
} from 'lucide-react';

export default function ServicesPage() {
  const { currentClient, clientHosting } = useApp();

  const hostingService = clientHosting[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Active Services & Infrastructure
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Digital technology, hosting infrastructure, and monthly maintenance plans contracted for{' '}
          <span className="font-semibold text-neutral-900 dark:text-neutral-200">
            {currentClient?.name}
          </span>
          .
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Care Retainer */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold text-[#D39E36] uppercase tracking-wider">
                Active Client Care Retainer
              </span>
              <span className="font-bold text-sm text-neutral-900 dark:text-white font-mono">
                $300 / mo
              </span>
            </div>

            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              {currentClient?.activeCarePlan || 'Monthly Website Care — Dedicated Retainer'}
            </h2>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Continuous Next.js & React engineering maintenance, zero-downtime security patching, daily encrypted backups, and high-priority SLA assistance.
            </p>

            <ul className="mt-4 space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Continuous Next.js 15 & React 19 dependency updates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>24/7 edge uptime & Let&apos;s Encrypt SSL monitoring</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Up to 10 hours of included custom engineering requests</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Dedicated BizChefs engineering concierge</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-400">Status: Active Contract</span>
            <Link
              href="/support"
              className="text-[#D39E36] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Request Care Service</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Real Hostinger Cloud Infrastructure */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Verified Cloud Infrastructure
              </span>
              <span className="font-bold text-sm text-neutral-900 dark:text-white font-mono">
                Hostinger Order #{hostingService?.orderId || '1010240359'}
              </span>
            </div>

            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              {hostingService?.planName || 'Hostinger Business Web Hosting'}
            </h2>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Managed Node.js & web runtime in Frankfurt datacenter with edge CDN caching, HTTP/3 protocol, and Let&apos;s Encrypt automated TLS certificate issuance.
            </p>

            <ul className="mt-4 space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Datacenter: {hostingService?.datacenterLocation || 'Frankfurt, Germany'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Dedicated IP: {hostingService?.serverIp || '89.116.53.233'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Memory Allocation: {hostingService?.memoryMb || 4096} MB</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Disk Storage: {hostingService?.diskGb || 200} GB NVMe</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-400">Renewal: {hostingService?.renewalDate || '2027-10-24'}</span>
            <Link
              href="/websites"
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Manage Virtual Hosts</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Honest Billing & Payment Processor Status Notice (Phase 5K) */}
      <div className="p-5 rounded-2xl bg-neutral-100 dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 text-xs space-y-2">
        <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
          <CreditCard className="w-4 h-4 text-neutral-500" />
          <span>Billing & Payment Gateway Configuration</span>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11px]">
          Client care retainers and cloud infrastructure invoices are settled via direct commercial bank transfer or BizChefs corporate billing. Automated self-serve credit card processing (Stripe / Paddle) is not enabled on this environment. Invoices are neither simulated nor auto-activated without verified payment receipt.
        </p>
      </div>
    </div>
  );
}
