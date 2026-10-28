import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAccessClient,
  canAccessWebsite,
  assertClientAccess,
  assertWebsiteAccess,
} from './auth/session';
import {
  hasPermission,
  canAccessWorkspace,
  canModifyUserRole,
  assertPermission,
  assertWorkspaceAccess,
  assertRoleChange,
} from './auth/authorize';
import { ROLE_PERMISSIONS, roleHasPermission, Permission } from './auth/permissions';
import { validateSafeFilePath, validateFileContent } from './services/file-manager';
import { HostingerClient } from './integrations/hostinger/client';
import { encryptToken, decryptToken } from './crypto/encryption';
import { DEMO_USERS } from './data/mock-db';
import { User, UserRole } from '@/types';

const tariqSuperadmin = DEMO_USERS.find((u) => u.id === 'user_tariq')!; // superadmin
const elenaAdmin = DEMO_USERS.find((u) => u.id === 'user_elena')!; // admin (assigned kemet & genuine)
const karimTech = DEMO_USERS.find((u) => u.id === 'user_karim')!; // tech (assigned kemet)
const sarahOwner = DEMO_USERS.find((u) => u.id === 'user_sarah')!; // owner (kemet)
const omarOwner = DEMO_USERS.find((u) => u.id === 'user_omar')!; // owner (genuine)

// ==========================================
// 1. FOUR-ROLE RBAC PERMISSION MATRIX TESTS
// ==========================================

test('Four-Role RBAC: Superadmin has unrestricted platform permissions', () => {
  assert.equal(tariqSuperadmin.role, 'superadmin');
  assert.equal(hasPermission(tariqSuperadmin, 'clients.create'), true);
  assert.equal(hasPermission(tariqSuperadmin, 'clients.delete'), true);
  assert.equal(hasPermission(tariqSuperadmin, 'users.manage_all_roles'), true);
  assert.equal(hasPermission(tariqSuperadmin, 'global_settings.manage'), true);
  assert.equal(hasPermission(tariqSuperadmin, 'websites.manage_all'), true);
  assert.equal(hasPermission(tariqSuperadmin, 'services.manage'), true);
  assert.equal(hasPermission(tariqSuperadmin, 'hostinger.execute_operations'), true);

  assert.doesNotThrow(() => assertPermission(tariqSuperadmin, 'users.manage_all_roles'));
});

test('Four-Role RBAC: Admin has operational control but cannot perform global security mutations', () => {
  assert.equal(elenaAdmin.role, 'admin');

  // Allowed operational permissions
  assert.equal(hasPermission(elenaAdmin, 'clients.view_assigned'), true);
  assert.equal(hasPermission(elenaAdmin, 'clients.update'), true);
  assert.equal(hasPermission(elenaAdmin, 'websites.create'), true);
  assert.equal(hasPermission(elenaAdmin, 'tasks.manage'), true);
  assert.equal(hasPermission(elenaAdmin, 'tickets.reply'), true);

  // Prohibited administrative / global mutations
  assert.equal(hasPermission(elenaAdmin, 'users.manage_all_roles'), false);
  assert.equal(hasPermission(elenaAdmin, 'clients.delete'), false);
  assert.equal(hasPermission(elenaAdmin, 'global_settings.manage'), false);

  assert.throws(
    () => assertPermission(elenaAdmin, 'users.manage_all_roles'),
    /FORBIDDEN: User .* lacks permission "users.manage_all_roles"/
  );
});

