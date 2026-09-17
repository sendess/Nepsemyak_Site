// Time-based one-time codes (RFC 6238) — what Google Authenticator and similar apps show.
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const STEP_SECONDS = 30;
// Local test sign-ins get their own name in the authenticator app, so they aren't mixed up with the real one.
const ISSUER = import.meta.env.DEV ? 'Nepsemyak Admin (test)' : 'Nepsemyak Admin';

function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(text: string): Buffer {
  const clean = text.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of clean) {
    value = (value << 5) | BASE32.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function codeAt(key: Buffer, step: number): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const hmac = createHmac('sha1', key).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const number =
    ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3];
  return String(number % 1_000_000).padStart(6, '0');
}

/** A new 160-bit secret, base32 as authenticator apps expect. */
export const newTotpSecret = () => base32Encode(randomBytes(20));

/** "ABCD EFGH …" for typing the secret in by hand. */
export const groupSecret = (secret: string) => secret.match(/.{1,4}/g)!.join(' ');

/** Link encoded in the QR code. */
export function totpUri(secret: string, email: string): string {
  const label = encodeURIComponent(`${ISSUER}:${email}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(ISSUER)}&algorithm=SHA1&digits=6&period=${STEP_SECONDS}`;
}

/**
 * Checks a 6-digit code, allowing one step of clock drift either way.
 * Returns the matching time step (store it so the code can't be reused), or null.
 */
export function verifyTotp(secret: string, input: string, lastStep: number | null, now = Date.now()): number | null {
  const code = input.replace(/\s+/g, '');
  if (!/^\d{6}$/.test(code)) return null;
  const key = base32Decode(secret);
  const current = Math.floor(now / 1000 / STEP_SECONDS);
  for (const step of [current - 1, current, current + 1]) {
    if (lastStep !== null && step <= lastStep) continue;
    if (timingSafeEqual(Buffer.from(codeAt(key, step)), Buffer.from(code))) return step;
  }
  return null;
}

/* ---------------- Recovery codes ---------------- */

const RECOVERY_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'; // no 0/o, 1/l/i

/** Ten one-time codes like "k7m2p-x9qfa". Only their hashes are stored. */
export function newRecoveryCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    const chars = [...randomBytes(10)].map((b) => RECOVERY_ALPHABET[b % RECOVERY_ALPHABET.length]).join('');
    return `${chars.slice(0, 5)}-${chars.slice(5)}`;
  });
}

export const hashRecoveryCode = (code: string) =>
  createHash('sha256').update(code.toLowerCase().replace(/[^a-z0-9]/g, '')).digest('hex');
