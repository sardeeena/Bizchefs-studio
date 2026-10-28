'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Client,
  Website,
  DomainRecord,
  HostingService,
  Deployment,
  SupportTicket,
  NotificationItem,
} from '@/types';
import {
  DEMO_USERS,
  DEMO_CLIENTS,
  DEMO_WEBSITES,
  DEMO_DOMAINS,
  DEMO_HOSTING_SERVICES,
  DEMO_DEPLOYMENTS,
  DEMO_TICKETS,
  DEMO_NOTIFICATIONS,
} from '@/lib/data/mock-db';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  availableUsers: User[];
  currentClient: Client | null;
  setCurrentClient: (client: Client) => void;
  allClients: Client[];
  clientWebsites: Website[];
  clientDomains: DomainRecord[];
  clientHosting: HostingService[];
  clientDeployments: Deployment[];
  clientTickets: SupportTicket[];
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDemoMode: boolean;
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  triggerDeployment: (websiteId: string, commitMessage: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bizchefs_current_user_id');
      const found = DEMO_USERS.find((u) => u.id === saved);
      if (found) return found;
    }
    return DEMO_USERS[0]; // Sarah Mitchell by default
  });

  const [currentClientId, setCurrentClientId] = useState<string>(
    currentUser.clientId || DEMO_CLIENTS[0].id
  );

  const [tickets, setTickets] = useState<SupportTicket[]>(DEMO_TICKETS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEMO_NOTIFICATIONS);
  const [deployments, setDeployments] = useState<Deployment[]>(DEMO_DEPLOYMENTS);
  const [searchQuery, setSearchQuery] = useState('');


  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bizchefs_current_user_id', user.id);
    }
    if (user.clientId) {
      setCurrentClientId(user.clientId);
    }
  };

  const currentClient =
    DEMO_CLIENTS.find((c) => c.id === currentClientId) ||
    DEMO_CLIENTS.find((c) => c.id === currentUser.clientId) ||
    DEMO_CLIENTS[0];

  const setCurrentClient = (client: Client) => {
    setCurrentClientId(client.id);
  };

  // Filter tenant resources based on user role and selected client
  const clientWebsites =
    currentUser.role === 'super_admin' || currentUser.role === 'admin'
      ? DEMO_WEBSITES.filter((w) => w.clientId === currentClient.id)
      : DEMO_WEBSITES.filter((w) => w.clientId === currentUser.clientId);

  const clientDomains =
    currentUser.role === 'super_admin' || currentUser.role === 'admin'
      ? DEMO_DOMAINS.filter((d) => d.clientId === currentClient.id)
      : DEMO_DOMAINS.filter((d) => d.clientId === currentUser.clientId);

  const clientHosting =
    currentUser.role === 'super_admin' || currentUser.role === 'admin'
      ? DEMO_HOSTING_SERVICES.filter((h) => h.clientId === currentClient.id)
      : DEMO_HOSTING_SERVICES.filter((h) => h.clientId === currentUser.clientId);

  const clientDeployments = deployments.filter((d) => {
    const website = DEMO_WEBSITES.find((w) => w.id === d.websiteId);
    if (!website) return false;
    return currentUser.role === 'super_admin' || currentUser.role === 'admin'
      ? website.clientId === currentClient.id
      : website.clientId === currentUser.clientId;
  });

  const clientTickets = tickets.filter((t) => {
    return currentUser.role === 'super_admin' || currentUser.role === 'admin'
      ? t.clientId === currentClient.id
      : t.clientId === currentUser.clientId;
  });

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const addTicket = (newTicket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const created: SupportTicket = {
      ...newTicket,
      id: `tkt_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setTickets((prev) => [created, ...prev]);
  };

  const triggerDeployment = async (websiteId: string, commitMessage: string) => {
    const targetWebsite = DEMO_WEBSITES.find((w) => w.id === websiteId);
    if (!targetWebsite) return;

    const newDep: Deployment = {
      id: `dep_${Date.now()}`,
      websiteId,
      clientId: targetWebsite.clientId,
      commitHash: Math.random().toString(16).substring(2, 9),
      commitMessage,
      authorName: currentUser.name,
      status: 'building',
      durationSeconds: 0,
      deployedAt: new Date().toISOString(),
      environment: 'production',
      rollbackAvailable: false,
      buildLogs: [
        'Initiating containerized Next.js 15 production build...',
        'Checking host node compatibility and lockfile...',
        'Compiling static assets and Tailwind CSS tokens...',
      ],
    };

    setDeployments((prev) => [newDep, ...prev]);

    // Simulate build completion after 2 seconds
    setTimeout(() => {
      setDeployments((prev) =>
        prev.map((d) =>
          d.id === newDep.id
            ? {
                ...d,
                status: 'success',
                durationSeconds: 36,
                rollbackAvailable: true,
                buildLogs: [
                  ...(d.buildLogs || []),
                  'Build succeeded in 34.2s',
                  'Health check passed: HTTP 200 OK',
                  'Hostinger Edge CDN edge deployment synced.',
                ],
              }
            : d
        )
      );

      setNotifications((prev) => [
        {
          id: `notif_${Date.now()}`,
          clientId: targetWebsite.clientId,
          title: 'Deployment Live',
          message: `${targetWebsite.name} build for "${commitMessage}" is now live.`,
          type: 'success',
          read: false,
          createdAt: new Date().toISOString(),
          link: `/websites/${websiteId}/deployments`,
        },
        ...prev,
      ]);
    }, 2500);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availableUsers: DEMO_USERS,
        currentClient,
        setCurrentClient,
        allClients: DEMO_CLIENTS,
        clientWebsites,
        clientDomains,
        clientHosting,
        clientDeployments,
        clientTickets,
        notifications,
        markNotificationRead,
        searchQuery,
        setSearchQuery,
        isDemoMode: true,
        addTicket,
        triggerDeployment,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