test('Four-Role RBAC: Tech has technical runtime & pipeline access, no billing or role authority', () => {
  assert.equal(karimTech.role, 'tech');

  // Allowed technical permissions
  assert.equal(hasPermission(karimTech, 'websites.view_assigned'), true);
  assert.equal(hasPermission(karimTech, 'websites.update_technical'), true);
  assert.equal(hasPermission(karimTech, 'hostinger.view_telemetry'), true);
  assert.equal(hasPermission(karimTech, 'tasks.update_status'), true);
  assert.equal(hasPermission(karimTech, 'tickets.reply'), true);

  // Prohibited business & role permissions
  assert.equal(hasPermission(karimTech, 'clients.create'), false);
  assert.equal(hasPermission(karimTech, 'services.manage'), false);
  assert.equal(hasPermission(karimTech, 'users.manage_client_roles'), false);
  assert.equal(hasPermission(karimTech, 'users.manage_all_roles'), false);
  assert.equal(hasPermission(karimTech, 'websites.delete'), false);

  assert.throws(
    () => assertPermission(karimTech, 'services.manage'),
    /FORBIDDEN: User .* lacks permission "services.manage"/
  );
});

test('Four-Role RBAC: Owner has business & care oversight with read-only infrastructure constraints', () => {
  assert.equal(sarahOwner.role, 'owner');

  // Allowed client oversight
  assert.equal(hasPermission(sarahOwner, 'websites.view_own'), true);
  assert.equal(hasPermission(sarahOwner, 'domains.view_safe'), true);
  assert.equal(hasPermission(sarahOwner, 'services.view_own'), true);
  assert.equal(hasPermission(sarahOwner, 'tickets.create'), true);
  assert.equal(hasPermission(sarahOwner, 'google_reports.view_own'), true);
  assert.equal(hasPermission(sarahOwner, 'google_integrations.manage'), true);

  // Prohibited technical mutations & admin permissions
  assert.equal(hasPermission(sarahOwner, 'websites.create'), false);
  assert.equal(hasPermission(sarahOwner, 'websites.update_technical'), false);
  assert.equal(hasPermission(sarahOwner, 'domains.manage'), false);
  assert.equal(hasPermission(sarahOwner, 'tasks.manage'), false);
  assert.equal(hasPermission(sarahOwner, 'users.manage_client_roles'), false);

  assert.throws(
    () => assertPermission(sarahOwner, 'websites.create'),
    /FORBIDDEN: User .* lacks permission "websites.create"/
  );
});

// ==========================================
// 2. WORKSPACE SCOPING & TENANT ISOLATION
// ==========================================

test('Workspace Scoping: Superadmin has global tenant access', () => {
  assert.equal(canAccessWorkspace(tariqSuperadmin, 'client_kemet'), true);
  assert.equal(canAccessWorkspace(tariqSuperadmin, 'client_genuine'), true);
  assert.equal(canAccessWorkspace(tariqSuperadmin, 'client_delta'), true);
  assert.equal(canAccessWorkspace(tariqSuperadmin, 'nonexistent_client'), true);
});

test('Workspace Scoping: Admin is restricted to assigned client workspaces', () => {
  // Elena is assigned client_kemet and client_genuine
  assert.equal(canAccessWorkspace(elenaAdmin, 'client_kemet'), true);
  assert.equal(canAccessWorkspace(elenaAdmin, 'client_genuine'), true);
  // Elena is NOT assigned client_delta
  assert.equal(canAccessWorkspace(elenaAdmin, 'client_delta'), false);

  assert.throws(
    () => assertWorkspaceAccess(elenaAdmin, 'client_delta'),
    /FORBIDDEN: User .* is not authorized to access workspace "client_delta"/
  );
});

test('Workspace Scoping: Tech is restricted to assigned client workspaces', () => {
  // Karim is assigned client_kemet
  assert.equal(canAccessWorkspace(karimTech, 'client_kemet'), true);
  assert.equal(canAccessWorkspace(karimTech, 'client_genuine'), false);
  assert.equal(canAccessWorkspace(karimTech, 'client_delta'), false);
});

