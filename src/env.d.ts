declare namespace App {
  interface Locals {
    /** Admin who has fully signed in (password + authenticator code); null otherwise. */
    admin: import('./lib/auth').AdminUser | null;
    /** Sign-in progress for /admin requests; null elsewhere. */
    auth: import('./lib/auth').AdminAccess | null;
    /** Set by the Netlify adapter (used for work that may finish after the response, e.g. email alerts). */
    netlify?: import('@astrojs/netlify').NetlifyLocals['netlify'];
  }
}

interface ImportMetaEnv {
  /** Local development only — see src/middleware.ts. */
  readonly DEV_ADMIN_EMAIL?: string;
}
