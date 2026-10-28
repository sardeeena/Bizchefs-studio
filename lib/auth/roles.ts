/**
 * BizChefs Studio — Four-Role RBAC Definitions
 *
 * Exact four system roles:
 * - 'superadmin': Full platform access across all client workspaces, user/role management, system audit logs, global settings.
 * - 'admin': Operational management within assigned client workspaces. Can invite owners/techs, cannot promote to superadmin.
 * - 'tech': Technical operations within assigned workspaces. Can view runtimes, update technical metadata, execute tasks. Read-only on billing/roles.
 * - 'owner': Client business access. Read-only for websites and services. Can submit support tickets, view own analytics and project progress.
 */

export type UserRole = 'superadmin' | 'admin' | 'tech' | 'owner';

export interface RoleDefinition {
  id: UserRole;
  label: string;
  badgeLabel: string;
  description: string;
  level: number; // 4: superadmin, 3: admin, 2: tech, 1: owner
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  superadmin: {
    id: 'superadmin',
    label: 'Super Administrator',
    badgeLabel: 'SUPERADMIN',
    description: 'Full platform access across all client workspaces, role delegation, system configuration, and audit logs.',
    level: 4,
  },
  admin: {
    id: 'admin',
    label: 'Operations Administrator',
    badgeLabel: 'ADMIN',
    description: 'Operational management within assigned client workspaces, project deliverables, and client user management.',
    level: 3,
  },
  tech: {
    id: 'tech',
    label: 'Technical Specialist',
    badgeLabel: 'TECH',
    description: 'Technical operations, runtime telemetry, task execution, and infrastructure issue triage within assigned workspaces.',
    level: 2,
  },
  owner: {
    id: 'owner',
    label: 'Client Account Owner',
    badgeLabel: 'OWNER',
    description: 'Business portal access to own websites, performance reports, project delivery status, and concierge support.',
    level: 1,
  },
};