test('Workspace Scoping: Owner is strictly isolated to their own client workspace', () => {
  // Sarah belongs to client_kemet
  assert.equal(canAccessWorkspace(sarahOwner, 'client_kemet'), true);
  assert.equal(canAccessWorkspace(sarahOwner, 'client_genuine'), false);
  assert.equal(canAccessWorkspace(sarahOwner, 'client_delta'), false);

  // Omar belongs to client_genuine
  assert.equal(canAccessWorkspace(omarOwner, 'client_genuine'), true);
  assert.equal(canAccessWorkspace(omarOwner, 'client_kemet'), false);
});

test('Website Isolation: Users can only access websites belonging to authorized workspaces', () => {
  assert.equal(canAccessWebsite(sarahOwner, 'web_kemet_main'), true);
  assert.equal(canAccessWebsite(sarahOwner, 'web_kemet_app'), true);
  assert.equal(canAccessWebsite(sarahOwner, 'web_genuine_main'), false);

  assert.throws(
    () => assertWebsiteAccess(sarahOwner, 'web_genuine_main'),
    /FORBIDDEN: User .* is not authorized to access website web_genuine_main/
  );

  assert.doesNotThrow(() => assertWebsiteAccess(sarahOwner, 'web_kemet_main'));
  assert.doesNotThrow(() => assertWebsiteAccess(tariqSuperadmin, 'web_genuine_main'));
});

// ==========================================
// 3. ROLE MUTATION & LAST-SUPERADMIN GUARD
// ==========================================

test('Last-Superadmin Protection: cannot demote the last active superadmin', () => {
  const usersList = [...DEMO_USERS]; // only Tariq is superadmin

  // Tariq attempting to demote himself to admin when he is the only superadmin
  const demoteAttempt = canModifyUserRole(tariqSuperadmin, tariqSuperadmin, 'admin', usersList);
  assert.equal(demoteAttempt.allowed, false);
  assert.match(demoteAttempt.reason || '', /cannot demote or remove the last active superadmin/i);

  // Assert throws error
  assert.throws(
    () => assertRoleChange(tariqSuperadmin, tariqSuperadmin, 'admin', usersList),
    /cannot demote or remove the last active superadmin/i
  );

  // If a second superadmin exists, demoting one is allowed
  const secondSuperadmin: User = {
    id: 'user_tariq_2',
    email: 'backup.admin@bizchefs.com',
    name: 'Backup Superadmin',
    role: 'superadmin',
    createdAt: new Date().toISOString(),
  };
  const listWithTwoSuperadmins = [...usersList, secondSuperadmin];

  const allowedDemote = canModifyUserRole(
    tariqSuperadmin,
    tariqSuperadmin,
    'admin',
    listWithTwoSuperadmins
  );
  assert.equal(allowedDemote.allowed, true);
});

test('Admin Role Restrictions: Admin cannot promote to superadmin or touch admin/superadmin', () => {
  const usersList = [...DEMO_USERS];

  // Admin cannot promote Sarah to superadmin
  const promoteToSuper = canModifyUserRole(elenaAdmin, sarahOwner, 'superadmin', usersList);
  assert.equal(promoteToSuper.allowed, false);
  assert.match(promoteToSuper.reason || '', /cannot assign the superadmin role/i);

  // Admin cannot demote or modify superadmin Tariq
  const touchSuper = canModifyUserRole(elenaAdmin, tariqSuperadmin, 'admin', usersList);
  assert.equal(touchSuper.allowed, false);
  assert.match(touchSuper.reason || '', /cannot modify superadmin or admin accounts/i);

  // Admin can change role between owner and tech for users in their assigned workspace
  const changeOwnerToTech = canModifyUserRole(elenaAdmin, sarahOwner, 'tech', usersList);
  assert.equal(changeOwnerToTech.allowed, true);
});

test('Tech and Owner have zero role management authority', () => {
  const usersList = [...DEMO_USERS];

  const techAttempt = canModifyUserRole(karimTech, sarahOwner, 'owner', usersList);
  assert.equal(techAttempt.allowed, false);
  assert.match(techAttempt.reason || '', /has no authority to manage user roles/i);

  const ownerAttempt = canModifyUserRole(sarahOwner, omarOwner, 'owner', usersList);
  assert.equal(ownerAttempt.allowed, false);
  assert.match(ownerAttempt.reason || '', /has no authority to manage user roles/i);
});

