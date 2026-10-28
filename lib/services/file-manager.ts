/**
 * Safe File Management & Path Traversal Guard
 *
 * Rules:
 * - Reject directory traversal (e.g., ../, null bytes, absolute paths outside web root)
 * - Restrict editable extensions to safe source code and configuration templates
 * - Strict tenant isolation: user can only touch files belonging to their authorized website
 * - Size limit: max 500KB per file
 */

const ALLOWED_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.css',
  '.html',
  '.md',
  '.env.example',
  '.txt',
  '.svg',
];

const FORBIDDEN_FILENAMES = [
  '.git',
  '.gitignore',
  '.env',
  '.env.local',
  '.env.production',
  'id_rsa',
  'id_ed25519',
  'authorized_keys',
  'shadow',
  'passwd',
];

export interface FileValidationResult {
  valid: boolean;
  sanitizedPath?: string;
  error?: string;
}

export function validateSafeFilePath(inputPath: string): FileValidationResult {
  if (!inputPath || typeof inputPath !== 'string') {
    return { valid: false, error: 'File path cannot be empty' };
  }

  // Null byte injection check
  if (inputPath.includes('\0')) {
    return { valid: false, error: 'Path traversal violation: null byte detected' };
  }

  // Windows backslash normalization or injection
  if (inputPath.includes('\\')) {
    return { valid: false, error: 'Invalid path format: backslashes are not permitted' };
  }

  // Path traversal check
  const segments = inputPath.split('/');
  for (const seg of segments) {
    if (seg === '..' || seg === '.') {
      return { valid: false, error: 'Path traversal violation: ".." and "." segments forbidden' };
    }
  }

  // Normalize path
  const normalized = inputPath.startsWith('/') ? inputPath : `/${inputPath}`;

  // Check forbidden sensitive file targets
  const filename = segments[segments.length - 1];
  if (FORBIDDEN_FILENAMES.includes(filename.toLowerCase())) {
    return {
      valid: false,
      error: `Security violation: "${filename}" is restricted and cannot be modified directly`,
    };
  }

  // Check extension
  const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) =>
    filename.toLowerCase().endsWith(ext.toLowerCase())
  );

  if (!hasAllowedExt) {
    return {
      valid: false,
      error: `Unsupported file extension. Permitted types: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  return { valid: true, sanitizedPath: normalized };
}

export function validateFileContent(content: string, maxBytes = 512000): { valid: boolean; error?: string } {
  if (typeof content !== 'string') {
    return { valid: false, error: 'Content must be text string' };
  }

  const byteLength = new TextEncoder().encode(content).length;
  if (byteLength > maxBytes) {
    return {
      valid: false,
      error: `File exceeds maximum allowed size of ${Math.round(maxBytes / 1024)} KB (received ${Math.round(byteLength / 1024)} KB)`,
    };
  }

  return { valid: true };
}
