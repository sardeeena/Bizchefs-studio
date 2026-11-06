'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Server,
  GitBranch,
  Network,
  ShieldCheck,
  BarChart3,
  LifeBuoy,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Activity,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  Lock,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

interface FeatureShowcase {
  id: string;
  tag: string;
  title: string;
  headline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeText: string;
  specs: { label: string; value: string }[];
  highlights: string[];
  previewType: 'websites' | 'deployments' | 'dns' | 'rbac' | 'analytics' | 'support';
}

const FEATURE_SLIDES: FeatureShowcase[] = [
  {
    id: 'websites',
    tag: 'Cloud Infrastructure',
    title: 'Website Fleet & Cloud Runtime',
    headline: 'High-Availability Node.js & Next.js Fleet',
    description:
      'Oversee your custom Next.js 15 web applications and Node.js microservices hosted on verified Hostinger cloud infrastructure in Frankfurt EU-central datacenters with automated edge TLS certificates and 99.98% verified availability.',
    icon: Globe,
    accentColor: '#D39E36',
    badgeText: '99.98% Edge Uptime',
    specs: [
      { label: 'Datacenter', value: 'Frankfurt, Germany' },
      { label: 'Dedicated IP', value: '89.116.53.233' },
      { label: 'SSL Protocol', value: 'TLS 1.3 Auto-Renew' },
      { label: 'Runtime', value: 'Node.js 20 / Next.js 15' },
    ],
    highlights: [
      'Automated HTTP/3 edge caching and Brotli compression',
      'Real-time TLS expiration verification via Node socket probes',
      'Unified multi-domain management for client web assets',
    ],
    previewType: 'websites',
  },
  {
    id: 'deployments',
    tag: 'DevOps & CI/CD',
    title: 'Automated Deployment Pipelines',
    headline: 'Zero-Downtime Releases with Git Integration',
    description:
      'Track production GitHub release commits, automated webhooks, build durations, and server runtime health without blind manual FTP uploads or risky direct file edits.',
    icon: GitBranch,
    accentColor: '#3B82F6',
    badgeText: 'Git Webhook CI/CD',
    specs: [
      { label: 'Repository', value: 'sardeeena/Bizchefs-studio' },
      { label: 'Branch', value: 'main (Production)' },
      { label: 'Build Duration', value: '42s Optimized' },
      { label: 'Rollback', value: 'Instant One-Click' },
    ],
    highlights: [
      'Automated trigger on verified GitHub push events',
      'Comprehensive build log streaming and deployment audit trails',
      'Instant rollback safeguards for rapid incident mitigation',
    ],
    previewType: 'deployments',
  },
  {
    id: 'dns',
    tag: 'DNS & Edge Intelligence',
    title: 'Live DNS Inspector & Domain Concierge',
    headline: 'Authoritative Record Verification & Renewal Oversight',
    description:
      'Inspect authoritative A, NS, MX, and TXT records in real-time, monitor domain expiration timelines, and file domain changes directly with your dedicated BizChefs concierge.',
    icon: Network,
    accentColor: '#A855F7',
    badgeText: 'Authoritative DNS Query',
    specs: [
      { label: 'A Record', value: '89.116.53.233' },
      { label: 'Nameservers', value: 'Hostinger Premium DNS' },
      { label: 'Certificate', value: "Let's Encrypt TLS" },
      { label: 'Auto-Renew', value: 'Active Protection' },
    ],
    highlights: [
      'Direct Node.js dns/promises authoritative nameserver queries',
      'Concierge domain registration modal submitting to support backend',
      'Automated alerting 30 days prior to registration expiration',
    ],
    previewType: 'dns',
  },
  {
    id: 'rbac',
    tag: 'Security & Access Control',
    title: 'Four-Role RBAC & Multi-Tenant Isolation',
    headline: 'Strict Workspace Scoping & Last-Superadmin Defense',
    description:
      'Strict multi-tenant security architecture with exact permissions for Superadmin, Admin, Tech, and Owner accounts, backed by AES-256-GCM token encryption and Last-Superadmin safeguards.',
    icon: ShieldCheck,
    accentColor: '#10B981',
    badgeText: '4-Role Multi-Tenant Security',
    specs: [
      { label: 'Superadmin', value: 'Global Root & Audit' },
      { label: 'Admin', value: 'Workspace Management' },
      { label: 'Tech', value: 'Runtime & Pipelines' },
      { label: 'Owner', value: 'Business Portal & Care' },
    ],
    highlights: [
      'Tenant isolation preventing cross-client resource visibility',
      'Hardened Last-Superadmin protection preventing accidental lockout',
      'Encrypted token vault using AES-256-GCM authenticated ciphers',
    ],
    previewType: 'rbac',
  },
  {
    id: 'analytics',
    tag: 'Verified Telemetry',
    title: 'Google Analytics 4 & Search Console',
    headline: 'Authentic Performance Data via Direct Google OAuth',
    description:
      'Connect your verified Google account via standard OAuth 2.0. No fabricated visitor graphs, no mock vanity metrics, and clear honest indicators when disconnected.',
    icon: BarChart3,
    accentColor: '#F59E0B',
    badgeText: 'Official Google OAuth 2.0',
    specs: [
      { label: 'Analytics Engine', value: 'Google Analytics 4 Data API' },
      { label: 'Search Telemetry', value: 'Google Search Console API' },
      { label: 'Integration Type', value: 'Client-Side PKCE OAuth' },
      { label: 'Fabricated Data', value: 'Zero (Strict Policy)' },
    ],
    highlights: [
      'Direct client-side OAuth flow preserving user account control',
      'Honest unlinked state instead of fake demo data placeholders',
      'Verified organic keyword rankings and impression CTR trends',
    ],
    previewType: 'analytics',
  },
  {
    id: 'support',
    tag: 'Concierge & SLA Care',
    title: 'Dedicated Concierge & Care Contracts',
    headline: 'Direct Senior Engineering Support & Continuous Care',
    description:
      'Open priority tickets and threaded messages directly with BizChefs senior developers for Next.js dependency updates, emergency incident response, and active Care subscriptions.',
    icon: LifeBuoy,
    accentColor: '#EF4444',
    badgeText: 'Priority SLA Concierge',
    specs: [
      { label: 'Care Status', value: 'Active Engineering Plan' },
      { label: 'Response Target', value: '< 2 Hours Priority' },
      { label: 'Included Hours', value: '10h / Month Custom Code' },
      { label: 'Engineering Lead', value: 'BizChefs Senior Concierge' },
    ],
    highlights: [
      'Threaded conversational messages persisted to database backend',
      'Full ticket lifecycle management (Open, In Progress, Resolved)',
      'Continuous React 19 and Next.js 15 security patch updates',
    ],
    previewType: 'support',
  },
];

