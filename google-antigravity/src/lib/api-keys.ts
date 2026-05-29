import { createHash, randomBytes } from 'crypto';

// API key format: "sd_live_<32 random base62>"
// We store only the SHA-256 hash + a 6-char prefix for UI listing.

export function generateApiKey(): { full: string; hash: string; prefix: string } {
  const raw = randomBytes(24).toString('base64url'); // 32 char-ish
  const full = `sd_live_${raw}`;
  const hash = createHash('sha256').update(full).digest('hex');
  const prefix = full.slice(0, 12);
  return { full, hash, prefix };
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}
