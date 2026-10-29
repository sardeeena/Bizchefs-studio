'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-[#fafafa] dark:bg-[#0c0e12] text-neutral-600 dark:text-neutral-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-blue-600 rounded-lg group"
              aria-label="BizChefs Studio Home"
            >
              <div className="relative w-8 h-8 rounded-lg bg-neutral-100 dark:bg-[#151921] p-1 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0">
                <Image
                  src="/BizChefs-emblem-transparent.png"
                  alt="BizChefs Emblem"
                  width={26}
                  height={26}
                  className="object-contain dark:hidden"
                />
                <Image
                  src="/BizChefs-emblem-dark.png"
                  alt="BizChefs Emblem"
                  width={26}
                  height={26}
                  className="object-contain hidden dark:block"
                />
              </div>
              <div className="flex flex-col">
                <div className="text-base font-bold tracking-tight leading-none text-neutral-900 dark:text-white">
                  <span>Biz</span>
                  <span className="text-[#D39E36]">Chefs</span>
                </div>
                <span className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase mt-0.5">
                  Studio Portal
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md leading-relaxed">
              BizChefs Studio is the unified client operations portal for BizChefs technology clients. Manage custom websites, domains, Hostinger hosting, deployments, and connected analytics through one secure platform.
            </p>

            <div>
              <a
                href="https://bizchefs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:text-[#D39E36] transition-colors"
              >
                <span>Visit Main BizChefs Website</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider block mb-3">
              Platform
            </span>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/login"
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Client Login
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Register Account
                </Link>
              </li>
              <li>
                <Link
                  href="/forgot-password"
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Password Recovery
                </Link>
              </li>
              <li>
                <a
                  href="#features"
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Features & Capabilities
                </a>
              </li>
            </ul>
          </div>

          {/* Verified Legal & Contact */}
          <div>
            <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider block mb-3">
              Legal & Support
            </span>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://bizchefs.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>Terms of Service</span>
                  <ExternalLink className="w-2.5 h-2.5 text-neutral-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://bizchefs.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>Privacy Policy</span>
                  <ExternalLink className="w-2.5 h-2.5 text-neutral-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://bizchefs.com/services-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>Services Policy</span>
                  <ExternalLink className="w-2.5 h-2.5 text-neutral-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://bizchefs.com/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>Contact BizChefs</span>
                  <ExternalLink className="w-2.5 h-2.5 text-neutral-400" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Dynamic Year */}
        <div className="pt-8 border-t border-neutral-200/80 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>
            © <span suppressHydrationWarning>{currentYear}</span> BizChefs. All rights reserved.
          </p>
          <p>
            BizChefs Studio Platform · Secure Node.js Deployment on Hostinger Cloud
          </p>
        </div>
      </div>
    </footer>
  );
}
