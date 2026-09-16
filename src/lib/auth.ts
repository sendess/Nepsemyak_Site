import { handleAuthProxyRequest, parseSessionData, type SessionData } from '@neondatabase/auth/server';
import { NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET } from 'astro:env/server';
import { sql } from './db';

export type AdminRole = 'owner' | 'editor';
export type AdminUser = { email: string; name: string; role: AdminRole };

const proxyConfig = () => ({
  baseUrl: NEON_AUTH_BASE_URL,
  cookieSecret: NEON_AUTH_COOKIE_SECRET,
  sameSite: 'lax' as const,
});

/** Neon Auth endpoints the site exposes. Everything else (password sign-up, OAuth…) is refused. */
const ALLOWED_PATHS = new Set(['get-session', 'sign-out', 'email-otp/send-verification-otp', 'sign-in/email-otp']);
/** Endpoints that only work for emails on the admin allowlist. */
const ALLOWLIST_PATHS = new Set(['email-otp/send-verification-otp', 'sign-in/email-otp']);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

/** Forward a browser request from /api/auth/* to Neon Auth, keeping cookies first-party. */
export async function proxyAuthRequest(request: Request, path: string): Promise<Response> {
  if (!ALLOWED_PATHS.has(path)) return json({ message: 'Not found' }, 404);

  if (ALLOWLIST_PATHS.has(path)) {
    if (request.method !== 'POST') return json({ message: 'Method not allowed' }, 405);
    const body = await request.text();
    let email = '';
    try {
      email = String(JSON.parse(body).email ?? '').trim().toLowerCase();
    } catch {
      return json({ message: 'Invalid request' }, 400);
    }
    if (!(await findAdmin(email))) {
      // Same answer as a real send, so the form doesn't reveal which emails have access.
      if (path === 'email-otp/send-verification-otp') return json({ success: true });
      return json({ code: 'INVALID_OTP', message: 'Invalid code' }, 400);
    }
    request = new Request(request.url, { method: 'POST', headers: request.headers, body });
  }

  return handleAuthProxyRequest({ request, path, ...proxyConfig() });
}

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

/** Allowlist lookup; also records when the admin was last active (at most every 15 minutes). */
export async function findAdmin(email: string | null | undefined): Promise<AdminUser | null> {
  if (!email) return null;
  const rows = await sql`
    with found as (select email, name, role from admin_users where email = ${email}),
    touch as (
      update admin_users set last_seen_at = now()
      where email = ${email} and (last_seen_at is null or last_seen_at < now() - interval '15 minutes')
    )
    select * from found`;
  return (rows[0] as AdminUser | undefined) ?? null;
}
