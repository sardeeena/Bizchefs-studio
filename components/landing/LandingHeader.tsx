'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';
import {
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export function LandingHeader() {
  const { theme, mounted, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  // Check verified auth session on mount
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.authenticated && data.user) {
            setIsAuthenticated(true);
            setUserName(data.user.name || 'Client');
          }
        }
      } catch {
        // Not authenticated or network error
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#fafafa]/90 dark:bg-[#0c0e12]/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
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
              priority
            />
            <Image
              src="/BizChefs-emblem-dark.png"
              alt="BizChefs Emblem"
              width={26}
              height={26}
              className="object-contain hidden dark:block"
              priority
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

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="#features"
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors"
          >
            How It Works
          </Link>
          <a
            href="https://bizchefs.com/about"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <span>About BizChefs</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </a>
          <a
            href="https://bizchefs.com/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors"
          >
            Contact
          </a>
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={mounted ? `Switch to ${theme === 'light' ? 'dark' : 'light'} mode` : 'Toggle theme'}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            {mounted && theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-[#D39E36] dark:text-neutral-950 dark:hover:bg-[#c28f2e] transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Open My Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-[#D39E36] dark:text-neutral-950 dark:hover:bg-[#c28f2e] transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 shadow-xs"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger + Theme */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={mounted ? `Switch to ${theme === 'light' ? 'dark' : 'light'} mode` : 'Toggle theme'}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white rounded-lg"
          >
            {mounted && theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0e12] px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-2 text-sm font-medium">
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              How It Works
            </Link>
            <a
              href="https://bizchefs.com/about"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between"
            >
              <span>About BizChefs</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </a>
            <a
              href="https://bizchefs.com/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Contact
            </a>
          </nav>

          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-neutral-900 text-white dark:bg-[#D39E36] dark:text-neutral-950 text-center"
              >
                <UserCheck className="w-4 h-4" />
                <span>Open My Studio ({userName || 'Account'})</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 rounded-lg border border-neutral-300 dark:border-neutral-700"
                >
                  Login to Your Studio
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-semibold bg-neutral-900 text-white dark:bg-[#D39E36] dark:text-neutral-950 rounded-lg"
                >
                  Get Started (Register)
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