const AUTOPLAY_INTERVAL_MS = 5000;

export function LandingFeatures() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % FEATURE_SLIDES.length);
    setProgress(0);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + FEATURE_SLIDES.length) % FEATURE_SLIDES.length);
    setProgress(0);
  }, []);

  const selectSlide = (index: number) => {
    setActiveIndex(index);
    setProgress(0);
  };

  // Autoplay progression timer
  useEffect(() => {
    if (isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const intervalStepMs = 50;
    const increment = (intervalStepMs / AUTOPLAY_INTERVAL_MS) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + increment;
      });
    }, intervalStepMs);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPaused, nextSlide]);

  const activeFeature = FEATURE_SLIDES[activeIndex];
  const ActiveIcon = activeFeature.icon;

  return (
    <section
      id="features"
      className="py-20 sm:py-28 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-[#0b0e14]/70 transition-colors relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#D39E36]/5 dark:bg-[#D39E36]/8 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#131722] border border-neutral-200/90 dark:border-neutral-800 text-xs font-semibold tracking-wider uppercase text-neutral-600 dark:text-neutral-400 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#D39E36] animate-pulse" />
            <span>Interactive Studio Showcase</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
            Engineered for Precision. <br className="hidden sm:inline" />
            <span className="text-[#D39E36]">Built for Real Operations.</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Explore how BizChefs Studio unifies cloud servers, DNS records, deployment pipelines, multi-role security, and client care into one continuous command interface.
          </p>
        </div>

        {/* Screen-reader accessible tablist to preserve accessibility & tab navigation */}
        <div className="sr-only" role="tablist" aria-label="Feature slides">
          {FEATURE_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              onClick={() => selectSlide(idx)}
            >
              {slide.title}
            </button>
          ))}
        </div>

        {/* Animated Fading Feature Card Showcase Container */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative min-h-[460px] sm:min-h-[440px] rounded-3xl bg-white dark:bg-[#11151f] border border-neutral-200/90 dark:border-neutral-800 shadow-xl overflow-hidden transition-all duration-300"
        >
          {/* Subtle top ambient gradient matching active feature */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#D39E36]/10 via-transparent to-transparent pointer-events-none rounded-bl-full" />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature.id}
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.995 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Left Column (6 cols): Capability Briefing */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#D39E36]/10 text-[#D39E36] flex items-center justify-center font-bold border border-[#D39E36]/20">
                      <ActiveIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#D39E36] block">
                        {activeFeature.tag}
                      </span>
                      <span className="text-xs text-neutral-400 font-medium">
                        BizChefs Studio Capability Module
                      </span>
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
                    {activeFeature.headline}
                  </h3>

                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-3 leading-relaxed">
                    {activeFeature.description}
                  </p>
                </div>

                {/* Technical Specifications Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {activeFeature.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="p-3 rounded-xl bg-neutral-50 dark:bg-[#161a25] border border-neutral-200/80 dark:border-neutral-800"
                    >
                      <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-0.5">
                        {spec.label}
                      </span>
                      <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate block">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Key Capability Checkpoints */}
                <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300 pt-1">
                  {activeFeature.highlights.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Direct Action Link */}
                <div className="pt-2 flex items-center gap-4 text-xs">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 font-semibold text-[#D39E36] hover:underline"
                  >
                    <span>Deploy with BizChefs Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column (6 cols): Live Feature Micro-Interface */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#141824] shadow-inner p-5 sm:p-6 space-y-4">
                  {/* Top Bar of Micro UI */}
                  <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800 pb-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold text-neutral-900 dark:text-white font-mono text-[11px]">
                        LIVE RUNTIME TELEMETRY
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-[#1a202f] border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300">
                      {activeFeature.badgeText}
                    </span>
                  </div>

                  {/* Dynamic Micro UI depending on previewType */}
                  {activeFeature.previewType === 'websites' && (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#10141e] border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                            erp.bizchefs.com
                          </span>
                          <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                            HTTP 200 OK
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-neutral-500 flex justify-between">
                          <span>Next.js 15 · TLS 1.3</span>
                          <span>Frankfurt Datacenter</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#10141e] border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                            studio.bizchefs.com
                          </span>
                          <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                            HTTP 200 OK
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-neutral-500 flex justify-between">
                          <span>Client Portal · Let&apos;s Encrypt</span>
                          <span>89.116.53.233</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#10141e] border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                            bizchefs.com
                          </span>
                          <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                            HTTP 200 OK
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-neutral-500 flex justify-between">
                          <span>Brand Flagship · Edge CDN</span>
                          <span>HTTP/3 Active</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeFeature.previewType === 'deployments' && (
                    <div className="space-y-3 font-mono text-xs">
                      <div className="p-3 rounded-xl bg-neutral-900 text-neutral-200 border border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-neutral-400 border-b border-neutral-800 pb-1.5">
                          <span>$ git log --oneline -n 1</span>
                          <span className="text-emerald-400">BUILD: SUCCESS</span>
                        </div>
                        <div className="text-[11px] text-white">
                          commit 4f9a2e1 (HEAD -&gt; main)
                        </div>
                        <div className="text-[10px] text-neutral-400 leading-relaxed">
                          Core dependencies sync: Next.js 15.5.28 &amp; Supabase SSR v0.12
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-[#10141e] border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-white text-[11px]">
                            Production Release #814
                          </div>
                          <div className="text-[10px] text-neutral-400">Deployed 42s ago by CI/CD</div>
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 rounded">
                          Active Rollout
                        </span>
                      </div>
                    </div>
                  )}

                  {activeFeature.previewType === 'dns' && (
                    <div className="space-y-2.5 font-mono text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-[#10141e] border border-neutral-200/80 dark:border-neutral-800 flex justify-between items-center">
                        <div>
                          <div className="text-[10px] text-neutral-400 uppercase">A Record (IPv4)</div>
                          <div className="font-semibold text-neutral-900 dark:text-white">89.116.53.233</div>
                        </div>
                        <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                          Authoritative
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-[#10141e] border border-neutral-200/80 dark:border-neutral-800 flex justify-between items-center">
                        <div>
                          <div className="text-[10px] text-neutral-400 uppercase">Nameservers</div>
                          <div className="font-semibold text-neutral-900 dark:text-white">artemis.dns-parking.com</div>
                        </div>
                        <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                          Managed
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-[#10141e] border border-neutral-200/80 dark:border-neutral-800 flex justify-between items-center">
                        <div>
                          <div className="text-[10px] text-neutral-400 uppercase">SSL Certificate</div>
                          <div className="font-semibold text-emerald-600 dark:text-emerald-400">Let&apos;s Encrypt TLS 1.3</div>
                        </div>
                        <span className="text-[10px] text-neutral-500">Exp. Jan 2027</span>
                      </div>
                    </div>
                  )}

                  {activeFeature.previewType === 'rbac' && (
                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-[#10141e] border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-neutral-900 dark:text-white block">Superadmin Role</span>
                          <span className="text-[10px] text-neutral-400 font-mono">Platform root · Audit log oversight</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">
                          LEVEL 4
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-[#10141e] border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-neutral-900 dark:text-white block">Admin &amp; Operations</span>
                          <span className="text-[10px] text-neutral-400 font-mono">Tenant workspace scoping · Team delegator</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">
                          LEVEL 3
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-[#10141e] border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-neutral-900 dark:text-white block">Tech &amp; Client Owner</span>
                          <span className="text-[10px] text-neutral-400 font-mono">Runtime access &amp; Care requests</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                          LEVEL 1-2
                        </span>
                      </div>
                    </div>
                  )}

                  {activeFeature.previewType === 'analytics' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#10141e] border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900 dark:text-white">Google Analytics 4</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                            OAuth Connected
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          Direct client-side PKCE authentication for verified real-time audience metrics.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#10141e] border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900 dark:text-white">Search Console</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-semibold">
                            Index Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          Real search impressions, click-through rates, and canonical URL validation.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeFeature.previewType === 'support' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-white dark:bg-[#10141e] border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900 dark:text-white">
                            Ticket #TK-2026-0814
                          </span>
                          <span className="text-[10px] font-mono font-bold uppercase text-[#D39E36] bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                            In Progress
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                          Subject: Quarterly security audit and Next.js 15 canary patch validation.
                        </p>
                        <div className="text-[10px] font-mono text-neutral-400 flex justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800">
                          <span>Assigned: BizChefs Lead</span>
                          <span>Priority: High</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-neutral-100 dark:bg-[#181d28] border border-neutral-200/80 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300 italic">
                        &quot;All 19 security assertions verified. Edge TLS certificates active and synchronized.&quot;
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-3xl bg-neutral-900 text-white dark:bg-[#141824] dark:border dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Ready to access your digital workspace?
            </h4>
            <p className="text-xs sm:text-sm text-neutral-400">
              Sign in with your authorized client credentials or request a new client workspace onboarding.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#D39E36] text-neutral-950 hover:bg-[#c28f2e] transition-colors shadow-md"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors"
            >
              <span>Login to Studio</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
