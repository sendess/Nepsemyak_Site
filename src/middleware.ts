import { defineMiddleware } from 'astro:middleware';
import type { AuthStage } from './lib/auth';
import { CODE, LOGIN, NO_ACCESS, SETUP, isOpenPage, safeNext, trimSlash } from './lib/admin-routes';
import { can, requiredPermission } from './lib/roles';

const isAdminArea = (path: string) => path === '/admin' || path.startsWith('/admin/') || path.startsWith('/api/admin/');

/** The page this sign-in stage belongs on, or null if the requested page may be shown. */
function redirectFor(stage: AuthStage, path: string, url: URL): string | null {
  const here = path === LOGIN || path === CODE ? url.searchParams.get('next') : path + url.search;
  const withNext = (page: string) => {
    const next = safeNext(here);
    return next === '/admin' ? page : `${page}?next=${encodeURIComponent(next)}`;
  };
  switch (stage) {
    case 'ok':
      return path === LOGIN || path === CODE || path === SETUP ? safeNext(url.searchParams.get('next')) : null;
    case 'needs-code':
      return path === CODE ? null : withNext(CODE);
    case 'needs-setup':
      return path === SETUP ? null : SETUP;
    default:
      return path === LOGIN ? null : withNext(LOGIN);
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.admin = null;
  context.locals.auth = null;
  const { pathname } = context.url;
  if (context.isPrerendered || !isAdminArea(pathname)) return next();

  // Loaded only for admin requests, so building static pages never needs database secrets.
  const { findAdmin, resolveAccess } = await import('./lib/auth');
  const { access, cookies } = await resolveAccess(context.request);

  // Local development only: act as an allowlisted admin without password or authenticator.
  // `import.meta.env.DEV` is false in production builds, so this branch is removed there.
  if (import.meta.env.DEV && access.stage !== 'ok' && import.meta.env.DEV_ADMIN_EMAIL) {
    const devAdmin = await findAdmin(String(import.meta.env.DEV_ADMIN_EMAIL).toLowerCase());
    if (devAdmin) Object.assign(access, { stage: 'ok', admin: devAdmin, email: devAdmin.email });
  }

  context.locals.auth = access;
  context.locals.admin = access.stage === 'ok' ? access.admin : null;

  const path = trimSlash(pathname);
  let response: Response;
  // Signed in, but is this part of the panel (or this kind of change) allowed for their role?
  const needed = requiredPermission(path, context.request.method);
  const allowed = !needed || can(context.locals.admin, needed);
  const json = (message: string, status: number) =>
    new Response(JSON.stringify({ message }), { status, headers: { 'content-type': 'application/json' } });

  if (pathname.startsWith('/api/admin/')) {
    response = access.stage !== 'ok' ? json('Sign in required', 401) : allowed ? await next() : json('Not allowed for your role', 403);
  } else {
    const target = isOpenPage(path) ? null : redirectFor(access.stage, path, context.url);
    if (target) response = new Response(null, { status: 303, headers: { Location: target } });
    else if (access.stage === 'ok' && !allowed) response = new Response(null, { status: 303, headers: { Location: NO_ACCESS } });
    else response = await next();
  }

  // Copy so headers are writable, then pass refreshed session cookies through.
  const out = new Response(response.body, response);
  for (const cookie of cookies) out.headers.append('Set-Cookie', cookie);
  out.headers.set('Cache-Control', 'private, no-store');
  out.headers.set('X-Robots-Tag', 'noindex, nofollow');
  out.headers.set('Referrer-Policy', 'same-origin');
  return out;
});
