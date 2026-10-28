import { UserRole } from './roles';

export type Permission =
  | 'global_settings.manage'
  | 'users.manage_all_roles'
  | 'users.manage_client_roles'
  | 'users.view_all'
  | 'users.view_assigned'
  | 'clients.view_all'
  | 'clients.view_assigned'
  | 'clients.view_own'
  | 'clients.create'
  | 'clients.update'
  | 'clients.delete'
  | 'websites.view_all'
  | 'websites.view_assigned'
  | 'websites.view_own'
  | 'websites.create'
  | 'websites.update_technical'
  | 'websites.manage_all'
  | 'websites.delete'
  | 'domains.view_safe'
  | 'domains.manage'
  | 'projects.view'
  | 'projects.manage'
  | 'tasks.view'
  | 'tasks.update_status'
  | 'tasks.manage'
  | 'tickets.view_all'
  | 'tickets.view_assigned'
  | 'tickets.view_own'
  | 'tickets.create'
  | 'tickets.reply'
  | 'tickets.view_internal_notes'
  | 'services.view_own'
  | 'services.manage'
  | 'google_reports.view_all'
  | 'google_reports.view_assigned'
  | 'google_reports.view_own'
  | 'google_integrations.manage'
  | 'hostinger.view_telemetry'
  | 'hostinger.execute_operations'
  | 'audit.view_all'
  | 'audit.view_assigned';

/**
 * Centralized Four-Role Permission Matrix
 * Matches BizChefs Studio Security Architecture
 */
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  superadmin: [
    'global_settings.manage',
    'users.manage_all_roles',
    'users.manage_client_roles',
    'users.view_all',
    'users.view_assigned',
    'clients.view_all',
    'clients.view_assigned',
    'clients.view_own',
    'clients.create',
    'clients.update',
    'clients.delete',
    'websites.view_all',
    'websites.view_assigned',
    'websites.view_own',
    'websites.create',
    'websites.update_technical',
    'websites.manage_all',
    'websites.delete',
    'domains.view_safe',
    'domains.manage',
    'projects.view',
    'projects.manage',
    'tasks.view',
    'tasks.update_status',
    'tasks.manage',
    'tickets.view_all',
    'tickets.view_assigned',
    'tickets.view_own',
    'tickets.create',
    'tickets.reply',
    'tickets.view_internal_notes',
    'services.view_own',
    'services.manage',
    'google_reports.view_all',
    'google_reports.view_assigned',
    'google_reports.view_own',
    'google_integrations.manage',
    'hostinger.view_telemetry',
    'hostinger.execute_operations',
    'audit.view_all',
    'audit.view_assigned',
  ],
  admin: [
    'users.manage_client_roles', // Can invite/manage client owners and techs within assigned scope
    'users.view_assigned',
    'clients.view_assigned',
    'clients.view_own',
    'clients.create',
    'clients.update',
    'websites.view_assigned',
    'websites.view_own',
    'websites.create',
    'websites.update_technical',
    'websites.manage_all',
    'domains.view_safe',
    'domains.manage',
    'projects.view',
    'projects.manage',
    'tasks.view',
    'tasks.update_status',
    'tasks.manage',
    'tickets.view_assigned',
    'tickets.view_own',
    'tickets.create',
    'tickets.reply',
    'tickets.view_internal_notes',
    'services.view_own',
    'services.manage',
    'google_reports.view_assigned',
    'google_reports.view_own',
    'google_integrations.manage',
    'hostinger.view_telemetry',
    'hostinger.execute_operations',
    'audit.view_assigned',
  ],
  tech: [
    'users.view_assigned',
    'clients.view_assigned',
    'websites.view_assigned',
    'websites.view_own',
    'websites.update_technical', // Technical fields (runtime, notes, task execution)
    'domains.view_safe',
    'projects.view',
    'tasks.view',
    'tasks.update_status', // Can update task status
    'tickets.view_assigned',
    'tickets.reply',
    'tickets.view_internal_notes',
    'google_reports.view_assigned',
    'hostinger.view_telemetry',
  ],
  owner: [
    'clients.view_own',
    'websites.view_own', // Read-only view of own website
    'domains.view_safe', // Safe information read
    'projects.view',
    'tasks.view',
    'tickets.view_own',
    'tickets.create',
    'tickets.reply',
    'services.view_own',
    'google_reports.view_own',
    'google_integrations.manage', // Can connect/disconnect own Google account
  ],
} as const;

export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}
