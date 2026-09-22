// Admin sign-in pages, shared by the middleware and the pages themselves.

export const LOGIN = '/admin/login';
export const CODE = '/admin/two-factor';
export const SETUP = '/admin/two-factor/setup';
/** Open at any stage: setting a password is how new admins get started. */
export const RESET = '/admin/reset-password';
export const HELP = '/admin/help';
/** Shown when someone opens a part of the panel their role doesn't include. */
export const NO_ACCESS = '/admin/no-access';

/** Help topics anyone may read before signing in: new staff need them to get started. */
export const PUBLIC_HELP = ['getting-started', 'roles', 'safety', 'troubleshooting', 'glossary'];

/** Pages open at any sign-in stage. */
export const isOpenPage = (path: string) =>
  path === RESET || path === HELP || PUBLIC_HELP.some((slug) => path === `${HELP}/${slug}`);

export const trimSlash = (path: string) => path.replace(/\/+$/, '') || '/';

/** Where to go after a sign-in step: only admin pages, never the sign-in steps themselves. */
export function safeNext(value: string | null | undefined): string {
  if (!value || !/^\/admin(\/[\w\-/?=&%.]*)?$/.test(value)) return '/admin';
  const path = trimSlash(value.split('?')[0]);
  return [LOGIN, CODE, SETUP, RESET].includes(path) ? '/admin' : value;
}
