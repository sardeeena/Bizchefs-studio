import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits auth tag

/**
 * Derives a 32-byte cryptographic key from the environment variable.
 * Throws in production if not properly configured with a 32-byte key.
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;
  if (envKey) {
    if (envKey.length === 64) {
      // 64-char hex string = 32 bytes
      return Buffer.from(envKey, 'hex');
    }
    // Hash to 32 bytes if provided as a passphrase
    return crypto.createHash('sha256').update(envKey).digest();
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('GOOGLE_TOKEN_ENCRYPTION_KEY is required in production for AES-256-GCM encryption.');
  }

  // Safe fallback for local development and automated unit tests only
  const devKey = 'bizchefs-studio-dev-key-32-bytes-secure!';
  return Buffer.from(devKey.padEnd(32, '0').slice(0, 32));
}

export interface EncryptedPayload {
  version: string;
  iv: string; // Hex
  encryptedData: string; // Hex
  authTag: string; // Hex
}

/**
 * Encrypts sensitive tokens using AES-256-GCM with authenticated tags
 */
export function encryptToken(plainText: string): EncryptedPayload {
  if (!plainText || typeof plainText !== 'string') {
    throw new Error('encryptToken requires a non-empty string');
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    version: 'v1',
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypts AES-256-GCM encrypted tokens and verifies the authentication tag
 */
export function decryptToken(payload: EncryptedPayload): string {
  if (!payload || !payload.encryptedData || !payload.iv || !payload.authTag) {
    throw new Error('decryptToken requires a complete EncryptedPayload object');
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(payload.iv, 'hex');
  const authTag = Buffer.from(payload.authTag, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(payload.encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
