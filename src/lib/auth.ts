// Admin sign-in: Neon Auth checks the email and password; this site then requires a code from an
// authenticator app (TOTP) before a session may use the admin panel.
import { handleAuthProxyRequest, parseSessionData, type SessionData } from '@neondatabase/auth/server';
import { NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET } from 'astro:env/server';
import { sql } from './db';
import { logEvent, recentEvents, requestActor } from './audit';
import { decryptSecret, encryptSecret } from './secrets';
import { hashRecoveryCode, newRecoveryCodes, newTotpSecret, verifyTotp } from './totp';
import type { AdminRole } from './roles';

export type { AdminRole };
/** `office` is set only for Customer care tied to one office. */
export type AdminUser = { email: string; name: string; role: AdminRole; office: string | null; totpEnabled: boolean };

/** How far a visitor has got: no session → admin allowlist → authenticator set up → code entered this session. */
export type AuthStage = 'signed-out' | 'not-admin' | 'needs-setup' | 'needs-code' | 'ok';

export type AdminAccess = {
  stage: AuthStage;
  admin: AdminUser | null;
  email: string | null;
  sessionId: string | null;
  sessionExpiresAt: Date | null;
};

type RequestContext = { request: Request; clientAddress?: string };

export const PASSWORD_MIN_LENGTH = 10;
/** An authenticator code is asked for again after this long, even if the password session lasts longer. */
const CODE_VALID_HOURS = 12;
export const LOCK_MINUTES = 15;
/** Wrong passwords or codes allowed per admin, per device (IP address), before a pause. */
export const MAX_FAILURES_PER_EMAIL = 5;
/** Looser limits across all devices, so an attacker who knows an email can't easily keep that admin locked out. */
const MAX_FAILURES_EMAIL_ANY_IP = 30;
const MAX_FAILURES_PER_IP = 20;

const tooMany = (f: { byEmail: number; byIp: number; byEmailIp: number }) =>
  f.byEmailIp >= MAX_FAILURES_PER_EMAIL || f.byEmail >= MAX_FAILURES_EMAIL_ANY_IP || f.byIp >= MAX_FAILURES_PER_IP;

const proxyConfig = () => ({
  baseUrl: NEON_AUTH_BASE_URL,
  cookieSecret: NEON_AUTH_COOKIE_SECRET,
  sameSite: 'lax' as const,
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const normalizeEmail = (value: unknown) => String(value ?? '').trim().toLowerCase().slice(0, 160);

export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  if (password.length > 128) return 'Use at most 128 characters.';
  if (/^(.)\1*$/.test(password)) return 'Choose a less predictable password.';
  return null;
}

/* ---------------- Neon Auth proxy ---------------- */

/** Neon Auth endpoints reachable from the browser. Everything else (sign-up, emailed sign-in codes, OAuth…) is refused. */
const ALLOWED_PATHS = new Set(['get-session', 'sign-out', 'sign-in/email', 'email-otp/request-password-reset', 'email-otp/reset-password']);

/** Call a Neon Auth endpoint on behalf of the incoming request (same cookies and origin). */
export async function callAuth(from: Request, path: string, body: unknown) {
  const headers = new Headers(from.headers);
  headers.set('content-type', 'application/json');
  headers.delete('content-length');
  const request = new Request(new URL(`/api/auth/${path}`, from.url), { method: 'POST', headers, body: JSON.stringify(body) });
  const response = await handleAuthProxyRequest({ request, path, ...proxyConfig() });
  const data = await response.clone().json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data, response };
}