// ==========================================
// 4. FILE SECURITY & PATH TRAVERSAL GUARDS
// ==========================================

test('File Security: path traversal attacks are rejected', () => {
  const attack1 = validateSafeFilePath('../../etc/passwd');
  assert.equal(attack1.valid, false);
  assert.match(attack1.error || '', /traversal/i);

  const attack2 = validateSafeFilePath('app/../components/Secret.tsx');
  assert.equal(attack2.valid, false);

  const attack3 = validateSafeFilePath('app/test\0.tsx');
  assert.equal(attack3.valid, false);
  assert.match(attack3.error || '', /null byte/i);

  const attack4 = validateSafeFilePath('app\\nested\\file.tsx');
  assert.equal(attack4.valid, false);
  assert.match(attack4.error || '', /backslash/i);
});

test('File Security: restricted files and disallowed extensions are rejected', () => {
  const envCheck = validateSafeFilePath('/app/.env');
  assert.equal(envCheck.valid, false);
  assert.match(envCheck.error || '', /restricted/i);

  const rsaCheck = validateSafeFilePath('/id_rsa');
  assert.equal(rsaCheck.valid, false);

  const exeCheck = validateSafeFilePath('/app/binary.exe');
  assert.equal(exeCheck.valid, false);
  assert.match(exeCheck.error || '', /unsupported file extension/i);

  const validTsx = validateSafeFilePath('/app/page.tsx');
  assert.equal(validTsx.valid, true);
  assert.equal(validTsx.sanitizedPath, '/app/page.tsx');

  const validJson = validateSafeFilePath('package.json');
  assert.equal(validJson.valid, true);
  assert.equal(validJson.sanitizedPath, '/package.json');
});

test('File Security: maximum file content size enforcement', () => {
  const smallText = 'console.log("hello world");';
  assert.equal(validateFileContent(smallText).valid, true);

  const oversized = 'x'.repeat(600000); // 600KB
  const check = validateFileContent(oversized, 500000);
  assert.equal(check.valid, false);
  assert.match(check.error || '', /exceeds maximum allowed size/i);
});

// ==========================================
// 5. HOSTINGER CAPABILITIES & CRYPTO
// ==========================================

test('Hostinger Adapter: capability matrix differentiates Cloud/Shared and VPS', () => {
  const client = new HostingerClient();

  const sharedCaps = client.getCapabilities('shared');
  assert.equal(sharedCaps.supportsSiteListing, true);
  assert.equal(sharedCaps.supportsVpsReboot, false);
  assert.equal(sharedCaps.supportsCachePurge, true);
  assert.equal(sharedCaps.supportsDirectWebFileEditing, false);

  const vpsCaps = client.getCapabilities('vps');
  assert.equal(vpsCaps.supportsVpsReboot, true);
  assert.equal(vpsCaps.supportsCachePurge, false);
});

test('Cryptographic Security: AES-256-GCM token encryption and authentication tag verification', () => {
  const rawRefreshToken = '1//04_random_google_oauth_refresh_token_xyz987';
  const encrypted = encryptToken(rawRefreshToken);

  assert.equal(encrypted.version, 'v1');
  assert.equal(typeof encrypted.encryptedData, 'string');
  assert.equal(typeof encrypted.iv, 'string');
  assert.equal(typeof encrypted.authTag, 'string');

  const decrypted = decryptToken(encrypted);
  assert.equal(decrypted, rawRefreshToken);

  const tampered = {
    ...encrypted,
    encryptedData: encrypted.encryptedData.slice(0, -2) + 'aa',
  };
  assert.throws(() => decryptToken(tampered));

  const badTag = {
    ...encrypted,
    authTag: '0'.repeat(32),
  };
  assert.throws(() => decryptToken(badTag));
});
