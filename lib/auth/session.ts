import { User } from '@/types';
import { DEMO_USERS, DEMO_WEBSITES } from '@/lib/data/mock-db';

export const DEFAULT_USER = DEMO_USERS[0]; // Sarah Mitchell (Client Owner)

/**
 * Server-side tenant authorization checks
 */
export function canAccessClient(user: User | null, targetClientId: string): boolean {
  if (!user) return false;
  if (user.role === 'super_admin' || user.role === 'admin') return true;
  return user.clientId === targetClientId;
}

export function canAccessWebsite(user: User | null, websiteId: string): boolean {
  if (!user) return false;
  if (user.role === 'super_admin' || user.role === 'admin') return true;

  const website = DEMO_WEBSITES.find((w) => w.id === websiteId);
  if (!website) return false;

  return user.clientId === website.clientId;
}

export function assertClientAccess(user: User | null, targetClientId: string): void {
  if (!user) {
    throw new Error('UNAUTHORIZED: Authentication required');
  }
  if (!canAccessClient(user, targetClientId)) {
    throw new Error(`FORBIDDEN: User ${user.email} is not authorized to access client ${targetClientId}`);
  }
}

export function assertWebsiteAccess(user: User | null, websiteId: string): void {
  if (!user) {
    throw new Error('UNAUTHORIZED: Authentication required');
  }
  if (!canAccessWebsite(user, websiteId)) {
    throw new Error(`FORBIDDEN: User ${user.email} is not authorized to access website ${websiteId}`);
  }
}

export function getUserById(userId: string): User | undefined {
  return DEMO_USERS.find((u) => u.id === userId);
}
