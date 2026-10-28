import { User } from '@/types';
import { DEMO_USERS, DEMO_WEBSITES } from '@/lib/data/mock-db';
import { canAccessWorkspace, hasPermission, assertPermission, assertWorkspaceAccess } from './authorize';
import { Permission } from './permissions';

export const DEFAULT_USER = DEMO_USERS[0]; // Tariq Al-Chef (Superadmin)

/**
 * Server-side tenant authorization checks
 */
export function canAccessClient(user: User | null, targetClientId: string): boolean {
  return canAccessWorkspace(user, targetClientId);
}

export function canAccessWebsite(user: User | null, websiteId: string): boolean {
  if (!user) return false;
  const website = DEMO_WEBSITES.find((w) => w.id === websiteId);
  if (!website) return false;
  return canAccessWorkspace(user, website.clientId);
}

export function assertClientAccess(user: User | null, targetClientId: string): void {
  assertWorkspaceAccess(user, targetClientId);
}

export function assertWebsiteAccess(user: User | null, websiteId: string): void {
  if (!user) {
    throw new Error('UNAUTHORIZED: Authentication required');
  }
  const website = DEMO_WEBSITES.find((w) => w.id === websiteId);
  if (!website) {
    throw new Error(`NOT_FOUND: Website ${websiteId} does not exist`);
  }
  if (!canAccessWorkspace(user, website.clientId)) {
    throw new Error(`FORBIDDEN: User ${user.email} (${user.role}) is not authorized to access website ${websiteId}`);
  }
}

export function getUserById(userId: string): User | undefined {
  return DEMO_USERS.find((u) => u.id === userId);
}

export { hasPermission, assertPermission, canAccessWorkspace, assertWorkspaceAccess };
