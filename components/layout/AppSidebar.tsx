'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Globe,
  Network,
  Cpu,
  FolderKanban,
  LifeBuoy,
  UserCircle,
  ShieldCheck,
  ChevronDown,
  Building2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { ROLE_DEFINITIONS } from '@/lib/auth/roles';

interface AppSidebarProps {
  onCloseMobile?: () => void;
}

export function AppSidebar({ onCloseMobile }: AppSidebarProps) {
  const pathname = usePathname();
  const {
    currentUser,
    setCurrentUser,
    availableUsers,
    currentClient,
    setCurrentClient,
    accessibleClients,
  } = useApp();

  const isSuperadmin = currentUser.role === 'superadmin';
  const isAdmin = currentUser.role === 'admin';
  const isStaff = isSuperadmin || isAdmin;

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Websites', href: '/websites', icon: Globe },
    { label: 'Domains', href: '/domains', icon: Network },
    { label: 'Services & Care', href: '/services', icon: Cpu },
    { label: 'Projects', href: '/projects', icon: FolderKanban },
    { label: 'Support & Tickets', href: '/support', icon: LifeBuoy },
    { label: 'Account & Security', href: '/account', icon: UserCircle },
    // Only superadmin and admin can access Admin Center
    ...(isStaff
      ? [{ label: 'Admin Center', href: '/admin', icon: ShieldCheck, adminOnly: true }]
      : []),
  ];

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-amber-500/10 text-amber-600 dark:text-[#D39E36] border-amber-500/20';
      case 'admin':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'tech':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'owner':
      default:
        return 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20';
    }
  };

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full bg-white dark:bg-[#0c0e12] border-r border-neutral-200 dark:border-neutral-800/80 transition-colors select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 group focus-visible:outline-2 focus-visible:outline-blue-600 rounded-md"
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

        <a
          href="https://bizchefs.com"
          target="_blank"
          rel="noopener noreferrer"
          title="Open BizChefs Main Website"
          className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors p-1"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Organization Scope / Client Switcher */}
      <div className="px-4 py-3 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3 h-3 text-neutral-400" />
            Client Account
          </span>
          {isSuperadmin && (
            <span className="text-[10px] text-amber-600 dark:text-[#D39E36] font-semibold">
              Global Scope
            </span>
          )}
          {isAdmin && (
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
              Assigned Scope
            </span>
          )}
          {currentUser.role === 'tech' && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Tech Scope
            </span>
          )}
        </div>

        {accessibleClients.length > 1 ? (
          <div className="relative">
            <select
              value={currentClient?.id}
              onChange={(e) => {
                const found = accessibleClients.find((c) => c.id === e.target.value);
                if (found) setCurrentClient(found);
              }}
              className="w-full text-xs font-semibold bg-white dark:bg-[#151921] border border-neutral-200 dark:border-neutral-700 rounded-lg py-1.5 pl-2.5 pr-7 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-600 appearance-none cursor-pointer truncate"
            >
              {accessibleClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        ) : (
          <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate py-1">
            {currentClient?.name || 'Client Portal'}
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors group ${
                isActive
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-white dark:text-neutral-950'
                      : 'text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-100'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.adminOnly && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider ${
                    isActive
                      ? 'bg-neutral-800 text-neutral-200 dark:bg-neutral-200 dark:text-neutral-800'
                      : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {isSuperadmin ? 'SUPER' : 'OPS'}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Demo Switcher & Current User Footer */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40">
        <div className="mb-2 px-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#D39E36]" />
            RBAC Persona Sandbox
          </span>
        </div>

        <div className="space-y-1 mb-2.5 max-h-36 overflow-y-auto">
          {availableUsers.map((user) => {
            const isCurrent = user.id === currentUser.id;
            const roleInfo = ROLE_DEFINITIONS[user.role];
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => setCurrentUser(user)}
                className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] transition-colors flex items-center justify-between ${
                  isCurrent
                    ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                }`}
              >
                <div className="truncate min-w-0 pr-1">
                  <div className="leading-tight truncate">{user.name}</div>
                  <div className="text-[9px] text-neutral-400 leading-tight truncate">
                    {roleInfo.label}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono uppercase border ${getRoleBadgeStyle(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Current User Card */}
        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800/80 flex items-center gap-2 px-1">
          <div className="w-7 h-7 rounded-full bg-[#151921] border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-xs font-semibold text-neutral-200 shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate flex items-center justify-between">
              <span className="truncate">{currentUser.name}</span>
            </div>
            <div className="text-[10px] text-neutral-500 truncate flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-[8.5px] px-1 py-0.2 rounded font-mono uppercase font-semibold border ${getRoleBadgeStyle(
                  currentUser.role
                )}`}
              >
                {currentUser.role}
              </span>
              <span className="truncate">{currentUser.email}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
