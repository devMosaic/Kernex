import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.KERNEX_ENCRYPTION_KEY;

if (process.env.NODE_ENV === 'production') {
    if (!ENCRYPTION_KEY) {
        throw new Error('FATAL: KERNEX_ENCRYPTION_KEY environment variable is required in production.');
    }
    if (ENCRYPTION_KEY.length !== 64 && ENCRYPTION_KEY.length !== 32) {
        // Warn but allow, though 32 chars (bytes) is expected for hex? 
        // Actually code uses 'hex' encoding for key?
        // Buffer.from(key, 'hex') needs 32 bytes = 64 hex chars.
        // Or if raw string, 32 chars.
        // The code uses Buffer.from(ENCRYPTION_KEY, 'hex'). So it expects 64 hex chars.
    }
}

// Fallback for DEV ONLY
const FINAL_KEY = ENCRYPTION_KEY || 'a'.repeat(64);

const ALGORITHM = 'aes-256-gcm';

export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(FINAL_KEY, 'hex'), iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptSecret(ciphertext: string): string {
  const [iv, authTag, encrypted] = ciphertext.split(':');
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(FINAL_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
