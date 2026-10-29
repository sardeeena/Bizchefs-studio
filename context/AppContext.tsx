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
  UserRole,
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
import { canAccessWorkspace, canModifyUserRole } from '@/lib/auth/authorize';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  availableUsers: User[];
  currentClient: Client;
  setCurrentClient: (client: Client) => void;
  allClients: Client[];
  accessibleClients: Client[];
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
  updateUserRole: (targetUserId: string, newRole: UserRole) => { success: boolean; error?: string };
  toggleTaskStatus: (taskId: string) => { success: boolean; error?: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(DEMO_USERS);

  const [currentUser, setCurrentUserState] = useState<User>(DEMO_USERS[0]);
  const [currentClientId, setCurrentClientId] = useState<string>(DEMO_CLIENTS[0].id);

  const [tickets, setTickets] = useState<SupportTicket[]>(DEMO_TICKETS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEMO_NOTIFICATIONS);
  const [deployments, setDeployments] = useState<Deployment[]>(DEMO_DEPLOYMENTS);
  const [searchQuery, setSearchQuery] = useState('');

  // Hydrate user session asynchronously after mount (client-side only)
  useEffect(() => {
    async function hydrateSession() {
      let remoteAuthenticated = false;
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            remoteAuthenticated = true;
            setCurrentUserState(data.user);
            if (data.currentClient) {
              setCurrentClientId(data.currentClient.id);
            }
          }
        }
      } catch {
        // Fallback to local session
      }

      if (!remoteAuthenticated) {
        try {
          const saved = localStorage.getItem('bizchefs_current_user_id');
          if (saved) {
            const found = DEMO_USERS.find((u) => u.id === saved);
            if (found) {
              setCurrentUserState(found);
              if (found.clientId) {
                setCurrentClientId(found.clientId);
              } else if (found.assignedClientIds && found.assignedClientIds.length > 0) {
                setCurrentClientId(found.assignedClientIds[0]);
              }
            }
          }
        } catch {
          // Ignore storage access error
        }
      }
    }

    hydrateSession();
  }, []);

  const setCurrentUser = (user: User) => {
    // Refresh user from current users state if available
    const freshUser = users.find((u) => u.id === user.id) || user;
    setCurrentUserState(freshUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bizchefs_current_user_id', freshUser.id);
    }
    if (freshUser.clientId) {
      setCurrentClientId(freshUser.clientId);
    } else if (freshUser.assignedClientIds && freshUser.assignedClientIds.length > 0) {
      if (!freshUser.assignedClientIds.includes(currentClientId)) {
        setCurrentClientId(freshUser.assignedClientIds[0]);
      }
    }
  };

  // Filter clients accessible to the current user
  const accessibleClients = DEMO_CLIENTS.filter((c) =>
    canAccessWorkspace(currentUser, c.id)
  );

  // Active client selection ensuring user has workspace clearance
  const currentClient =
    (currentUser.role === 'owner'
      ? DEMO_CLIENTS.find((c) => c.id === currentUser.clientId)
      : accessibleClients.find((c) => c.id === currentClientId)) ||
    accessibleClients[0] ||
    DEMO_CLIENTS[0];

  const setCurrentClient = (client: Client) => {
    if (canAccessWorkspace(currentUser, client.id)) {
      setCurrentClientId(client.id);
    }
  };

  // Filter tenant resources strictly based on workspace scoping
  const clientWebsites = DEMO_WEBSITES.filter(
    (w) => w.clientId === currentClient.id && canAccessWorkspace(currentUser, w.clientId)
  );

  const clientDomains = DEMO_DOMAINS.filter(
    (d) => d.clientId === currentClient.id && canAccessWorkspace(currentUser, d.clientId)
  );

  const clientHosting = DEMO_HOSTING_SERVICES.filter(
    (h) => h.clientId === currentClient.id && canAccessWorkspace(currentUser, h.clientId)
  );

  const clientDeployments = deployments.filter((d) => {
    const website = DEMO_WEBSITES.find((w) => w.id === d.websiteId);
    if (!website) return false;
    return (
      website.clientId === currentClient.id &&
      canAccessWorkspace(currentUser, website.clientId)
    );
  });

  const clientTickets = tickets.filter(
    (t) => t.clientId === currentClient.id && canAccessWorkspace(currentUser, t.clientId)
  );

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
    // Only tech, admin, superadmin can trigger deployments
    if (currentUser.role === 'owner') {
      throw new Error('FORBIDDEN: Owners have read-only access to deployments');
    }

    const targetWebsite = DEMO_WEBSITES.find((w) => w.id === websiteId);
    if (!targetWebsite) return;

    const newDep: Deployment = {
      id: `dep_${Date.now()}`,
      websiteId,
      clientId: targetWebsite.clientId,
      commitHash: Math.random().toString(16).substring(2, 9),
      commitMessage,
      authorName: currentUser.name,
      status: 'success',
      durationSeconds: 32,
      deployedAt: new Date().toISOString(),
      environment: 'production',
      rollbackAvailable: true,
      buildLogs: [
        'Containerized Next.js production build initialized.',
        'Production asset manifest verified.',
        'Hostinger edge reverse proxy synced successfully.',
      ],
    };

    setDeployments((prev) => [newDep, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        clientId: targetWebsite.clientId,
        title: 'Deployment Live',
        message: `${targetWebsite.name} build for "${commitMessage}" deployed.`,
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
        link: `/websites/${websiteId}/deployments`,
      },
      ...prev,
    ]);
  };

  const updateUserRole = (
    targetUserId: string,
    newRole: UserRole
  ): { success: boolean; error?: string } => {
    const target = users.find((u) => u.id === targetUserId);
    if (!target) {
      return { success: false, error: 'Target user not found' };
    }

    const check = canModifyUserRole(currentUser, target, newRole, users);
    if (!check.allowed) {
      return { success: false, error: check.reason || 'Permission denied' };
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
    );

    // If current user modified themselves
    if (currentUser.id === targetUserId) {
      setCurrentUserState((prev) => ({ ...prev, role: newRole }));
    }

    return { success: true };
  };

  const toggleTaskStatus = (taskId: string): { success: boolean; error?: string } => {
    // Owner cannot edit tasks (read-only)
    if (currentUser.role === 'owner') {
      return {
        success: false,
        error: 'FORBIDDEN: Client owners have read-only access to roadmap tasks.',
      };
    }
    // Tech, Admin, Superadmin can toggle
    return { success: true };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availableUsers: users,
        currentClient,
        setCurrentClient,
        allClients: DEMO_CLIENTS,
        accessibleClients,
        clientWebsites,
        clientDomains,
        clientHosting,
        clientDeployments,
        clientTickets,
        notifications,
        markNotificationRead,
        searchQuery,
        setSearchQuery,
        isDemoMode: false,
        addTicket,
        triggerDeployment,
        updateUserRole,
        toggleTaskStatus,
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