/** Browser requests to /api/auth/*: forwarded to Neon Auth after allowlist, lockout and logging checks. */
export async function proxyAuthRequest(ctx: RequestContext, path: string): Promise<Response> {
  const { request } = ctx;
  if (!ALLOWED_PATHS.has(path)) return json({ message: 'Not found' }, 404);
  if (path === 'get-session') return handleAuthProxyRequest({ request, path, ...proxyConfig() });
  if (request.method !== 'POST') return json({ message: 'Method not allowed' }, 405);

  if (path === 'sign-out') {
    const { data } = await getSession(request);
    if (data.session) {
      await sql`delete from admin_mfa_sessions where session_id = ${data.session.id}`;
      await logEvent(requestActor(ctx, data.user.email.toLowerCase()), 'signed_out');
    }
    return handleAuthProxyRequest({ request, path, ...proxyConfig() });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return json({ message: 'Invalid request' }, 400);
  }
  const email = normalizeEmail(body.email);
  const actor = requestActor(ctx, email || null);
  const admin = email ? await findAdmin(email) : null;

  if (path === 'sign-in/email') {
    if (tooMany(await recentEvents('sign_in_failed', email, actor.ip, LOCK_MINUTES))) {
      await logEvent(actor, 'sign_in_blocked');
      return json({ code: 'TOO_MANY_ATTEMPTS', message: `Too many failed attempts. Try again in ${LOCK_MINUTES} minutes.` }, 429);
    }
    const password = String(body.password ?? '');
    // Neon Auth is asked even for non-admins so response times don't reveal who is an admin.
    const result = email && password ? await callAuth(request, path, { email, password }) : null;
    if (!admin || !result?.ok) {
      await logEvent(actor, 'sign_in_failed', { label: admin ? 'Wrong password' : 'Email is not an admin' });
      return json({ code: 'INVALID_EMAIL_OR_PASSWORD', message: 'Wrong email or password.' }, 401);
    }
    await logEvent(actor, 'sign_in', { label: 'Password accepted' });
    return result.response;
  }

  if (path === 'email-otp/request-password-reset') {
    const recent = await recentEvents('password_reset_requested', email, actor.ip, 60);
    if (recent.byEmail >= 3 || recent.byIp >= 10) {
      return json({ code: 'TOO_MANY_ATTEMPTS', message: 'Too many codes requested. Try again in an hour.' }, 429);
    }
    await logEvent(actor, 'password_reset_requested', admin ? {} : { label: 'Email is not an admin — no code sent' });
    // Same answer either way, so the form doesn't reveal who has access.
    if (!admin) return json({ success: true });
    const result = await callAuth(request, path, { email });
    return result.ok ? json({ success: true }) : json({ message: 'Could not send the code. Try again in a few minutes.' }, 502);
  }

  // email-otp/reset-password
  if (tooMany(await recentEvents('password_reset_failed', email, actor.ip, LOCK_MINUTES))) {
    return json({ code: 'TOO_MANY_ATTEMPTS', message: `Too many failed attempts. Try again in ${LOCK_MINUTES} minutes.` }, 429);
  }
  const password = String(body.password ?? '');
  const problem = passwordProblem(password);
  if (problem) return json({ code: 'WEAK_PASSWORD', message: problem }, 400);
  const result = admin ? await callAuth(request, path, { email, otp: String(body.otp ?? '').trim(), password }) : null;
  if (!result?.ok) {
    await logEvent(actor, 'password_reset_failed', { label: admin ? 'Wrong or expired code' : 'Email is not an admin' });
    return json({ code: 'INVALID_OTP', message: 'That code is wrong or has expired. Request a new one.' }, 400);
  }
  // Every admin session must enter an authenticator code again.
  await sql`delete from admin_mfa_sessions where email = ${email}`;
  await logEvent(actor, 'password_reset');
  return json({ success: true });
}

/* ---------------- Sessions ---------------- */

/** Read the signed-in user from the request cookies. Returns refreshed cookies to pass back. */
export async function getSession(request: Request): Promise<{ data: SessionData; cookies: string[] }> {
  const sessionRequest = new Request(new URL('/api/auth/get-session', request.url), {
    method: 'GET',
    headers: request.headers,
  });
  const response = await handleAuthProxyRequest({ request: sessionRequest, path: 'get-session', ...proxyConfig() });
  const body = response.ok ? await response.json().catch(() => null) : null;
  return { data: parseSessionData(body), cookies: response.headers.getSetCookie() };
}

type AdminRow = { email: string; name: string; role: AdminRole; office: string | null; totp_enabled: boolean; verified: boolean };

const toAdmin = (row: AdminRow): AdminUser => ({
  email: row.email,
  name: row.name,
  role: row.role,
  office: row.office,
  totpEnabled: row.totp_enabled,
});

export async function findAdmin(email: string | null | undefined): Promise<AdminUser | null> {
  if (!email) return null;
  const [row] = await sql`
    select email, name, role, office, totp_enabled_at is not null as totp_enabled from admin_users where email = ${email}`;
  return row ? toAdmin(row as AdminRow) : null;
}

/** Works out how far this request's session has got through sign-in. */
export async function resolveAccess(request: Request): Promise<{ access: AdminAccess; cookies: string[] }> {
  const { data, cookies } = await getSession(request);
  const email = data.user?.email?.toLowerCase() ?? null;
  const sessionId = data.session?.id ?? null;
  const base = { email, sessionId, sessionExpiresAt: data.session ? new Date(data.session.expiresAt) : null };
  if (!email || !sessionId) return { access: { ...base, stage: 'signed-out', admin: null }, cookies };

  const [row] = (await sql`
    with found as (
      select a.email, a.name, a.role, a.office, a.totp_enabled_at is not null as totp_enabled,
        exists (select 1 from admin_mfa_sessions m
                where m.session_id = ${sessionId} and m.email = a.email and m.expires_at > now()) as verified
      from admin_users a where a.email = ${email}
    ),
    touch as (
      update admin_users set last_seen_at = now()
      where email = ${email} and (last_seen_at is null or last_seen_at < now() - interval '15 minutes')
        and exists (select 1 from found where verified)
    )
    select * from found`) as AdminRow[];

  if (!row) return { access: { ...base, stage: 'not-admin', admin: null }, cookies };
  const stage: AuthStage = !row.totp_enabled ? 'needs-setup' : row.verified ? 'ok' : 'needs-code';
  return { access: { ...base, stage, admin: toAdmin(row) }, cookies };
}

