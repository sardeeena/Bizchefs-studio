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
} from 'lucide-react';

export default function ServicesPage() {
  const { currentClient, clientHosting } = useApp();

  const careServices = [
    {
      title: 'Monthly Website Care — Enterprise Tier',
      price: '$300 / month',
      status: 'Active Subscription',
      description:
        'Continuous Next.js & React engineering maintenance, zero-downtime security patching, daily encrypted off-site backups, and high-priority 4-hour SLA.',
      features: [
        'Continuous Next.js & React dependency updates',
        'Automated daily off-site database & static backups',
        '24/7 edge uptime & SSL monitoring with instant SMS/Slack alerts',
        'Up to 10 hours of included engineering requests per month',
        'Google Analytics 4 & Search Console quarterly performance audit',
      ],
    },
    {
      title: 'Hostinger Cloud Startup Infrastructure',
      price: '$29.99 / month',
      status: 'Active Infrastructure',
      description:
        'Dedicated NVMe storage, 3GB RAM, 2 CPU cores in Frankfurt datacenter with edge CDN caching and unlimited bandwidth.',
      features: [
        '3GB dedicated memory + 200GB NVMe storage',
        'Hostinger Edge CDN with HTTP/3 & Brotli compression',
        'Automatic Let\'s Encrypt SSL renewal',
        'Isolated containerized environment with dedicated IP',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Active Services & Website Care
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
        {careServices.map((svc) => (
          <div
            key={svc.title}
            className="p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-semibold text-[#D39E36] uppercase tracking-wider">
                  {svc.status}
                </span>
                <span className="font-bold text-sm text-neutral-900 dark:text-white font-mono">
                  {svc.price}
                </span>
              </div>

              <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                {svc.title}
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                {svc.description}
              </p>

              <div className="space-y-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
                  Included Capabilities
                </span>
                {svc.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-neutral-500">Billed monthly via BizChefs</span>
              <Link
                href="/support"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>Request Plan Change</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* SLA & Uptime Commitment Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
        <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white mb-1 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          BizChefs Service Level Agreement (SLA)
        </h2>
        <p className="text-xs text-neutral-500 mb-4">
          Guaranteed uptime, incident response benchmarks, and disaster recovery commitments.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#181d27] border border-neutral-100 dark:border-neutral-800">
            <span className="text-neutral-400 block text-[10px] uppercase font-mono">
              Uptime Guarantee
            </span>
            <span className="text-xl font-bold text-neutral-900 dark:text-white mt-1 block">
              99.9%
            </span>
            <span className="text-neutral-500 text-[11px] mt-0.5 block">
              Backed by financial SLA credits
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#181d27] border border-neutral-100 dark:border-neutral-800">
            <span className="text-neutral-400 block text-[10px] uppercase font-mono">
              Critical Response Time
            </span>
            <span className="text-xl font-bold text-neutral-900 dark:text-white mt-1 block">
              &lt; 2 Hours
            </span>
            <span className="text-neutral-500 text-[11px] mt-0.5 block">
              Emergency engineer on-call
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#181d27] border border-neutral-100 dark:border-neutral-800">
            <span className="text-neutral-400 block text-[10px] uppercase font-mono">
              Disaster Recovery RTO
            </span>
            <span className="text-xl font-bold text-neutral-900 dark:text-white mt-1 block">
              &lt; 30 Minutes
            </span>
            <span className="text-neutral-500 text-[11px] mt-0.5 block">
              Automated image & database restoration
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
