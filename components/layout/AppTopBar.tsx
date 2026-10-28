'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { useApp } from '@/context/AppContext';
import {
  Sun,
  Moon,
  Menu,
  Bell,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  ExternalLink,
} from 'lucide-react';

interface AppTopBarProps {
  onOpenMobileNav: () => void;
}

export function AppTopBar({ onOpenMobileNav }: AppTopBarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { notifications, markNotificationRead, searchQuery, setSearchQuery, currentClient } = useApp();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getBreadcrumbs = () => {
    const parts = (pathname || '').split('/').filter(Boolean);
    if (parts.length === 0) return [{ label: 'Dashboard', href: '/dashboard' }];

    return parts.map((part, index) => {
      const href = '/' + parts.slice(0, index + 1).join('/');
      let label = part.charAt(0).toUpperCase() + part.slice(1);
      if (part === 'websites') label = 'Websites';
      if (part === 'domains') label = 'Domains';
      if (part === 'services') label = 'Services & Care';
      if (part === 'projects') label = 'Projects';
      if (part === 'support') label = 'Support';
      if (part === 'account') label = 'Account';
      if (part === 'admin') label = 'Admin Center';
      if (part.startsWith('web_')) label = 'Website Overview';
      return { label, href };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 px-4 sm:px-6 bg-white/80 dark:bg-[#0c0e12]/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Mobile hamburger + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="md:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumbs" className="hidden sm:flex items-center gap-1.5 text-xs">
          <span className="text-neutral-400">{currentClient?.name || 'Client'}</span>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={bc.href}>
              {idx > 0 && <span className="text-neutral-300 dark:text-neutral-700">/</span>}
              <Link
                href={bc.href}
                className={`transition-colors truncate max-w-[160px] ${
                  idx === breadcrumbs.length - 1
                    ? 'text-neutral-900 dark:text-neutral-100 font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {bc.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right Controls: Global Search, Demo badge, Notification popover, Theme toggle */}
      <div className="flex items-center gap-2.5">
        {/* Global Search Bar */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search websites, domains..."
            className="w-full text-xs bg-neutral-100 dark:bg-[#151921] border border-neutral-200 dark:border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Demo Mode Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-[#D39E36] border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Demo Sandbox</span>
        </div>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="View notifications"
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/80 rounded-lg relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-[#0c0e12]" />
            )}
          </button>

          {/* Notification Menu */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 rounded font-mono">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-4">No notifications</p>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => markNotificationRead(item.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        item.read
                          ? 'border-transparent bg-transparent opacity-70'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#1a202c]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {item.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                        {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                        {item.type === 'info' && <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5 leading-snug">
                            {item.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/80 rounded-lg transition-colors"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