/** Record that this session passed the authenticator check. */
export async function markSessionVerified(access: AdminAccess) {
  if (!access.sessionId || !access.email) return;
  const limit = Date.now() + CODE_VALID_HOURS * 3600_000;
  const expires = new Date(Math.min(limit, access.sessionExpiresAt?.getTime() ?? limit));
  await sql`
    insert into admin_mfa_sessions (session_id, email, expires_at) values (${access.sessionId}, ${access.email}, ${expires})
    on conflict (session_id) do update set verified_at = now(), expires_at = excluded.expires_at`;
  await sql`delete from admin_mfa_sessions where expires_at < now() - interval '1 day'`;
}

/** Require the authenticator code again on every other session of this admin. */
export async function forgetOtherSessions(email: string, keepSessionId: string | null) {
  await sql`delete from admin_mfa_sessions where email = ${email} and session_id is distinct from ${keepSessionId}`;
}

/* ---------------- Authenticator app ---------------- */

/** The secret being set up; the same one is shown again if the page is reloaded. */
export async function pendingTotpSecret(email: string): Promise<string> {
  const [row] = await sql`select totp_pending_secret from admin_users where email = ${email}`;
  if (row?.totp_pending_secret) {
    try {
      return decryptSecret(row.totp_pending_secret);
    } catch {
      // Encryption key changed since; start again below.
    }
  }
  const secret = newTotpSecret();
  await sql`update admin_users set totp_pending_secret = ${encryptSecret(secret)} where email = ${email}`;
  return secret;
}

/** Turns the authenticator on once the first code matches. Returns new recovery codes, or null if the code is wrong. */
export async function confirmTotpSetup(email: string, code: string): Promise<string[] | null> {
  const [row] = await sql`select totp_pending_secret from admin_users where email = ${email}`;
  if (!row?.totp_pending_secret) return null;
  const step = verifyTotp(decryptSecret(row.totp_pending_secret), code, null);
  if (step === null) return null;
  const codes = newRecoveryCodes();
  await sql.transaction([
    sql`update admin_users set totp_secret = totp_pending_secret, totp_pending_secret = null, totp_enabled_at = now(),
        totp_last_step = ${step} where email = ${email}`,
    sql`delete from admin_recovery_codes where email = ${email}`,
    sql`insert into admin_recovery_codes (email, code_hash) select ${email}, unnest(${codes.map(hashRecoveryCode)}::text[])`,
  ]);
  return codes;
}

/** Checks an authenticator code; each code works only once. */
export async function checkTotp(email: string, code: string): Promise<boolean> {
  const [row] = await sql`select totp_secret, totp_last_step from admin_users where email = ${email}`;
  if (!row?.totp_secret) return false;
  const step = verifyTotp(decryptSecret(row.totp_secret), code, row.totp_last_step === null ? null : Number(row.totp_last_step));
  if (step === null) return false;
  const updated = await sql`
    update admin_users set totp_last_step = ${step}
    where email = ${email} and (totp_last_step is null or totp_last_step < ${step}) returning 1`;
  return updated.length === 1;
}

/** Uses up a recovery code. Returns how many are left, or null if the code is not valid. */
export async function useRecoveryCode(email: string, code: string): Promise<number | null> {
  const used = await sql`
    update admin_recovery_codes set used_at = now()
    where email = ${email} and code_hash = ${hashRecoveryCode(code)} and used_at is null returning 1`;
  if (used.length === 0) return null;
  return recoveryCodesLeft(email);
}

export async function recoveryCodesLeft(email: string): Promise<number> {
  const [row] = await sql`select count(*)::int as n from admin_recovery_codes where email = ${email} and used_at is null`;
  return Number(row.n);
}

export async function replaceRecoveryCodes(email: string): Promise<string[]> {
  const codes = newRecoveryCodes();
  await sql.transaction([
    sql`delete from admin_recovery_codes where email = ${email}`,
    sql`insert into admin_recovery_codes (email, code_hash) select ${email}, unnest(${codes.map(hashRecoveryCode)}::text[])`,
  ]);
  return codes;
}

/** Master admin action: the person sets up their authenticator again at next sign-in. */
export async function resetTwoFactor(email: string) {
  await sql.transaction([
    sql`update admin_users set totp_secret = null, totp_pending_secret = null, totp_enabled_at = null, totp_last_step = null
        where email = ${email}`,
    sql`delete from admin_recovery_codes where email = ${email}`,
    sql`delete from admin_mfa_sessions where email = ${email}`,
  ]);
}

/** Neon Auth user id for an email (Neon Auth keeps its users in the neon_auth schema of this database). */
export async function authUserId(email: string): Promise<string | null> {
  const [row] = await sql`select id from neon_auth."user" where lower(email) = ${email}`;
  return row ? String(row.id) : null;
}
