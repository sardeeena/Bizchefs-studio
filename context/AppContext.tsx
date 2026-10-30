'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { canAccessWorkspace } from '@/lib/auth/authorize';

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
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  triggerDeployment: (websiteId: string, commitMessage: string) => Promise<void>;
  updateUserRole: (targetUserId: string, newRole: UserRole) => Promise<{ success: boolean; error?: string }>;
  toggleTaskStatus: (taskId: string) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;
}

const DEFAULT_CLIENT: Client = {
  id: 'client_bizchefs',
  name: 'BizChefs Digital Studio',
  slug: 'bizchefs-studio',
  tier: 'enterprise',
  status: 'active',
  contactEmail: 'contact@bizchefs.com',
  contactPhone: '+20 128 171 9903',
  websiteCount: 5,
  domainCount: 5,
  activeCarePlan: 'Monthly Website Care — Dedicated Retainer ($600/mo)',
  createdAt: '2026-10-24T00:00:00Z',
};

const INITIAL_USER: User = {
  id: 'usr_owner_default',
  email: 'client@bizchefs.com',
  name: 'BizChefs Client',
  role: 'owner',
  clientId: 'client_bizchefs',
  createdAt: '2026-10-28T00:00:00Z',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [currentClient, setCurrentClient] = useState<Client>(DEFAULT_CLIENT);
  const [allClients, setAllClients] = useState<Client[]>([DEFAULT_CLIENT]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([INITIAL_USER]);

  const [websites, setWebsites] = useState<Website[]>([]);
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [hosting, setHosting] = useState<HostingService[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Hydrate user session from /api/auth/me and load real platform data
  const refreshData = useCallback(async () => {
    try {
      // 1. Session check
      const authRes = await fetch('/api/auth/me');
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.authenticated && authData.user) {
          setCurrentUser(authData.user);
          if (authData.clients && authData.clients.length > 0) {
            setAllClients(authData.clients);
          }
          if (authData.currentClient) {
            setCurrentClient(authData.currentClient);
          }
        }
      }
    } catch {
      // Network failure on auth
    }

    // 2. Load real websites from /api/websites
    try {
      const webRes = await fetch('/api/websites');
      if (webRes.ok) {
        const webData = await webRes.json();
        if (webData.success && Array.isArray(webData.data)) {
          setWebsites(webData.data);
        }
      }
    } catch {
      // Ignore
    }

    // 3. Load real domains from /api/domains
    try {
      const domRes = await fetch('/api/domains');
      if (domRes.ok) {
        const domData = await domRes.json();
        if (domData.success && Array.isArray(domData.data)) {
          setDomains(domData.data);
        }
      }
    } catch {
      // Ignore
    }

    // 4. Load real hosting subscriptions from /api/hosting
    try {
      const hostRes = await fetch('/api/hosting');
      if (hostRes.ok) {
        const hostData = await hostRes.json();
        if (hostData.success && Array.isArray(hostData.data)) {
          setHosting(hostData.data);
        }
      }
    } catch {
      // Ignore
    }

    // 5. Load real tickets from /api/support/tickets
    try {
      const tktRes = await fetch('/api/support/tickets');
      if (tktRes.ok) {
        const tktData = await tktRes.json();
        if (tktData.success && Array.isArray(tktData.data)) {
          setTickets(tktData.data);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const initialize = async () => {
      if (!ignore) {
        await refreshData();
      }
    };
    void initialize();
    return () => {
      ignore = true;
    };
  }, [refreshData]);

  const accessibleClients = allClients.filter((c) => canAccessWorkspace(currentUser, c.id));

  const clientWebsites = websites.filter(
    (w) => !w.clientId || w.clientId === currentClient.id || canAccessWorkspace(currentUser, w.clientId)
  );

  const clientDomains = domains.filter(
    (d) => !d.clientId || d.clientId === currentClient.id || canAccessWorkspace(currentUser, d.clientId)
  );

  const clientHosting = hosting.filter(
    (h) => !h.clientId || h.clientId === currentClient.id || canAccessWorkspace(currentUser, h.clientId)
  );

  const clientDeployments = deployments;

  const clientTickets = tickets.filter(
    (t) => !t.clientId || t.clientId === currentClient.id || canAccessWorkspace(currentUser, t.clientId)
  );

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const addTicket = async (newTicket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTicket,
          clientId: currentClient.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setTickets((prev) => [data.data, ...prev]);
        }
      }
    } catch {
      // Local fallback
      const now = new Date().toISOString();
      const created: SupportTicket = {
        ...newTicket,
        id: `tkt_${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      setTickets((prev) => [created, ...prev]);
    }
  };

  const triggerDeployment = async (websiteId: string, commitMessage: string) => {
    if (currentUser.role === 'owner') {
      throw new Error('FORBIDDEN: Owners have read-only access to deployments');
    }

    // Deployments must use verified webhooks, not simulated random hashes
    throw new Error(
      'DEPLOYMENT_NOTICE: Automated builds are triggered via authorized GitHub repository webhooks. Direct manual push via REST API requires GitHub webhook secret verification.'
    );
  };

  const updateUserRole = async (targetUserId: string, newRole: UserRole) => {
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, newRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || 'Failed to update user role' };
      }

      setAvailableUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
      );
      if (currentUser.id === targetUserId) {
        setCurrentUser((prev) => ({ ...prev, role: newRole }));
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return { success: false, error: msg };
    }
  };

  const toggleTaskStatus = async (taskId: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: 'completed' }),
      });
      if (res.ok) {
        return { success: true };
      }
      return { success: false, error: 'Failed to update task status in database' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Task error';
      return { success: false, error: msg };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availableUsers,
        currentClient,
        setCurrentClient,
        allClients,
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
        refreshData,
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
