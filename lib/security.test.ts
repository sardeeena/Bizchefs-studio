import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessClient, canAccessWebsite, assertClientAccess, assertWebsiteAccess } from './auth/session';
import { validateSafeFilePath, validateFileContent } from './services/file-manager';
import { HostingerClient } from './integrations/hostinger/client';
import { DEMO_USERS } from './data/mock-db';

const sarahUser = DEMO_USERS.find((u) => u.id === 'user_sarah')!;
const omarUser = DEMO_USERS.find((u) => u.id === 'user_omar')!;
const adminUser = DEMO_USERS.find((u) => u.id === 'user_tariq')!;

test('Tenant Isolation: client cannot access another client organization', () => {
  // Sarah belongs to client_kemet
  assert.equal(canAccessClient(sarahUser, 'client_kemet'), true);
  assert.equal(canAccessClient(sarahUser, 'client_genuine'), false);
  assert.equal(canAccessClient(sarahUser, 'client_delta'), false);

  // Omar belongs to client_genuine
  assert.equal(canAccessClient(omarUser, 'client_genuine'), true);
  assert.equal(canAccessClient(omarUser, 'client_kemet'), false);

  // Tariq is super_admin
  assert.equal(canAccessClient(adminUser, 'client_kemet'), true);
  assert.equal(canAccessClient(adminUser, 'client_genuine'), true);
  assert.equal(canAccessClient(adminUser, 'client_delta'), true);
});

test('Tenant Isolation: website ownership and authorization checks', () => {
  // Sarah can access Kemet websites, but not Genuine Egypte
  assert.equal(canAccessWebsite(sarahUser, 'web_kemet_main'), true);
  assert.equal(canAccessWebsite(sarahUser, 'web_kemet_app'), true);
  assert.equal(canAccessWebsite(sarahUser, 'web_genuine_main'), false);

  // Cross-client assertion throws FORBIDDEN error
  assert.throws(
    () => assertWebsiteAccess(sarahUser, 'web_genuine_main'),
    /FORBIDDEN: User sarah\.mitchell@kemettours\.com is not authorized/
  );

  // Valid assertion succeeds
  assert.doesNotThrow(() => assertWebsiteAccess(sarahUser, 'web_kemet_main'));

  // Admin assertion succeeds across all sites
  assert.doesNotThrow(() => assertWebsiteAccess(adminUser, 'web_genuine_main'));
});

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

  // Permitted source files
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
