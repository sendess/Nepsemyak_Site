// Admin sign-in pages, shared by the middleware and the pages themselves.

export const LOGIN = '/admin/login';
export const CODE = '/admin/two-factor';
export const SETUP = '/admin/two-factor/setup';
/** Open at any stage: setting a password is how new admins get started. */
export const RESET = '/admin/reset-password';

export const trimSlash = (path: string) => path.replace(/\/+$/, '') || '/';

/** Where to go after a sign-in step: only admin pages, never the sign-in steps themselves. */
export function safeNext(value: string | null | undefined): string {
  if (!value || !/^\/admin(\/[\w\-/?=&%.]*)?$/.test(value)) return '/admin';
  const path = trimSlash(value.split('?')[0]);
  return [LOGIN, CODE, SETUP, RESET].includes(path) ? '/admin' : value;
}
