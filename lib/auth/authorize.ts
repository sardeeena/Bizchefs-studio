import { User } from '@/types';
import { UserRole } from './roles';
import { Permission, roleHasPermission } from './permissions';

/**
 * Server-side authorization functions for BizChefs Studio Four-Role RBAC
 */

export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user || !user.role) return false;
  return roleHasPermission(user.role, permission);
}

export function canAccessWorkspace(user: User | null, targetClientId: string): boolean {
  if (!user) return false;

  // Superadmin has unrestricted global cross-tenant access
  if (user.role === 'superadmin') return true;

  // Admin and Tech have access to their assigned client workspaces
  if (user.role === 'admin' || user.role === 'tech') {
    if (user.assignedClientIds && user.assignedClientIds.includes(targetClientId)) {
      return true;
    }
    return user.clientId === targetClientId;
  }

  // Owner can only access their own specific client workspace
  if (user.role === 'owner') {
    return user.clientId === targetClientId;
  }

  return false;
}

export function canAccessWebsite(user: User | null, websiteClientId: string): boolean {
  return canAccessWorkspace(user, websiteClientId);
}

/**
 * Evaluates whether an actor is permitted to change a target user's role.
 * Includes protection for the last superadmin.
 */
export function canModifyUserRole(
  actor: User | null,
  targetUser: User,
  newRole: UserRole,
  allUsers: User[] = []
): { allowed: boolean; reason?: string } {
  if (!actor) {
    return { allowed: false, reason: 'Authentication required' };
  }

  // Tech and Owner cannot change any roles
  if (actor.role === 'tech' || actor.role === 'owner') {
    return { allowed: false, reason: `Role "${actor.role}" has no authority to manage user roles` };
  }

  // Admin restrictions
  if (actor.role === 'admin') {
    // Admin cannot promote anyone to superadmin
    if (newRole === 'superadmin') {
      return { allowed: false, reason: 'Admins cannot assign the superadmin role' };
    }
    // Admin cannot modify a superadmin or another admin
    if (targetUser.role === 'superadmin' || targetUser.role === 'admin') {
      return { allowed: false, reason: 'Admins cannot modify superadmin or admin accounts' };
    }
    // Admin can only manage roles for users within their assigned workspace
    if (
      targetUser.clientId &&
      !actor.assignedClientIds?.includes(targetUser.clientId) &&
      actor.clientId !== targetUser.clientId
    ) {
      return { allowed: false, reason: 'Cannot manage users outside assigned client workspaces' };
    }
    // Admin can only assign owner or tech
    if (newRole !== 'owner' && newRole !== 'tech') {
      return { allowed: false, reason: 'Admins can only assign "owner" or "tech" roles' };
    }
    return { allowed: true };
  }

  // Superadmin privileges with Last-Superadmin Protection
  if (actor.role === 'superadmin') {
    if (targetUser.role === 'superadmin' && newRole !== 'superadmin') {
      const activeSuperadmins = allUsers.filter(
        (u) => u.role === 'superadmin' && u.id !== targetUser.id
      );
      if (activeSuperadmins.length === 0) {
        return {
          allowed: false,
          reason: 'Security constraint violation: cannot demote or remove the last active superadmin',
        };
      }
    }
    return { allowed: true };
  }

  return { allowed: false, reason: 'Unauthorized role operation' };
}

/**
 * Throwing assertion helpers for route handlers & server actions
 */
export function assertPermission(user: User | null, permission: Permission): void {
  if (!user) {
    throw new Error('UNAUTHORIZED: Authentication required');
  }
  if (!hasPermission(user, permission)) {
    throw new Error(`FORBIDDEN: User ${user.email} (${user.role}) lacks permission "${permission}"`);
  }
}

export function assertWorkspaceAccess(user: User | null, clientId: string): void {
  if (!user) {
    throw new Error('UNAUTHORIZED: Authentication required');
  }
  if (!canAccessWorkspace(user, clientId)) {
    throw new Error(`FORBIDDEN: User ${user.email} (${user.role}) is not authorized to access workspace "${clientId}"`);
  }
}

export function assertRoleChange(
  actor: User | null,
  targetUser: User,
  newRole: UserRole,
  allUsers: User[]
): void {
  const result = canModifyUserRole(actor, targetUser, newRole, allUsers);
  if (!result.allowed) {
    throw new Error(`FORBIDDEN: ${result.reason}`);
  }
}
