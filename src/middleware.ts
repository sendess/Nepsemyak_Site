import { defineMiddleware } from 'astro:middleware';

const isAdminArea = (path: string) => path === '/admin' || path.startsWith('/admin/') || path.startsWith('/api/admin/');

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.admin = null;
  const { pathname } = context.url;
  if (context.isPrerendered || !isAdminArea(pathname)) return next();

  // Loaded only for admin requests, so building static pages never needs database secrets.
  const { findAdmin, getSession } = await import('./lib/auth');
  const { data, cookies } = await getSession(context.request);
  const signedInEmail = data.user?.email?.toLowerCase() ?? null;
  let admin = await findAdmin(signedInEmail);

  // Local development only: act as an allowlisted admin without email codes.
  // `import.meta.env.DEV` is false in production builds, so this branch is removed there.
  if (import.meta.env.DEV && !admin && import.meta.env.DEV_ADMIN_EMAIL) {
    admin = await findAdmin(String(import.meta.env.DEV_ADMIN_EMAIL).toLowerCase());
  }

  context.locals.admin = admin;
  context.locals.signedInEmail = signedInEmail;

  const isLogin = pathname === '/admin/login' || pathname === '/admin/login/';
  let response: Response;

  if (admin || isLogin) {
    response = await next();
  } else if (pathname.startsWith('/api/admin/')) {
    response = new Response(JSON.stringify({ message: 'Sign in required' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  } else {
    const login = new URL('/admin/login', context.url);
    if (signedInEmail) login.searchParams.set('denied', '1');
    else if (pathname !== '/admin' && pathname !== '/admin/') login.searchParams.set('next', pathname + context.url.search);
    response = new Response(null, { status: 303, headers: { Location: login.pathname + login.search } });
  }

  // Copy so headers are writable, then pass refreshed session cookies through.
  const out = new Response(response.body, response);
  for (const cookie of cookies) out.headers.append('Set-Cookie', cookie);
  out.headers.set('Cache-Control', 'private, no-store');
  out.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return out;
});
