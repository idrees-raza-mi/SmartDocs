import { createHash } from 'crypto';

// Domains where dots in the local part are insignificant — Gmail and its
// aliases treat foo.bar@gmail.com, f.o.o.b.a.r@gmail.com and
// foobar+anything@gmail.com as the same inbox. We normalize before hashing
// so abusers can't bypass the blocklist by adding dots or plus-aliases.
const DOTLESS_DOMAINS = new Set(['gmail.com', 'googlemail.com']);

// Domains that universally treat +alias as the same inbox.
const PLUS_ALIAS_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'icloud.com',
  'me.com',
  'proton.me',
  'protonmail.com',
  'fastmail.com',
  'yahoo.com',
]);

/**
 * Normalize an email so equivalent inboxes hash to the same fingerprint.
 *   "Foo.Bar+promo@Gmail.com" → "foobar@gmail.com"
 *   "user+anything@outlook.com" → "user@outlook.com"
 *   "joe@company.com" → "joe@company.com" (untouched)
 */
export function normalizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf('@');
  if (at < 1 || at === trimmed.length - 1) return trimmed; // malformed; leave as-is

  let local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);

  if (PLUS_ALIAS_DOMAINS.has(domain)) {
    const plus = local.indexOf('+');
    if (plus !== -1) local = local.slice(0, plus);
  }

  if (DOTLESS_DOMAINS.has(domain)) {
    local = local.replace(/\./g, '');
  }

  return `${local}@${domain}`;
}

/**
 * One-way fingerprint of an email. SHA-256 of the normalized form, salted
 * with an app-wide secret so blocklist hashes can't be brute-forced against
 * a leaked dump.
 */
export function emailFingerprint(email: string): string {
  const normalized = normalizeEmail(email);
  const salt = process.env.EMAIL_FINGERPRINT_SALT || 'smartdocs-default-salt-change-me';
  return createHash('sha256').update(`${salt}::${normalized}`).digest('hex');
}
